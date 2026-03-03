/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

(function () {
  let currentButton;

  function handlePlay(event) {
    loadWorkspace(event.target);
    let code = javascript.javascriptGenerator.workspaceToCode(
      Blockly.getMainWorkspace(),
    );
    code += 'MusicMaker.playSynth();';
    //code += 'MusicMaker.play();';
    // Eval can be dangerous. For more controlled execution, check
    // https://github.com/NeilFraser/JS-Interpreter.
    
    if (Tone.context.state != "running") {
      Tone.start();
    }
    
    try {
      eval(code);
    } catch (error) {
      console.log(error);
    }
  }

  function loadWorkspace(button) {
    const workspace = Blockly.getMainWorkspace();
    if (button.blocklySave) {
      Blockly.serialization.workspaces.load(button.blocklySave, workspace);
    } else {
      workspace.clear();
    }
  }

  function save(button) {
    button.blocklySave = Blockly.serialization.workspaces.save(
      Blockly.getMainWorkspace(),
    );
  }

  function handleSave() {
    document.body.setAttribute('mode', 'edit');
    save(currentButton);
  }

  function enableEditMode() {
    document.body.setAttribute('mode', 'edit');
    document.querySelectorAll('.button').forEach((btn) => {
      btn.removeEventListener('click', handlePlay);
      btn.addEventListener('click', enableBlocklyMode);
    });
  }

  function enableMakerMode() {
    document.body.setAttribute('mode', 'maker');
    document.querySelectorAll('.button').forEach((btn) => {
      btn.addEventListener('click', handlePlay);
      btn.removeEventListener('click', enableBlocklyMode);
    });
  }

  function enableBlocklyMode(e) {
    document.body.setAttribute('mode', 'blockly');
    currentButton = e.target;
    loadWorkspace(currentButton);
  }

  document.querySelector('#edit').addEventListener('click', enableEditMode);
  document.querySelector('#done').addEventListener('click', enableMakerMode);
  document.querySelector('#save').addEventListener('click', handleSave);

  enableMakerMode();

  const toolbox = {
    kind: 'categoryToolbox',
    contents: [
      {
        kind: "category",
        name: "control",
        colour: "0",
        contents: [
          {
            kind: 'block',
            type: 'controls_repeat_ext',
            inputs: {
              TIMES: {
                shadow: {
                  type: 'math_number',
                  fields: {
                    NUM: 5,
                  },
                },
              },
            },
          },
        ]
      },
      {
        kind: "category",
        name: "duration",
        colour: "43",
        contents: [
          {
            kind: 'block',
            type: 'play_sound',
          },
          {
            kind: 'block',
            type: 'play_duration',
          },
        ]
      },
      {
        kind: "category",
        name: "attack",
        colour: "61",
        contents: [],
      },
      {
        kind: "category",
        name: "release",
        colour: "75",
        contents: [],
      },
      {
        kind: "category",
        name: "harmonics",
        colour: "315",
        contents: [],
      },
      {
        kind: "category",
        name: "filtering",
        colour: "357",
        contents: [],
      },
      {
        kind: "category",
        name: "modulation",
        colour: "110",
        contents: [],
      },
      {
        kind: "category",
        name: "speed",
        colour: "204",
        contents: [],
      },
      {
        kind: "category",
        name: "collages",
        colour: "212",
        contents: [],
      },
      {
        kind: "category",
        name: "effects",
        colour: "159",
        contents: [],
      }
    ],
  };

  Blockly.inject('blocklyDiv', {
    toolbox: toolbox,
    scrollbars: false,
    horizontalLayout: false,
    toolboxPosition: 'start',
  });
})();
