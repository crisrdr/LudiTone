Blockly.Blocks['poly_note'] = {
    init: function () {
        this.setPreviousStatement(true);
        this.appendDummyInput()
            .appendField("poly note")
            .appendField(new Blockly.FieldDropdown([["c4", "261"], ["d4", "293"], ["e4", "329"], ["f4", "349"], ["g4", "391"]]), "note")
            .appendField("kind")
            .appendField(new Blockly.FieldDropdown([["harmonic", "harm"], ["inharmonic", "inharm"]]), "kind")
        this.setNextStatement(true, null);
    }
};

Blockly.JavaScript['poly_note'] = function (block) {
    const note = block.getFieldValue('note');
    const kind = block.getFieldValue('kind');
    const waveType = "sine";
    const dur = 1;
    let code = `const synth` + num + ` = new Tone.PolySynth().toDestination();
  synth` + num + `.set({oscillator: {type: '${waveType}'}});
  synth0.set({envelope: {attack: 1, decay: 0.15, sustain: 1, release: 1}});`;
    if (kind == 'harm') {
        code = code + `synth` + num + `.triggerAttackRelease(['${note}', '${note}' * 2, '${note}' * 3, '${note}' * 4], ` + dur + `, now + ` + timeDur + `, 0.5);`;
    }
    else {
        code = code + `synth` + num + `.triggerAttackRelease(['${note}', '${note}' * 2.76, '${note}' * 5.40, '${note}' * 8.93], ` + dur + `, now + ` + timeDur + `, 0.5);`;
    }
    num++;
    return code;
};
