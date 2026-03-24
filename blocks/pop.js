Blockly.Blocks['pop'] = {
    init: function () {
        this.setPreviousStatement(true);
        this.appendDummyInput()
            .appendField("pop")
            .appendField(new Blockly.FieldDropdown([["burp", "d1"], ["pap", "e2"], ["piu", "f3"], ["fiuuh", "g4"]]), "note");
        this.setNextStatement(true, null);
    }
};

Blockly.JavaScript['pop'] = function (block) {
    const note = block.getFieldValue('note');
    const dur = 1;
    const code = `const synth` + num + ` = new Tone.MembraneSynth().toDestination();
  Tone.Transport.schedule((time) => { synth` + num + `.triggerAttackRelease('${note}', ` + dur + `, time); }, ` + timeDur + `);`;
    num++;
    return code;
};
