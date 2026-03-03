Blockly.Blocks['simple_note'] = {
    init: function () {
        this.setPreviousStatement(true);
        this.appendDummyInput()
            .appendField("note")
            .appendField(new Blockly.FieldDropdown([["c4", "c4"], ["d4", "d4"], ["e4", "e4"], ["f4", "f4"], ["g4", "g4"]]), "note");
        this.setNextStatement(true, null);
        this.appendValueInput("options")
            .setCheck("options");
        this.setColour(20);
    }

};

Blockly.JavaScript['simple_note'] = function (block) {
    const note = block.getFieldValue('note');
    const dur = 1;
    const code = `const synth` + num + ` = new Tone.Synth().toDestination();
  synth` + num + `.triggerAttackRelease('${note}', ` + dur + `, now + ` + timeDur + `);`;
    num++;
    return code;
}
