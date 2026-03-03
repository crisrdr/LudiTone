

const playBTN = document.getElementById("play-btn");
const stopBTN = document.getElementById("stop-btn");
let timeDur = 0; //it controls the duration of the notes
let num = 0; //it controls the number of synths on a given play.

// Generate JavaScript code and run it
async function runCode() {

  await Tone.Transport.start();

  // convert workspace to text code
  Blockly.JavaScript.addReservedWords('code');
  const code = Blockly.JavaScript.workspaceToCode(workspace);

  // test adding Tone synth trigger
  wrapCode = `const now = Tone.now();` + code

  console.log(wrapCode);
  // evaluate code
  try {
    eval(wrapCode);
  } catch (e) {
    alert(e);
  }
}

playBTN.addEventListener("click", () => {
  timeDur = 0;
  num = 0;
  runCode();
})

stopBTN.addEventListener("click", () => {
  Tone.Transport.stop();
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
        }
      ],
    },
    {
      kind: "category",
      name: "notes",
      colour: "20",
      contents: [
        {
          kind: 'block',
          type: 'simple_note'
        },
        {
          kind: 'block',
          type: 'pop',
        }
      ],
    },
    {
      kind: "category",
      name: "options",
      colour: "120",
      contents: [
        {
          kind: 'block',
          type: 'opt_wave_shape'
        },
        {
          kind: 'block',
          type: 'opt_duration'
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
    }
  ],
};

const workspace = Blockly.inject('blocklyDiv', {
  toolbox: toolbox,
  scrollbars: false,
  horizontalLayout: false,
  toolboxPosition: 'start',
});

