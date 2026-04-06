

const playBTN = document.getElementById("play-btn");
const stopBTN = document.getElementById("stop-btn");
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

const toolbox = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: "category",
      name: "control",
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
      name: "notes",
      colour: "20",
      contents: [
        {
          kind: "category",
          name: "mutator",
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
          name: "statement",
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
      name: "options",
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
      name: "options2",
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
    },
    {
      kind: "category",
      name: "effects",
      colour: "290",
      contents: [
        {
          kind: 'block',
          type: 'effect'
        }
      ]
    }
  ],
};

const workspace = Blockly.inject('blocklyDiv', {
  toolbox: toolbox,
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

