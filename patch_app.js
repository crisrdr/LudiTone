const fs = require('fs');
let content = fs.readFileSync('app.js', 'utf8');

const newToolboxes = `
const toolboxBasic = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: "category", name: "control", colour: "212",
      contents: [
        { kind: 'block', type: 'loop' },
        { kind: 'block', type: 'math_number', fields: { NUM: 1 } },
        { kind: 'block', type: 'wait', fields: { NUM: 1 } },
        { kind: 'block', type: 'pop' }
      ]
    },
    {
      kind: "category", name: "notes", colour: "20",
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
      kind: "category", name: "control", colour: "212",
      contents: [
        { kind: 'block', type: 'loop' },
        { kind: 'block', type: 'sequence' },
        { kind: 'block', type: 'math_number', fields: { NUM: 1 } },
        { kind: 'block', type: 'wait', fields: { NUM: 1 } },
        { kind: 'block', type: 'pop' }
      ]
    },
    {
      kind: "category", name: "notes", colour: "20",
      contents: [
        { kind: 'category', name: 'mutator', colour: '20', contents: [
            { kind: 'block', type: 'simple_note' },
            { kind: 'block', type: 'semitone' },
            { kind: 'block', type: 'chord' }
        ]},
        { kind: 'category', name: 'statement', colour: '20', contents: [
            { kind: 'block', type: 'simple_note2' },
            { kind: 'block', type: 'semitone2' },
            { kind: 'block', type: 'chord2' }
        ]}
      ]
    },
    {
      kind: "category", name: "options", colour: "120",
      contents: [
        { kind: 'category', name: 'duration', colour: '120', contents: [
            { kind: 'block', type: 'opt_duration' },
            { kind: 'block', blockxml: simple_note_dur },
            { kind: 'block', blockxml: semitone_dur }
        ]},
        { kind: 'block', type: 'opt_wave_shape' }
      ]
    },
    {
      kind: "category", name: "options2", colour: "160",
      contents: [
        { kind: 'block', type: 'opt2_duration' },
        { kind: 'block', type: 'opt2_wave_shape' }
      ]
    }
  ]
};

const toolboxAdvanced = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: "category", name: "control", colour: "212",
      contents: [
        { kind: 'block', type: 'loop' },
        { kind: 'block', type: 'sequence' },
        { kind: 'block', type: 'math_number', fields: { NUM: 1 } },
        { kind: 'block', type: 'wait', fields: { NUM: 1 } },
        { kind: 'block', type: 'pop' }
      ]
    },
    {
      kind: "category", name: "notes", colour: "20",
      contents: [
        { kind: 'category', name: 'mutator', colour: '20', contents: [
            { kind: 'block', type: 'simple_note' }, { kind: 'block', type: 'semitone' },
            { kind: 'block', type: 'chord' }, { kind: 'block', type: 'chord_ed' }
        ]},
        { kind: 'category', name: 'statement', colour: '20', contents: [
            { kind: 'block', type: 'simple_note2' }, { kind: 'block', type: 'semitone2' },
            { kind: 'block', type: 'chord2' }, { kind: 'block', type: 'chord_ed2' }
        ]}
      ]
    },
    {
      kind: "category", name: "options", colour: "120",
      contents: [
        { kind: 'category', name: 'duration', colour: '120', contents: [
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
      kind: "category", name: "options2", colour: "160",
      contents: [
        { kind: 'block', type: 'opt2_duration' }, { kind: 'block', type: 'opt2_wave_shape' },
        { kind: 'block', type: 'opt2_attack' }, { kind: 'block', type: 'opt2_release' },
        { kind: 'block', type: 'opt2_volume' }, { kind: 'block', type: 'opt2_kind' },
        { kind: 'block', type: 'opt2_adsr' }
      ]
    },
    {
      kind: "category", name: "effects", colour: "290",
      contents: [
        { kind: 'block', type: 'effect' }
      ]
    }
  ]
};

const toolboxFree = {
`;

content = content.replace('const toolbox = {', newToolboxes);
content = content.replace('toolbox: toolbox,', 'toolbox: toolboxFree,');

const levelFunctions = `
// Nivel selector logic
function selectLevel(levelName) {
  let selectedToolbox = toolboxFree;
  switch(levelName) {
    case 'basic': selectedToolbox = toolboxBasic; break;
    case 'intermediate': selectedToolbox = toolboxIntermediate; break;
    case 'advanced': selectedToolbox = toolboxAdvanced; break;
    case 'free': selectedToolbox = toolboxFree; break;
  }
  workspace.updateToolbox(selectedToolbox);
  document.getElementById('startup-menu').style.opacity = '0';
  document.getElementById('startup-menu').style.pointerEvents = 'none';
  setTimeout(() => {
    document.getElementById('startup-menu').style.display = 'none';
  }, 400); // Wait for transition
}

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
`;

content = content + '\n' + levelFunctions;

fs.writeFileSync('app.js', content, 'utf8');
