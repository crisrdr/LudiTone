/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

Blockly.defineBlocksWithJsonArray([
  // Block for colour picker.
  {
    type: 'play_sound',
    message0: 'Play %1',
    args0: [
      {
        type: 'field_dropdown',
        name: 'VALUE',
        options: [
          ['C4', 'C4'],
          ['D4', 'D4'],
          ['E4', 'E4'],
          ['F4', 'F4'],
          ['G4', 'G4'],
        ],
      },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 355,
  },
  {
  type: "play_duration",
  tooltip: "Play with a certain duration",
  helpUrl: "",
  message0: "play %1 during %2",
  args0: [
    {
      type: 'field_dropdown',
      name: "NOTE",
      options: [
        ['C4', 'C4'],
        ['D4', 'D4'],
        ['E4', 'E4'],
        ['F4', 'F4'],
        ['G4', 'G4'],
      ],
    },
    {
      type: 'field_dropdown',
      name: "DUR",
      options: [
        ['0.125', '0.125'],
        ['0.25', '0.25'],
        ['0.5', '0.5'],
        ['1', '1'],
        ['1.5', '1.5'],
      ],
    }
  ],
  previousStatement: null,
  nextStatement: null,
  colour: 285
  },                  
]);

javascript.javascriptGenerator.forBlock['play_sound'] = function (block) {
  const value = "'" + block.getFieldValue('VALUE') + "'";
  return 'MusicMaker.queueSound(' + value + ');\n';
};

javascript.javascriptGenerator.forBlock['play_duration'] = function (block) {
  const note = block.getFieldValue('NOTE');
  const dur = block.getFieldValue('DUR');
  return 'MusicMaker.queueSound("note: ' + note +' ,dur:' + dur +'");\n';
};
