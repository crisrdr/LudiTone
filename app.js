

const playBTN = document.getElementById("play-btn");
const stopBTN = document.getElementById("stop-btn");
const clearBTN = document.getElementById("clear-btn");
let timeDur = 0; //it controls the duration of the notes
let num = 0; //it controls the number of synths on a given play.
let seqNum = 0; //it controls the sequence loop variables.

// Generate JavaScript code and run it
async function runCode() {

  // convert workspace to text code
  Blockly.JavaScript.addReservedWords('code');
  const code = Blockly.JavaScript.workspaceToCode(workspace);

  wrapCode = "let current_dest = Tone.Destination;\n" + code;

  console.log(wrapCode);
  // evaluate code
  try {
    await Tone.start(); // Hacemos doble check al contexto de audio con un gesto
    eval(wrapCode);
    await Tone.Transport.start();
  } catch (e) {
    alert(e);
  }
}

playBTN.addEventListener("click", () => {
  Tone.Transport.stop();
  Tone.Transport.cancel(0);
  timeDur = 0;
  num = 0;
  seqNum = 0;
  runCode();
})

stopBTN.addEventListener("click", () => {
  Tone.Transport.stop();
  Tone.Transport.cancel(0);
})

// --- FUNCIONALIDAD DE BLOQUES PERSONALIZADOS (MACROS) ---
let customUserBlocks = JSON.parse(localStorage.getItem('blocklyMusicCustomBlocks') || '[]');

function registerCustomBlockDef(blockData) {
    // 1. Definimos el bloque visualmente
    Blockly.Blocks[blockData.id] = {
        init: function() {
            this.appendDummyInput().appendField(blockData.name);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(blockData.color || 290);
            this.setTooltip("Bloque creado por el usuario");
        }
    };
    
    // 2. Definimos su generador en JavaScript
    Blockly.JavaScript[blockData.id] = function(block) {
        const headless = new Blockly.Workspace();
        try {
            const xmlDom = Blockly.Xml.textToDom(blockData.xml);
            Blockly.Xml.domToWorkspace(xmlDom, headless);
            // workspaceToCode generará respetando las variables globales (num, timeDur)
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

// Registramos en cuanto arranque el script
customUserBlocks.forEach(registerCustomBlockDef);

function applyCustomBlocksTo(toolboxDef, isBasicMode) {
    if (customUserBlocks.length === 0) return toolboxDef;
    
    // Clonación profunda
    let newToolbox = JSON.parse(JSON.stringify(toolboxDef));
    let blocksNodes = customUserBlocks.map(b => ({ kind: 'block', type: b.id }));
    
    if (isBasicMode) {
        newToolbox.contents[0].contents.push(...blocksNodes);
    } else {
        newToolbox.contents.push({
            kind: 'category',
            name: 'Mis Bloques',
            colour: '290',
            contents: blocksNodes
        });
    }
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
        { kind: 'block', type: 'pop' },
        { kind: 'block', type: 'simple_note' },
        { kind: 'block', blockxml: simple_note_dur },
        { kind: 'block', blockxml: simple_note_vol }
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
        { kind: 'block', type: 'loop' },
        { kind: 'block', type: 'sequence' },
        { kind: 'block', type: 'wait', fields: { NUM: 1 } },
        { kind: 'block', type: 'pop' }
      ]
    },
    {
      kind: "category", name: "Notas", colour: "20",
      contents: [
        {
          kind: 'category', name: 'Puzzle', colour: '20', contents: [
            { kind: 'block', type: 'simple_note' },
            { kind: 'block', type: 'semitone' },
            { kind: 'block', type: 'chord' }
          ]
        },
        {
          kind: 'category', name: 'Anidado', colour: '20', contents: [
            { kind: 'block', type: 'simple_note2' },
            { kind: 'block', type: 'semitone2' },
            { kind: 'block', type: 'chord2' }
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
            {
              kind: 'category', name: 'Duración', colour: '120', contents: [
                { kind: 'block', type: 'opt_duration' },
                { kind: 'block', blockxml: simple_note_dur },
                { kind: 'block', blockxml: semitone_dur }
              ]
            },
            { kind: 'block', type: 'opt_wave_shape' }
          ]
        },
        {
          kind: "category", name: "Opciones caja", colour: "160",
          contents: [
            { kind: 'block', type: 'opt2_duration' },
            { kind: 'block', type: 'opt2_wave_shape' }
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
        { kind: 'block', type: 'loop' },
        { kind: 'block', type: 'sequence' },
        { kind: 'block', type: 'wait', fields: { NUM: 1 } },
        { kind: 'block', type: 'pop' }
      ]
    },
    {
      kind: "category", name: "Notas", colour: "20",
      contents: [
        {
          kind: 'category', name: 'Mutador', colour: '20', contents: [
            { kind: 'block', type: 'simple_note' }, { kind: 'block', type: 'semitone' },
            { kind: 'block', type: 'chord' }, { kind: 'block', type: 'chord_ed' }
          ]
        },
        {
          kind: 'category', name: 'Anidado', colour: '20', contents: [
            { kind: 'block', type: 'simple_note2' }, { kind: 'block', type: 'semitone2' },
            { kind: 'block', type: 'chord2' }, { kind: 'block', type: 'chord_ed2' }
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
            {
              kind: 'category', name: 'Duración', colour: '120', contents: [
                { kind: 'block', type: 'opt_duration' },
                { kind: 'block', blockxml: simple_note_dur },
                { kind: 'block', blockxml: semitone_dur }
              ]
            },
            { kind: 'block', type: 'opt_wave_shape' }, { kind: 'block', type: 'opt_attack' },
            { kind: 'block', type: 'opt_release' }, { kind: 'block', type: 'opt_volume' },
            { kind: 'block', type: 'opt_kind' }, { kind: 'block', type: 'opt_adsr' }
          ]
        },
        {
          kind: "category", name: "Opciones caja", colour: "160",
          contents: [
            { kind: 'block', type: 'opt2_duration' }, { kind: 'block', type: 'opt2_wave_shape' },
            { kind: 'block', type: 'opt2_attack' }, { kind: 'block', type: 'opt2_release' },
            { kind: 'block', type: 'opt2_volume' }, { kind: 'block', type: 'opt2_kind' },
            { kind: 'block', type: 'opt2_adsr' }
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
            { kind: 'block', type: 'effect_pitchshift' },
            { kind: 'block', type: 'effect_frequencyshifter' }
          ]
        },
        {
          kind: "category", name: "Filtros", colour: "290",
          contents: [
            { kind: 'block', type: 'effect_autofilter' },
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
          "type": 'loop',
        },
        {
          "kind": 'block',
          "type": 'sequence',
        },
        {
          "kind": "block",
          "type": "wait",
          "fields": {
            "NUM": 1
          }
        },
        {
          kind: 'block',
          type: 'pop',
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
              type: 'simple_note'
            },
            {
              kind: 'block',
              type: 'semitone'
            },
            {
              kind: 'block',
              type: 'chord'
            },
            {
              kind: 'block',
              type: 'chord_ed'
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
              type: 'simple_note2'
            },
            {
              kind: 'block',
              type: 'semitone2'
            },
            {
              kind: 'block',
              type: 'chord2'
            },
            {
              kind: 'block',
              type: 'chord_ed2'
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
              kind: "category",
              name: "duración",
              colour: "120",
              contents: [
                {
                  kind: 'block',
                  type: 'opt_duration'
                },
                {
                  kind: 'block',
                  blockxml: simple_note_dur
                },
                {
                  kind: 'block',
                  blockxml: semitone_dur
                }
              ]
            },
            {
              kind: 'block',
              type: 'opt_wave_shape'
            },
            {
              kind: 'block',
              type: 'opt_attack'
            },
            {
              kind: 'block',
              type: 'opt_release'
            },
            {
              kind: 'block',
              type: 'opt_volume'
            },
            {
              kind: 'block',
              type: 'opt_kind'
            },
            {
              kind: 'block',
              type: 'opt_adsr'
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
              type: 'opt2_duration'
            },
            {
              kind: 'block',
              type: 'opt2_wave_shape'
            },
            {
              kind: 'block',
              type: 'opt2_attack'
            },
            {
              kind: 'block',
              type: 'opt2_release'
            },
            {
              kind: 'block',
              type: 'opt2_volume'
            },
            {
              kind: 'block',
              type: 'opt2_kind'
            },
            {
              kind: 'block',
              type: 'opt2_adsr'
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
            { kind: 'block', type: 'effect_pitchshift' },
            { kind: 'block', type: 'effect_frequencyshifter' }
          ]
        },
        {
          kind: "category", name: "Filtros", colour: "290",
          contents: [
            { kind: 'block', type: 'effect_autofilter' },
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

// Nivel selector logic
function selectLevel(levelName) {
  isLoadingLevel = true;
  currentLevel = levelName;

  let selectedToolbox = toolboxFree;
  switch (levelName) {
    case 'basic': selectedToolbox = toolboxBasic; break;
    case 'intermediate': selectedToolbox = toolboxIntermediate; break;
    case 'advanced': selectedToolbox = toolboxAdvanced; break;
    case 'free': selectedToolbox = toolboxFree; break;
  }

  // Si estamos cambiando a otro nivel completo, aquí inyectamos los custom blocks
  const dynamicToolbox = applyCustomBlocksTo(selectedToolbox, levelName === 'basic');

  workspace.clear();
  workspace.updateToolbox(dynamicToolbox);

  if (levelName === 'basic') {
    document.body.classList.add('basic-mode');
    setTimeout(() => {
      const toolbox = workspace.getToolbox();
      if (toolbox && typeof toolbox.selectItemByPosition === 'function') {
        toolbox.selectItemByPosition(0);
        // Evitar que se cierre al hacer click en el fondo (en algunas versiones de Blockly funciona)
        const flyout = toolbox.getFlyout();
        if (flyout) {
          flyout.autoClose = false;
        }
      }
    }, 50);
  } else {
    document.body.classList.remove('basic-mode');
  }

  // 1. Cargar bloques guardados para ESTE nivel específico
  const savedXml = localStorage.getItem('blocklyMusicParams_' + currentLevel);
  if (savedXml) {
    try {
      const xml = Blockly.Xml.textToDom(savedXml);
      Blockly.Xml.domToWorkspace(xml, workspace);
    } catch (e) {
      console.warn("No se pudo cargar el espacio de trabajo guardado:", e);
    }
  }

  isLoadingLevel = false;

  document.getElementById('startup-menu').style.opacity = '0';
  document.getElementById('startup-menu').style.pointerEvents = 'none';
  setTimeout(() => {
    document.getElementById('startup-menu').style.display = 'none';
  }, 400); // Wait for transition
}

// 2. Guardar bloques automáticamente ante cualquier cambio estructural
workspace.addChangeListener((e) => {
  if (isLoadingLevel || !currentLevel) return; // Evitar sobreescribir al cambiar de interfaz

  if (e.type !== Blockly.Events.UI && e.type !== Blockly.Events.THEME_CHANGE) {
    const xml = Blockly.Xml.workspaceToDom(workspace);
    const xmlText = Blockly.Xml.domToText(xml);
    localStorage.setItem('blocklyMusicParams_' + currentLevel, xmlText);
  }
});

// 3. Evento para limpiar el área del nivel actual
clearBTN.addEventListener('click', () => {
  if (!currentLevel) return;
  if (window.confirm("¿Estás seguro de que quieres borrar todos los bloques de este nivel? Esta acción no se puede deshacer.")) {
    isLoadingLevel = true;
    workspace.clear();
    localStorage.removeItem('blocklyMusicParams_' + currentLevel);
    isLoadingLevel = false;
  }
});

// Modal elements
const modal = document.getElementById('custom-block-modal');
const nameInput = document.getElementById('block-name-input');
const colorInput = document.getElementById('block-color-input');
const hexDisplay = document.getElementById('color-hex-display');
const btnCancel = document.getElementById('cancel-block-btn');
const btnSave = document.getElementById('save-block-btn');

let pendingBlockSelection = null;

// Synchronize color input and text display
colorInput.addEventListener('input', (e) => {
    hexDisplay.textContent = e.target.value;
});

// 4. Crear macro de bloque del usuario
document.getElementById('create-block-btn').addEventListener('click', () => {
  let selected = Blockly.selected;
  if (!selected) {
    alert("Por favor, selecciona primero el bloque superior del conjunto que quieres guardar.");
    return;
  }
  
  // Store the selection and show modal
  pendingBlockSelection = selected;
  nameInput.value = ''; // clean previous name
  modal.style.display = 'flex';
});

btnCancel.addEventListener('click', () => {
    modal.style.display = 'none';
    pendingBlockSelection = null;
});

btnSave.addEventListener('click', () => {
  let blockName = nameInput.value;
  if (!blockName || blockName.trim() === "") {
      alert("Por favor, introduce un nombre para el bloque.");
      return;
  }
  
  // Extraer el XML
  let dom = Blockly.Xml.blockToDom(pendingBlockSelection);
  let container = document.createElement('xml');
  container.appendChild(dom);
  let xmlText = Blockly.Xml.domToText(container);
  
  // Registrar bloque
  let id = "custom_" + Date.now();
  
  // Use the HEX color picked directly
  let blockData = { id, name: blockName, color: colorInput.value, xml: xmlText };
  
  customUserBlocks.push(blockData);
  localStorage.setItem('blocklyMusicCustomBlocks', JSON.stringify(customUserBlocks));
  
  registerCustomBlockDef(blockData);
  
  // Actualizar la caja de herramientas de forma dinámica sin limpiar el área actual.
  let baseToolbox = toolboxFree;
  switch (currentLevel) {
    case 'basic': baseToolbox = toolboxBasic; break;
    case 'intermediate': baseToolbox = toolboxIntermediate; break;
    case 'advanced': baseToolbox = toolboxAdvanced; break;
  }
  workspace.updateToolbox(applyCustomBlocksTo(baseToolbox, currentLevel === 'basic'));
  
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
  
  modal.style.display = 'none';
  pendingBlockSelection = null;
});

document.getElementById('btn-basic').addEventListener('click', () => selectLevel('basic'));
document.getElementById('btn-intermediate').addEventListener('click', () => selectLevel('intermediate'));
document.getElementById('btn-advanced').addEventListener('click', () => selectLevel('advanced'));
document.getElementById('btn-free').addEventListener('click', () => selectLevel('free'));

document.getElementById('btn-menu').addEventListener('click', () => {
  document.getElementById('startup-menu').style.display = 'flex';
  // Small timeout to allow display:flex to apply before animating opacity
  setTimeout(() => {
    document.getElementById('startup-menu').style.opacity = '1';
    document.getElementById('startup-menu').style.pointerEvents = 'all';
  }, 10);
});
