Blockly.Blocks['sound_wave_envelope'] = {
    init: function () {
        this.setPreviousStatement(true);
        this.appendDummyInput()
            .appendField("note")
            .appendField(new Blockly.FieldDropdown([["c4", "c4"], ["d4", "d4"], ["e4", "e4"], ["f4", "f4"], ["g4", "g4"]]), "note")
            .appendField("wave")
            .appendField(new Blockly.FieldDropdown([["sine", "sine"], ["square", "square"], ["triangle", "triangle"], ["sawtooth", "sawtooth"]]), "wavetype");
        this.appendDummyInput()
            .appendField("attack")
            .appendField(new Blockly.FieldNumber(1, 0, 10, 0.1), "attack");
        this.appendDummyInput()
            .appendField("release")
            .appendField(new Blockly.FieldNumber(1, 0, 10, 0.1), "release");
        this.setNextStatement(true, null);
    }
};

Blockly.JavaScript['sound_wave_envelope'] = function (block) {
    const note = block.getFieldValue('note');
    const waveType = block.getFieldValue('wavetype');
    const attack = block.getFieldValue('attack');
    const release = block.getFieldValue('release');
    const dur = 1;
    const code = `const synth` + num + ` = new Tone.Synth().toDestination();
  synth` + num + `.set({oscillator: {type: '${waveType}'}});
  synth` + num + `.set({envelope: {attack: '${attack}', decay: 0.15, sustain: '${dur}', release: '${release}'}});
  synth` + num + `.triggerAttackRelease('${note}', ` + (attack + dur + release) + `, now + ` + timeDur + `);`;
    num++;
    return code;
};
