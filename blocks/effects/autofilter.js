Blockly.Blocks['effect_autofilter'] = {
    init: function () {
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_LEFT)
            .appendField("AutoFilter (LFO Filter)");
            
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField("LFO Frequency")
            .appendField(new Blockly.FieldTextInput("4n"), "FREQUENCY");
            
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Profundidad")
            .appendField(new Blockly.FieldNumber(1, 0, 1), "DEPTH");
            
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Nivel de efecto (Wet)")
            .appendField(new Blockly.FieldNumber(1, 0, 1), "WET");

        this.appendStatementInput('STATEMENTS')
            .setCheck(null);

        this.setPreviousStatement(true);
        this.setNextStatement(true, null);
        this.setColour(290);
        this.setTooltip('Applies an AutoFilter (LFO modulated filter) to notes.');
    }
};

Blockly.JavaScript['effect_autofilter'] = function (block) {
    let frequency = block.getFieldValue('FREQUENCY');
    let depth = block.getFieldValue('DEPTH');
    let wet = block.getFieldValue('WET');

    let code = ``;

    let myNum = num;
    num++; // Increment global counter to ensure unique IDs

    let effectOptions = `{frequency: "${frequency}", depth: ${depth}, wet: ${wet}}`;

    code += `// --- Start Effect Wrapper ---\n`;

    code += `var prev_dest_${myNum} = typeof current_dest !== 'undefined' ? current_dest : Tone.Destination;\n`;

    code += `const effect_${myNum} = new Tone.AutoFilter(${effectOptions}).connect(prev_dest_${myNum});\n`;
    code += `if (typeof effect_${myNum}.start === 'function') effect_${myNum}.start();\n`;
    
    code += `current_dest = effect_${myNum};\n`;

    let innerCode = Blockly.JavaScript.statementToCode(block, 'STATEMENTS');
    code += innerCode;

    code += `current_dest = prev_dest_${myNum};\n`;
    code += `// --- End Effect Wrapper ---\n`;

    return code;
}
