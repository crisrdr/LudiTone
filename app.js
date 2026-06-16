

const playBTN = document.getElementById("play-btn");
const stopBTN = document.getElementById("stop-btn");
const feedbackBTN = document.getElementById("feedback-btn");
const feedbackHomeBTN = document.getElementById("feedback-home-btn");
const clearBTN = document.getElementById("clear-btn");
let timeDur = 0; // control duración notas
let num = 0; // control número de synths 
let seqNum = 0; // control variables loop 
const liveBTN = document.getElementById("live-btn");
let isLiveMode = false;
let liveTimeout = null;
const feedbackLink = "https://forms.cloud.microsoft/e/giJmU1f55C";

// registro de synths/effects
let activeSynths = [];
let activeLoops = {};

// aviso de colocación
let _blockWarningTimer = null;
function showBlockWarning(message) {
  const toast = document.getElementById('block-warning-toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  if (_blockWarningTimer) clearTimeout(_blockWarningTimer);
  _blockWarningTimer = setTimeout(() => {
    toast.classList.remove('show');
    _blockWarningTimer = null;
  }, 2500);
}

// para transport y silencio de todos los bloques
function stopAll() {
  Tone.Transport.stop();
  Tone.Transport.cancel(0);
  activeSynths.forEach(node => {
    try {
      if (typeof node.releaseAll === 'function') node.releaseAll(0);
      if (typeof node.triggerRelease === 'function') node.triggerRelease(0);
      node.disconnect();
      node.dispose();
    } catch (e) { /* ya se ha liberado */ }
  });
  activeSynths = [];

  // Detener y limpiar todos los bucles globales activos
  Object.keys(activeLoops).forEach(id => {
    try {
      Tone.Transport.clear(activeLoops[id].id);
    } catch (e) {}
  });
  activeLoops = {};
}

// Generar código JavaScript
async function runCode(isLiveUpdate = false) {

  // compilar cada grupo de bloques de forma independiente
  Blockly.JavaScript.addReservedWords('code');
  Blockly.JavaScript.isLiveMode = isLiveMode;
  Blockly.JavaScript.init(workspace);
  const topBlocks = workspace.getTopBlocks(true);
  const currentTopBlockIds = new Set(topBlocks.map(b => b.id));

  // Limpiar cualquier bucle que ya no esté en el lienzo
  Object.keys(activeLoops).forEach(id => {
    if (!currentTopBlockIds.has(id)) {
      try {
        Tone.Transport.clear(activeLoops[id].id);
      } catch (e) {}
      // Liberar sus synths asociados de forma inmediata
      if (activeLoops[id].synths) {
        activeLoops[id].synths.forEach(s => {
          try {
            if (typeof s.releaseAll === 'function') s.releaseAll(0.1);
            s.dispose();
          } catch(e) {}
        });
      }
      delete activeLoops[id];
    }
  });

  let codeParts = [];

  topBlocks.forEach((block, idx) => {
    let blockCode = Blockly.JavaScript.blockToCode(block);
    if (Array.isArray(blockCode)) {
      blockCode = blockCode[0];
    }
    if (blockCode) {
      let startTime;
      const oldLoop = activeLoops[block.id];
      if (isLiveMode && oldLoop) {
        // Calcular inicio del siguiente ciclo de forma precisa
        const transportTime = Tone.Transport.seconds;
        let nextCycleStart = oldLoop.start + Math.ceil((transportTime - oldLoop.start) / oldLoop.duration) * oldLoop.duration;
        while (nextCycleStart < transportTime + 0.1) {
          nextCycleStart += oldLoop.duration;
        }
        startTime = nextCycleStart;

        // Limpiar el bucle viejo del transporte
        try {
          Tone.Transport.clear(oldLoop.id);
        } catch(e) {}

        // Programar la liberación diferida de los synths del ciclo anterior
        const delayMs = (nextCycleStart - transportTime) * 1000 + 500;
        const synthsToDispose = oldLoop.synths || [];
        setTimeout(() => {
          synthsToDispose.forEach(s => {
            try {
              if (typeof s.releaseAll === 'function') s.releaseAll(0.1);
              s.dispose();
            } catch(e) {}
          });
        }, Math.max(0, delayMs));

        delete activeLoops[block.id];
      } else {
        startTime = isLiveUpdate ? (Tone.Transport.seconds + 0.15) : 0;
      }

      if (isLiveMode) {
        const runCodeBlock = `
// --- Grupo de bloques ${idx + 1} (Loop Automático) ---
(function() {
  var events = [];
  var localTimeDur = 0;
  var start = ${startTime};
  
  tempSynths = []; // reset capture array
  
  var originalSchedule = Tone.Transport.schedule;
  Tone.Transport.schedule = function(callback, absoluteTime) {
    events.push({ callback: callback, offset: absoluteTime - start });
  };
  
  (function() {
    var timeDur = start;
    ${blockCode}
    localTimeDur = timeDur - start;
  })();
  
  Tone.Transport.schedule = originalSchedule;
  
  if (localTimeDur > 0 && events.length > 0) {
    var loopId = Tone.Transport.scheduleRepeat(function(loopCallbackTime) {
      events.forEach(function(ev) {
        ev.callback(loopCallbackTime + ev.offset);
      });
    }, localTimeDur, start);
    _regLoop("${block.id}", loopId, start, localTimeDur, [...tempSynths]);
  }
})();
`;
        codeParts.push(runCodeBlock);
      } else {
        codeParts.push(`\n// --- Grupo de bloques ${idx + 1} ---\ntimeDur = ${startTime};\n${blockCode}`);
      }
    }
  });

  let code = codeParts.join('\n');
  code = Blockly.JavaScript.finish(code);

  // Inyectamos helpers para que el código generado se registre solo
  const preamble =
    `let current_dest = Tone.Destination;\n` +
    `let tempSynths = [];\n` +
    `function _reg(node){ 
      tempSynths.push(node);
      activeSynths.push(node); 
      return node; 
    }\n` +
    `function _regLoop(blockId, id, start, duration, synths){
      activeLoops[blockId] = { id: id, start: start, duration: duration, synths: synths };
    }\n`;

  // Envolver cada tonesynth para que se registre automáticamente
  const instrumentedCode = code.replace(
    /new\s+(Tone\.[A-Z][A-Za-z]+(?:\([^)]*\))?)/g,
    '_reg(new $1)'
  );

  wrapCode = preamble + instrumentedCode;

  console.log(wrapCode);
  // evaluar código
  try {
    await Tone.start(); // Hacemos doble check al contexto de audio con un gesto
    eval(wrapCode);

    // Si no es una actualización en vivo, arrancamos el transporte
    if (!isLiveUpdate) {
      await Tone.Transport.start();
    }
  } catch (e) {
    alert(e);
  }
}

playBTN.addEventListener("click", () => {
  if (isLiveMode) return; // Bloquea el play manual si el modo live está activo
  stopAll();
  timeDur = 0;
  num = 0;
  seqNum = 0;
  runCode();
})

stopBTN.addEventListener("click", () => {
  if (isLiveMode) return; // Bloquea el stop manual si el modo live está activo
  stopAll();
})

liveBTN.addEventListener("click", () => {
  isLiveMode = !isLiveMode;
  if (isLiveMode) {
    liveBTN.textContent = "Modo Live: ON";
    liveBTN.classList.add("live-active");
    playBTN.disabled = true;
    stopBTN.disabled = true;

    // Al activar, empieza a sonar de inmediato
    stopAll();
    timeDur = 0;
    num = 0;
    seqNum = 0;
    runCode();
  } else {
    liveBTN.textContent = "Modo Live: OFF";
    liveBTN.classList.remove("live-active");
    playBTN.disabled = false;
    stopBTN.disabled = false;

    // Al desactivar, paramos todo
    stopAll();
  }
});

// Función para actualizaciones live
async function liveUpdate() {
  if (!isLiveMode) return;

  if (liveTimeout) clearTimeout(liveTimeout);

  liveTimeout = setTimeout(async () => {
    console.log("Live Update Triggered...");

    // Reseteamos contadores para el nuevo código
    num = 0;

    // Ejecutar código sin reiniciar el transporte
    await runCode(true);

  }, 600); // Debounce de 600ms
}

feedbackBTN.addEventListener("click", () => {
  window.open(feedbackLink, "_blank");
});

feedbackHomeBTN.addEventListener("click", () => {
  window.open(feedbackLink, "_blank");
});

// --- FUNCIONALIDAD DE BLOQUES PERSONALIZADOS (MACROS) ---
let customUserBlocks = JSON.parse(localStorage.getItem('blocklyMusicCustomBlocks') || '[]');

function removeCustomBlock(id) {
  customUserBlocks = customUserBlocks.filter(b => b.id !== id);
  localStorage.setItem('blocklyMusicCustomBlocks', JSON.stringify(customUserBlocks));
  // Actualizar toolbox
  let baseToolbox = toolboxFree;
  switch (currentLevel) {
    case 'basic': baseToolbox = toolboxBasic; break;
    case 'intermediate': baseToolbox = toolboxIntermediate; break;
    case 'advanced': baseToolbox = toolboxAdvanced; break;
    case 'sound': baseToolbox = toolboxSound; break;
  }
  const dynamicToolbox = applyCustomBlocksTo(baseToolbox, currentLevel);
  workspace.updateToolbox(dynamicToolbox);
  colorizeBubbles();
}

function registerCustomBlockDef(blockData) {
  // definimos el bloque visualmente
  Blockly.Blocks[blockData.id] = {
    init: function () {
      this.appendDummyInput().appendField(blockData.name);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(blockData.color || 290);
      this.setTooltip("Bloque personalizado — Clic derecho para opciones");
    },
    customContextMenu: function (options) {
      const thisBlock = this;
      const inFlyout = thisBlock.isInFlyout;

      if (inFlyout) {
        // -- MENÚ LATERAL: Editar nombre/color y Eliminar --

        options.push({
          text: '✏️ Editar bloque',
          enabled: true,
          callback: function () {
            openModalForEdit(blockData);
          }
        });

        options.push({
          text: '🗑️ Eliminar del menú',
          enabled: true,
          callback: function () {
            if (window.confirm("¿Eliminar \"" + blockData.name + "\" de Mis Bloques?\nEsta acción no se puede deshacer.")) {
              removeCustomBlock(blockData.id);
            }
          }
        });

      } else {
        // -- ÁREA DE TRABAJO: Desempaquetar para editar internamente --

        options.push({
          text: 'Desempaquetar bloque',
          enabled: true,
          callback: function () {
            try {
              const xmlDom = Blockly.Xml.textToDom(blockData.xml);
              const blockXmlNode = xmlDom.firstElementChild;
              if (!blockXmlNode) return;

              const xy = thisBlock.getRelativeToSurfaceXY();
              const prevConn = thisBlock.previousConnection && thisBlock.previousConnection.targetConnection;
              const nextConn = thisBlock.nextConnection && thisBlock.nextConnection.targetConnection;

              if (prevConn) thisBlock.previousConnection.disconnect();
              if (nextConn) thisBlock.nextConnection.disconnect();

              const newBlock = Blockly.Xml.domToBlock(blockXmlNode, workspace);
              newBlock.moveTo(xy);

              if (prevConn && newBlock.previousConnection) {
                prevConn.connect(newBlock.previousConnection);
              }

              if (nextConn && newBlock.nextConnection) {
                let lastBlock = newBlock;
                while (lastBlock.getNextBlock()) lastBlock = lastBlock.getNextBlock();
                if (lastBlock.nextConnection) lastBlock.nextConnection.connect(nextConn);
              }

              thisBlock.dispose(false);

            } catch (e) {
              console.error("Error al desempaquetar bloque:", e);
              alert("No se pudo desempaquetar el bloque. Revisa la consola.");
            }
          }
        });
      }
    }
  };

  // definimos su generador en JavaScript
  Blockly.JavaScript[blockData.id] = function (block) {
    const headless = new Blockly.Workspace();
    try {
      const xmlDom = Blockly.Xml.textToDom(blockData.xml);
      Blockly.Xml.domToWorkspace(xmlDom, headless);
      const code = Blockly.JavaScript.workspaceToCode(headless);
      return code;
    } catch (e) {
      console.error("Error ejecutando macro", e);
      return "";
    } finally {
      headless.dispose();
    }
  };
}

// Registramos al arrancar
customUserBlocks.forEach(registerCustomBlockDef);

function applyCustomBlocksTo(toolboxDef, levelName) {
  // En Libre y Crear Sonido se muestran SIEMPRE todos los bloques personalizados
  let matching;
  if (levelName === 'free' || levelName === 'sound') {
    matching = customUserBlocks;
  } else {
    matching = customUserBlocks.filter(b => {
      const levels = b.levels || []; // sin entrada = no aparece en básico/intermedio/avanzado
      return levels.includes(levelName);
    });
  }
  if (matching.length === 0) return toolboxDef;

  // Clonación profunda
  let newToolbox = JSON.parse(JSON.stringify(toolboxDef));
  let blocksNodes = matching.map(b => ({ kind: 'block', type: b.id }));

  newToolbox.contents.push({
    kind: 'category',
    name: 'Mis Sonidos',
    colour: '60',
    contents: blocksNodes
  });
  return newToolbox;
}


const toolboxBasic = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: "category",
      name: "",
      colour: "0",
      contents: [
        { kind: 'block', type: 'note_mt' },
        { kind: 'block', blockxml: note_mt_vol },
        { kind: 'block', blockxml: note_mt_dur },
        { kind: 'block', type: 'opt_mt_volume' },
        { kind: 'block', type: 'opt_mt_duration' }
      ]
    }
  ]
};

const toolboxIntermediate = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: "category", name: "Control", colour: "212",
      contents: [
        { kind: 'block', type: 'repeat' },
        { kind: 'block', type: 'loop' },
        { kind: 'block', type: 'wait', fields: { NUM: 1 } }
      ]
    },
    {
      kind: "category", name: "Notas", colour: "20",
      contents: [
        {
          kind: 'category', name: 'Puzzle', colour: '20', contents: [
            { kind: 'block', type: 'note_mt' },
            { kind: 'block', type: 'semitone_mt' },
            { kind: 'block', type: 'chord_mt' }
          ]
        },
        {
          kind: 'category', name: 'Caja', colour: '20', contents: [
            { kind: 'block', type: 'note_st' },
            { kind: 'block', type: 'semitone_st' },
            { kind: 'block', type: 'chord_st' }
          ]
        }
      ]
    },
    {
      kind: "category", name: "Opciones", colour: "120",
      contents: [
        {
          kind: "category", name: "Opciones puzzle", colour: "120",
          contents: [
            { kind: 'block', type: 'opt_mt_duration' },
            { kind: 'block', type: 'opt_mt_volume' },
            { kind: 'block', type: 'opt_mt_wave_shape' }
          ]
        },
        {
          kind: "category", name: "Opciones caja", colour: "160",
          contents: [
            { kind: 'block', type: 'opt_st_duration' },
            { kind: 'block', type: 'opt_st_volume' },
            { kind: 'block', type: 'opt_st_wave_shape' }
          ]
        }
      ]
    }
  ]
};

const toolboxAdvanced = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: "category", name: "Control", colour: "212",
      contents: [
        { kind: 'block', type: 'repeat' },
        { kind: 'block', type: 'loop' },
        { kind: 'block', type: 'wait', fields: { NUM: 1 } }
      ]
    },
    {
      kind: "category", name: "Notas", colour: "20",
      contents: [
        {
          kind: 'category', name: 'Puzzle', colour: '20', contents: [
            { kind: 'block', type: 'note_mt_oc' },
            { kind: 'block', type: 'semitone_mt_oc' },
            { kind: 'block', type: 'chord_mt_oc' },
            { kind: 'block', type: 'chord_mt_ed' }
          ]
        },
        {
          kind: 'category', name: 'Caja', colour: '20', contents: [
            { kind: 'block', type: 'note_st_oc' },
            { kind: 'block', type: 'semitone_st_oc' },
            { kind: 'block', type: 'chord_st_oc' },
            { kind: 'block', type: 'chord_st_ed' }
          ]
        }
      ]
    },
    {
      kind: "category", name: "Opciones", colour: "120",
      contents: [
        {
          kind: "category", name: "Opciones puzzle", colour: "120",
          contents: [
            { kind: 'block', type: 'opt_mt_duration' },
            { kind: 'block', type: 'opt_mt_volume' },
            { kind: 'block', type: 'opt_mt_wave_shape' },
            { kind: 'block', type: 'opt_mt_kind' },
            { kind: 'block', type: 'opt_mt_attack' },
            { kind: 'block', type: 'opt_mt_decay' },
            { kind: 'block', type: 'opt_mt_sustain' },
            { kind: 'block', type: 'opt_mt_release' },
            { kind: 'block', type: 'opt_mt_adsr' }
          ]
        },
        {
          kind: "category", name: "Opciones caja", colour: "160",
          contents: [
            { kind: 'block', type: 'opt_st_duration' },
            { kind: 'block', type: 'opt_st_volume' },
            { kind: 'block', type: 'opt_st_wave_shape' },
            { kind: 'block', type: 'opt_st_kind' },
            { kind: 'block', type: 'opt_st_attack' },
            { kind: 'block', type: 'opt_st_decay' },
            { kind: 'block', type: 'opt_st_sustain' },
            { kind: 'block', type: 'opt_st_release' },
            { kind: 'block', type: 'opt_st_adsr' }
          ]
        }
      ]
    },
    {
      kind: "category", name: "Efectos", colour: "290",
      contents: [
        {
          kind: "category", name: "Reverberación", colour: "290",
          contents: [
            { kind: 'block', type: 'effect_reverb' },
            { kind: 'block', type: 'effect_jcreverb' },
            { kind: 'block', type: 'effect_freeverb' }
          ]
        },
        {
          kind: "category", name: "Retardo y Eco", colour: "290",
          contents: [
            { kind: 'block', type: 'effect_delay' },
            { kind: 'block', type: 'effect_pingpongdelay' }
          ]
        },
        {
          kind: "category", name: "Modulación", colour: "290",
          contents: [
            { kind: 'block', type: 'effect_chorus' },
            { kind: 'block', type: 'effect_phaser' },
            { kind: 'block', type: 'effect_tremolo' },
            { kind: 'block', type: 'effect_vibrato' }
          ]
        },
        {
          kind: "category", name: "Distorsión", colour: "290",
          contents: [
            { kind: 'block', type: 'effect_distortion' },
            { kind: 'block', type: 'effect_bitcrusher' },
            { kind: 'block', type: 'effect_chebyshev' }
          ]
        },
        {
          kind: "category", name: "Tono", colour: "290",
          contents: [
            { kind: 'block', type: 'effect_pitchshift' }
          ]
        },
        {
          kind: "category", name: "Filtros", colour: "290",
          contents: [
            { kind: 'block', type: 'effect_autofilter' },
            { kind: 'block', type: 'effect_lowpassfilter' },
            { kind: 'block', type: 'effect_highpassfilter' },
            { kind: 'block', type: 'effect_autowah' }
          ]
        },
        {
          kind: "category", name: "Estéreo", colour: "290",
          contents: [
            { kind: 'block', type: 'effect_autopanner' },
            { kind: 'block', type: 'effect_stereowidener' },
            { kind: 'block', type: 'effect_midsideeffect' }
          ]
        }
      ]
    }
  ]
};

const toolboxSound = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: "category", name: "Notas", colour: "20",
      contents: [
        {
          kind: 'category', name: 'Puzzle', colour: '20',
          contents: [
            { kind: 'block', type: 'note_mt' },
            { kind: 'block', type: 'note_mt_oc' },
            { kind: 'block', type: 'semitone_mt' },
            { kind: 'block', type: 'semitone_mt_oc' },
            { kind: 'block', type: 'chord_mt' },
            { kind: 'block', type: 'chord_mt_oc' },
            { kind: 'block', type: 'chord_mt_ed' }
          ]
        },
        {
          kind: 'category', name: 'Cajón', colour: '20',
          contents: [
            { kind: 'block', type: 'note_st' },
            { kind: 'block', type: 'note_st_oc' },
            { kind: 'block', type: 'semitone_st' },
            { kind: 'block', type: 'semitone_st_oc' },
            { kind: 'block', type: 'chord_st' },
            { kind: 'block', type: 'chord_st_oc' },
            { kind: 'block', type: 'chord_st_ed' }
          ]
        }
      ]
    },
    {
      kind: "category", name: "Opciones", colour: "120",
      contents: [
        {
          kind: "category", name: "Opciones Puzzle", colour: "120",
          contents: [
            { kind: 'block', type: 'opt_mt_duration' },
            { kind: 'block', type: 'opt_mt_volume' },
            { kind: 'block', type: 'opt_mt_wave_shape' },
            { kind: 'block', type: 'opt_mt_kind' },
            { kind: 'block', type: 'opt_mt_attack' },
            { kind: 'block', type: 'opt_mt_decay' },
            { kind: 'block', type: 'opt_mt_sustain' },
            { kind: 'block', type: 'opt_mt_release' },
            { kind: 'block', type: 'opt_mt_adsr' }
          ]
        },
        {
          kind: "category", name: "Opciones Cajón", colour: "160",
          contents: [
            { kind: 'block', type: 'opt_st_duration' },
            { kind: 'block', type: 'opt_st_volume' },
            { kind: 'block', type: 'opt_st_wave_shape' },
            { kind: 'block', type: 'opt_st_kind' },
            { kind: 'block', type: 'opt_st_attack' },
            { kind: 'block', type: 'opt_st_decay' },
            { kind: 'block', type: 'opt_st_sustain' },
            { kind: 'block', type: 'opt_st_release' },
            { kind: 'block', type: 'opt_st_adsr' }
          ]
        }
      ]
    }
  ]
};

const toolboxFree = {

  kind: 'categoryToolbox',
  contents: [
    {
      kind: "category",
      name: "Control",
      colour: "212",
      contents: [
        {
          "kind": 'block',
          "type": 'repeat',
        },
        {
          "kind": 'block',
          "type": 'loop',
        },
        {
          "kind": "block",
          "type": "wait",
          "fields": {
            "NUM": 1
          }
        }
      ],
    },
    {
      kind: "category",
      name: "Notas",
      colour: "20",
      contents: [
        {
          kind: "category",
          name: "Notas Puzzle",
          colour: "20",
          contents: [
            {
              kind: 'block',
              type: 'note_mt'
            },
            {
              kind: 'block',
              type: 'note_mt_oc'
            },
            {
              kind: 'block',
              type: 'semitone_mt'
            },
            {
              kind: 'block',
              type: 'semitone_mt_oc'
            },
            {
              kind: 'block',
              type: 'chord_mt'
            },
            {
              kind: 'block',
              type: 'chord_mt_oc'
            },
            {
              kind: 'block',
              type: 'chord_mt_ed'
            }
          ]
        },
        {
          kind: "category",
          name: "Notas Cajón",
          colour: "20",
          contents: [
            {
              kind: 'block',
              type: 'note_st'
            },
            {
              kind: 'block',
              type: 'note_st_oc'
            },
            {
              kind: 'block',
              type: 'semitone_st'
            },
            {
              kind: 'block',
              type: 'semitone_st_oc'
            },
            {
              kind: 'block',
              type: 'chord_st'
            },
            {
              kind: 'block',
              type: 'chord_st_oc'
            },
            {
              kind: 'block',
              type: 'chord_st_ed'
            }
          ]
        }
      ],
    },
    {
      kind: "category",
      name: "Opciones",
      colour: "120",
      contents: [
        {
          kind: "category",
          name: "Opciones Puzzle",
          colour: "120",
          contents: [
            {
              kind: 'block',
              type: 'opt_mt_duration'
            },
            {
              kind: 'block',
              type: 'opt_mt_wave_shape'
            },
            {
              kind: 'block',
              type: 'opt_mt_attack'
            },
            {
              kind: 'block',
              type: 'opt_mt_decay'
            },
            {
              kind: 'block',
              type: 'opt_mt_sustain'
            },
            {
              kind: 'block',
              type: 'opt_mt_release'
            },
            {
              kind: 'block',
              type: 'opt_mt_volume'
            },
            {
              kind: 'block',
              type: 'opt_mt_kind'
            },
            {
              kind: 'block',
              type: 'opt_mt_adsr'
            }
          ]
        },
        {
          kind: "category",
          name: "Opciones Caja",
          colour: "160",
          contents: [
            {
              kind: 'block',
              type: 'opt_st_duration'
            },
            {
              kind: 'block',
              type: 'opt_st_wave_shape'
            },
            {
              kind: 'block',
              type: 'opt_st_attack'
            },
            {
              kind: 'block',
              type: 'opt_st_decay'
            },
            {
              kind: 'block',
              type: 'opt_st_sustain'
            },
            {
              kind: 'block',
              type: 'opt_st_release'
            },
            {
              kind: 'block',
              type: 'opt_st_volume'
            },
            {
              kind: 'block',
              type: 'opt_st_kind'
            },
            {
              kind: 'block',
              type: 'opt_st_adsr'
            }
          ]
        }
      ]
    },
    {
      kind: "category",
      name: "Efectos",
      colour: "290",
      contents: [
        {
          kind: "category", name: "Reverberación", colour: "290",
          contents: [
            { kind: 'block', type: 'effect_reverb' },
            { kind: 'block', type: 'effect_jcreverb' },
            { kind: 'block', type: 'effect_freeverb' }
          ]
        },
        {
          kind: "category", name: "Retardo y Eco", colour: "290",
          contents: [
            { kind: 'block', type: 'effect_delay' },
            { kind: 'block', type: 'effect_pingpongdelay' }
          ]
        },
        {
          kind: "category", name: "Modulación", colour: "290",
          contents: [
            { kind: 'block', type: 'effect_chorus' },
            { kind: 'block', type: 'effect_phaser' },
            { kind: 'block', type: 'effect_tremolo' },
            { kind: 'block', type: 'effect_vibrato' }
          ]
        },
        {
          kind: "category", name: "Distorsión", colour: "290",
          contents: [
            { kind: 'block', type: 'effect_distortion' },
            { kind: 'block', type: 'effect_bitcrusher' },
            { kind: 'block', type: 'effect_chebyshev' }
          ]
        },
        {
          kind: "category", name: "Tono", colour: "290",
          contents: [
            { kind: 'block', type: 'effect_pitchshift' }
          ]
        },
        {
          kind: "category", name: "Filtros", colour: "290",
          contents: [
            { kind: 'block', type: 'effect_autofilter' },
            { kind: 'block', type: 'effect_lowpassfilter' },
            { kind: 'block', type: 'effect_highpassfilter' },
            { kind: 'block', type: 'effect_autowah' }
          ]
        },
        {
          kind: "category", name: "Estéreo", colour: "290",
          contents: [
            { kind: 'block', type: 'effect_autopanner' },
            { kind: 'block', type: 'effect_stereowidener' },
            { kind: 'block', type: 'effect_midsideeffect' }
          ]
        }
      ]
    }
  ],
};

const workspace = Blockly.inject('blocklyDiv', {
  toolbox: toolboxFree,
  scrollbars: true,
  horizontalLayout: false,
  toolboxPosition: 'start',
  zoom: {
    controls: true,
    wheel: true,
    startScale: 1.0,
    maxScale: 3,
    minScale: 0.3,
    scaleSpeed: 1.2
  },
  trashcan: true
});

// --- VARIABLES GLOBALES SEMÁFORO ---
let currentLevel = null;
let isLoadingLevel = false;
let trashcanContentsPerLevel = {};

function colorizeBubbles() {
  setTimeout(() => {
    document.querySelectorAll('.blocklyTreeRow').forEach(row => {
      const labelNode = row.querySelector('.blocklyTreeLabel');
      if (labelNode) {
        const text = labelNode.innerText.trim();
        row.setAttribute('data-category', text);
      }
    });
  }, 100);
}

// selector de nivel
function selectLevel(levelName) {
  if (currentLevel && workspace.trashcan) {
    trashcanContentsPerLevel[currentLevel] = [...workspace.trashcan.contents_];
    if (typeof workspace.trashcan.closeFlyout === 'function') {
      workspace.trashcan.closeFlyout();
    }
  }

  isLoadingLevel = true;
  currentLevel = levelName;

  let selectedToolbox = toolboxFree;
  switch (levelName) {
    case 'basic': selectedToolbox = toolboxBasic; break;
    case 'intermediate': selectedToolbox = toolboxIntermediate; break;
    case 'advanced': selectedToolbox = toolboxAdvanced; break;
    case 'free': selectedToolbox = toolboxFree; break;
    case 'sound': selectedToolbox = toolboxSound; break;
  }

  // Inyectamos los custom blocks filtrados por nivel
  const dynamicToolbox = applyCustomBlocksTo(selectedToolbox, levelName);

  // Desactivamos eventos para que workspace.clear() no envíe bloques a la papelera
  Blockly.Events.disable();

  workspace.clear();
  workspace.updateToolbox(dynamicToolbox);
  colorizeBubbles();

  // --- CONFIGURACIÓN DE ETIQUETAS DINÁMICAS ---
  Blockly.Msg['SIMPLE_NOTE_LABEL'] = (levelName === 'basic') ? 'sonido' : 'nota';
  
  if (levelName === 'basic') {
    document.body.classList.add('basic-mode');
    document.getElementById('create-block-btn').style.display = 'none';
    liveBTN.style.display = 'none';
    setTimeout(() => {
      const toolbox = workspace.getToolbox();
      if (toolbox && typeof toolbox.selectItemByPosition === 'function') {
        toolbox.selectItemByPosition(0);
        const flyout = toolbox.getFlyout();
        if (flyout) flyout.autoClose = false;
      }
    }, 50);
  } else {
    document.body.classList.remove('basic-mode');
    document.getElementById('create-block-btn').style.display = (levelName === 'sound') ? 'inline-block' : 'none';
    liveBTN.style.display = (levelName === 'free') ? 'inline-block' : 'none';

    // reset modo live 
    isLiveMode = false;
    liveBTN.textContent = "Modo Live: OFF";
    liveBTN.classList.remove("live-active");
    playBTN.disabled = false;
    stopBTN.disabled = false;

    // Cerrar el flyout al entrar en el nivel
    setTimeout(() => {
      const toolbox = workspace.getToolbox();
      if (toolbox) {
        if (typeof toolbox.clearSelection === 'function') {
          toolbox.clearSelection();
        }
        const flyout = toolbox.getFlyout();
        if (flyout && typeof flyout.hide === 'function') {
          flyout.hide();
        }
      }
    }, 50);
  }

  // Cargar bloques guardados para este nivel específico
  const savedXml = localStorage.getItem('blocklyMusicParams_' + currentLevel);
  if (savedXml) {
    try {
      const xml = Blockly.Xml.textToDom(savedXml);
      Blockly.Xml.domToWorkspace(xml, workspace);
    } catch (e) {
      console.warn("No se pudo cargar el espacio de trabajo guardado:", e);
    }
  }

  // reactivamos eventos
  Blockly.Events.enable();

  // Restauramos la papelera
  if (workspace.trashcan) {
    workspace.trashcan.contents_ = trashcanContentsPerLevel[levelName] || [];
  }

  isLoadingLevel = false;

  document.getElementById('startup-menu').style.opacity = '0';
  document.getElementById('startup-menu').style.pointerEvents = 'none';
  setTimeout(() => {
    document.getElementById('startup-menu').style.display = 'none';
  }, 400);
}

// Guardar bloques automáticamente ante cualquier cambio estructural
workspace.addChangeListener((e) => {
  if (isLoadingLevel || !currentLevel) return;

  if (e.type !== Blockly.Events.UI && e.type !== Blockly.Events.THEME_CHANGE) {
    const xml = Blockly.Xml.workspaceToDom(workspace);
    const xmlText = Blockly.Xml.domToText(xml);
    localStorage.setItem('blocklyMusicParams_' + currentLevel, xmlText);

    // Si el modo live está activo, disparamos actualización
    if (isLiveMode && (e.type === Blockly.Events.BLOCK_CHANGE || e.type === Blockly.Events.BLOCK_MOVE || e.type === Blockly.Events.BLOCK_CREATE || e.type === Blockly.Events.BLOCK_DELETE)) {
      liveUpdate();
    }
  }
});

// Evento para limpiar el área del nivel actual
clearBTN.addEventListener('click', () => {
  if (!currentLevel) return;
  if (window.confirm("¿Estás seguro de que quieres borrar todos los bloques de este nivel? Esta acción no se puede deshacer.")) {
    isLoadingLevel = true;
    workspace.clear();
    localStorage.removeItem('blocklyMusicParams_' + currentLevel);
    isLoadingLevel = false;
  }
});

// elementos del modal
const modal = document.getElementById('custom-block-modal');
const modalTitle = modal.querySelector('h2');
const nameInput = document.getElementById('block-name-input');
const colorInput = document.getElementById('block-color-input');
const hexDisplay = document.getElementById('color-hex-display');
const btnCancel = document.getElementById('cancel-block-btn');
const btnSave = document.getElementById('save-block-btn');

let pendingBlockSelection = null;
let pendingEditBlockId = null;

// Sincronizamos entrada de color con la pantalla
colorInput.addEventListener('input', (e) => {
  hexDisplay.textContent = e.target.value;
});

// Función para abrir el modal en modo EDITAR
function openModalForEdit(blockData) {
  pendingEditBlockId = blockData.id;
  pendingBlockSelection = null;
  nameInput.value = blockData.name;
  colorInput.value = blockData.color || '#8b5cf6';
  hexDisplay.textContent = blockData.color || '#8b5cf6';
  modalTitle.textContent = 'Editar Bloque';
  // Preseleccionar solo los niveles opcionales (intermedio/avanzado)
  const blockLevels = (blockData.levels || []).filter(l => ['intermediate', 'advanced'].includes(l));
  document.querySelectorAll('.level-checkbox').forEach(cb => {
    cb.checked = blockLevels.includes(cb.value);
  });
  modal.style.display = 'flex';
}

// Crear macro de bloques
document.getElementById('create-block-btn').addEventListener('click', () => {
  let selected = Blockly.selected;
  if (!selected) {
    showBlockWarning('⚠️ Selecciona primero el bloque superior del conjunto que quieres guardar.');
    return;
  }
  pendingEditBlockId = null;
  pendingBlockSelection = selected;
  nameInput.value = '';
  colorInput.value = '#8b5cf6';
  hexDisplay.textContent = '#8b5cf6';
  modalTitle.textContent = 'Crear Nuevo Bloque';
  document.querySelectorAll('.level-checkbox').forEach(cb => { cb.checked = false; });
  modal.style.display = 'flex';
});

btnCancel.addEventListener('click', () => {
  modal.style.display = 'none';
  pendingBlockSelection = null;
  pendingEditBlockId = null;
});

function refreshToolboxAfterUpdate() {
  let baseToolbox = toolboxFree;
  switch (currentLevel) {
    case 'basic': baseToolbox = toolboxBasic; break;
    case 'intermediate': baseToolbox = toolboxIntermediate; break;
    case 'advanced': baseToolbox = toolboxAdvanced; break;
    case 'sound': baseToolbox = toolboxSound; break;
  }
  const dynamicToolbox = applyCustomBlocksTo(baseToolbox, currentLevel);
  workspace.updateToolbox(dynamicToolbox);
  colorizeBubbles();
  if (currentLevel === 'basic') {
    setTimeout(() => {
      const toolbox = workspace.getToolbox();
      if (toolbox && typeof toolbox.selectItemByPosition === 'function') {
        toolbox.selectItemByPosition(0);
        const flyout = toolbox.getFlyout();
        if (flyout) flyout.autoClose = false;
      }
    }, 50);
  }
}

btnSave.addEventListener('click', () => {
  let blockName = nameInput.value;
  if (!blockName || blockName.trim() === "") {
    alert("Por favor, introduce un nombre para el bloque.");
    return;
  }

  if (pendingEditBlockId) {
    // --- MODO EDITAR: actualizar nombre y color del bloque existente ---
    const idx = customUserBlocks.findIndex(b => b.id === pendingEditBlockId);
    if (idx !== -1) {
      const editedLevels = Array.from(document.querySelectorAll('.level-checkbox:checked')).map(cb => cb.value);
      customUserBlocks[idx].name = blockName;
      customUserBlocks[idx].color = colorInput.value;
      customUserBlocks[idx].levels = editedLevels; // solo básico/intermedio/avanzado opcionales
      localStorage.setItem('blocklyMusicCustomBlocks', JSON.stringify(customUserBlocks));
      // Re-registrar el bloque con los nuevos metadatos
      registerCustomBlockDef(customUserBlocks[idx]);
      // Forzar actualización visual de los bloques en el workspace con ese id
      workspace.getAllBlocks(false).forEach(b => {
        if (b.type === pendingEditBlockId) {
          b.setColour(colorInput.value);
          b.getField('').setValue(blockName); // actualiza el label si es posible
        }
      });
      refreshToolboxAfterUpdate();
    }
  } else {
    // --- MODO CREAR: crear nuevo bloque ---
    let dom = Blockly.Xml.blockToDom(pendingBlockSelection);
    let container = document.createElement('xml');
    container.appendChild(dom);
    let xmlText = Blockly.Xml.domToText(container);
    let id = "custom_" + Date.now();
    const selectedLevels = Array.from(document.querySelectorAll('.level-checkbox:checked')).map(cb => cb.value);
    let blockData = { id, name: blockName, color: colorInput.value, xml: xmlText, levels: selectedLevels }; // solo opcionales
    customUserBlocks.push(blockData);
    localStorage.setItem('blocklyMusicCustomBlocks', JSON.stringify(customUserBlocks));
    registerCustomBlockDef(blockData);
    refreshToolboxAfterUpdate();
  }

  modal.style.display = 'none';
  pendingBlockSelection = null;
  pendingEditBlockId = null;
});

document.getElementById('btn-basic').addEventListener('click', () => selectLevel('basic'));
document.getElementById('btn-intermediate').addEventListener('click', () => selectLevel('intermediate'));
document.getElementById('btn-advanced').addEventListener('click', () => selectLevel('advanced'));
document.getElementById('btn-free').addEventListener('click', () => selectLevel('free'));
document.getElementById('btn-sound').addEventListener('click', () => selectLevel('sound'));

document.getElementById('btn-menu').addEventListener('click', () => {
  document.getElementById('startup-menu').style.display = 'flex';
  // timeout para que se muestre antes de la animación
  setTimeout(() => {
    document.getElementById('startup-menu').style.opacity = '1';
    document.getElementById('startup-menu').style.pointerEvents = 'all';
  }, 10);
});
