Blockly.Blocks['effect_frequencyshifter'] = {
    init: function () {
        this.appendDummyInput().setAlign(Blockly.ALIGN_LEFT).appendField("FrequencyShifter");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Frecuencia").appendField(new Blockly.FieldNumber(0, -20000, 20000), "FREQUENCY");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Nivel de efecto (Wet)").appendField(new Blockly.FieldNumber(1, 0, 1), "WET");
        this.appendStatementInput('STATEMENTS').setCheck(null);
        this.setPreviousStatement(true);
        this.setNextStatement(true, null);
        this.setColour(290);
    }
};

Blockly.JavaScript['effect_frequencyshifter'] = function (block) {
    let frequency = block.getFieldValue('FREQUENCY');
    let wet = block.getFieldValue('WET');
    let myNum = num++; // unique ID

    let effectOptions = `{frequency: ${frequency}, wet: ${wet}}`;
    let code = `var prev_dest_${myNum} = typeof current_dest !== 'undefined' ? current_dest : Tone.Destination;\n`;
    code += `const effect_${myNum} = new Tone.FrequencyShifter(${effectOptions}).connect(prev_dest_${myNum});\n`;
    code += `if (typeof effect_${myNum}.start === 'function') effect_${myNum}.start();\n`;
    code += `current_dest = effect_${myNum};\n`;
    code += Blockly.JavaScript.statementToCode(block, 'STATEMENTS');
    code += `current_dest = prev_dest_${myNum};\n`;
    return code;
}
