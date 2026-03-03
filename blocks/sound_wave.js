Blockly.Blocks['sound_wave'] = {
    init: function () {
        this.setPreviousStatement(true);
        this.appendDummyInput()
            .appendField("note")
            .appendField(new Blockly.FieldDropdown([["c4", "c4"], ["d4", "d4"], ["e4", "e4"], ["f4", "f4"], ["g4", "g4"]]), "note")
            .appendField("wave")
            .appendField(new Blockly.FieldDropdown([["sine", "sine"], ["square", "square"], ["triangle", "triangle"], ["sawtooth", "sawtooth"]]), "wavetype");
        this.setNextStatement(true, null);
    }
};

Blockly.JavaScript['sound_wave'] = function (block) {
    const note = block.getFieldValue('note');
    const waveType = block.getFieldValue('wavetype');
    const dur = 1;
    const code = `const synth` + num + ` = new Tone.Synth().toDestination();
  synth` + num + `.set({oscillator: {type: '${waveType}'}});
  synth` + num + `.triggerAttackRelease('${note}', ` + dur + `, now + ` + timeDur + `);`;
    num++;
    return code;
};
