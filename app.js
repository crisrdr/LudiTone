

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


const toolboxBasic = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: "category", name: "Control", colour: "212",
      contents: [
        { kind: 'block', type: 'loop' },
        { kind: 'block', type: 'math_number', fields: { NUM: 1 } },
        { kind: 'block', type: 'wait', fields: { NUM: 1 } },
        { kind: 'block', type: 'pop' }
      ]
    },
    {
      kind: "category", name: "Notas", colour: "20",
      contents: [
        { kind: 'block', type: 'simple_note' },
        { kind: 'block', type: 'simple_note2' }
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
        { kind: 'block', type: 'math_number', fields: { NUM: 1 } },
        { kind: 'block', type: 'wait', fields: { NUM: 1 } },
        { kind: 'block', type: 'pop' }
      ]
    },
    {
      kind: "category", name: "Notas", colour: "20",
      contents: [
        { kind: 'category', name: 'Puzzle', colour: '20', contents: [
            { kind: 'block', type: 'simple_note' },
            { kind: 'block', type: 'semitone' },
            { kind: 'block', type: 'chord' }
        ]},
        { kind: 'category', name: 'Anidado', colour: '20', contents: [
            { kind: 'block', type: 'simple_note2' },
            { kind: 'block', type: 'semitone2' },
            { kind: 'block', type: 'chord2' }
        ]}
      ]
    },
    {
      kind: "category", name: "Opciones", colour: "120",
      contents: [
        {
          kind: "category", name: "Opciones puzzle", colour: "120",
          contents: [
            { kind: 'category', name: 'Duración', colour: '120', contents: [
                { kind: 'block', type: 'opt_duration' },
                { kind: 'block', blockxml: simple_note_dur },
                { kind: 'block', blockxml: semitone_dur }
            ]},
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
        { kind: 'block', type: 'math_number', fields: { NUM: 1 } },
        { kind: 'block', type: 'wait', fields: { NUM: 1 } },
        { kind: 'block', type: 'pop' }
      ]
    },
    {
      kind: "category", name: "Notas", colour: "20",
      contents: [
        { kind: 'category', name: 'Mutador', colour: '20', contents: [
            { kind: 'block', type: 'simple_note' }, { kind: 'block', type: 'semitone' },
            { kind: 'block', type: 'chord' }, { kind: 'block', type: 'chord_ed' }
        ]},
        { kind: 'category', name: 'Anidado', colour: '20', contents: [
            { kind: 'block', type: 'simple_note2' }, { kind: 'block', type: 'semitone2' },
            { kind: 'block', type: 'chord2' }, { kind: 'block', type: 'chord_ed2' }
        ]}
      ]
    },
    {
      kind: "category", name: "Opciones", colour: "120",
      contents: [
        {
          kind: "category", name: "Opciones puzzle", colour: "120",
          contents: [
            { kind: 'category', name: 'Duración', colour: '120', contents: [
                { kind: 'block', type: 'opt_duration' },
                { kind: 'block', blockxml: simple_note_dur },
                { kind: 'block', blockxml: semitone_dur }
            ]},
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
          "type": "math_number",
          "fields": {
            "NUM": 1
          }
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
              name: "duration",
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
  switch(levelName) {
    case 'basic': selectedToolbox = toolboxBasic; break;
    case 'intermediate': selectedToolbox = toolboxIntermediate; break;
    case 'advanced': selectedToolbox = toolboxAdvanced; break;
    case 'free': selectedToolbox = toolboxFree; break;
  }
  
  workspace.clear();
  workspace.updateToolbox(selectedToolbox);
  
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
