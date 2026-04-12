Blockly.Blocks['effect_phaser'] = {
    init: function () {
        this.appendDummyInput().setAlign(Blockly.ALIGN_LEFT).appendField("Phaser");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Frequency").appendField(new Blockly.FieldNumber(0.5, 0), "FREQUENCY");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Octaves").appendField(new Blockly.FieldNumber(3, 1), "OCTAVES");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Base Freq").appendField(new Blockly.FieldNumber(350, 0), "BASE_FREQUENCY");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Wet").appendField(new Blockly.FieldNumber(1, 0, 1), "WET");
        this.appendStatementInput('STATEMENTS').setCheck(null);
        this.setPreviousStatement(true);
        this.setNextStatement(true, null);
        this.setColour(290);
    }
};

Blockly.JavaScript['effect_phaser'] = function (block) {
    let frequency = block.getFieldValue('FREQUENCY');
    let octaves = block.getFieldValue('OCTAVES');
    let baseFreq = block.getFieldValue('BASE_FREQUENCY');
    let wet = block.getFieldValue('WET');
    let myNum = num++; // unique ID

    let effectOptions = `{frequency: ${frequency}, octaves: ${octaves}, baseFrequency: ${baseFreq}, wet: ${wet}}`;
    let code = `var prev_dest_${myNum} = typeof current_dest !== 'undefined' ? current_dest : Tone.Destination;\n`;
    code += `const effect_${myNum} = new Tone.Phaser(${effectOptions}).connect(prev_dest_${myNum});\n`;
    code += `if (typeof effect_${myNum}.start === 'function') effect_${myNum}.start();\n`;
    code += `current_dest = effect_${myNum};\n`;
    code += Blockly.JavaScript.statementToCode(block, 'STATEMENTS');
    code += `current_dest = prev_dest_${myNum};\n`;
    return code;
}
