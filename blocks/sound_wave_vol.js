Blockly.Blocks['sound_wave_vol'] = {
    init: function () {
        this.setPreviousStatement(true);
        this.appendDummyInput()
            .appendField("note")
            .appendField(new Blockly.FieldDropdown([["c4", "c4"], ["d4", "d4"], ["e4", "e4"], ["f4", "f4"], ["g4", "g4"]]), "note")
            .appendField("wave")
            .appendField(new Blockly.FieldDropdown([["sine", "sine"], ["square", "square"], ["triangle", "triangle"], ["sawtooth", "sawtooth"]]), "wavetype")
            .appendField("dur")
            .appendField(new Blockly.FieldNumber(1, 0, 10, 0.1), "dur")
            .appendField("vol")
            .appendField(new Blockly.FieldNumber(1, 0, 2, 0.01), "vol");
        this.setNextStatement(true, null);
    }
};

Blockly.JavaScript['sound_wave_vol'] = function (block) {
    const note = block.getFieldValue('note');
    const waveType = block.getFieldValue('wavetype');
    const vol = block.getFieldValue('vol');
    const dur = block.getFieldValue('dur');
    const code = `const synth` + num + ` = new Tone.Synth().toDestination();
  synth` + num + `.set({oscillator: {type: '${waveType}'}});
  synth` + num + `.triggerAttackRelease('${note}', ` + dur + `, now + ` + timeDur + `, '${vol}');`;
    num++;
    return code;
};
