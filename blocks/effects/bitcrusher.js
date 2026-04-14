Blockly.Blocks['effect_bitcrusher'] = {
    init: function () {
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_LEFT)
            .appendField("BitCrusher");
            
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Bits")
            .appendField(new Blockly.FieldNumber(4, 1, 16), "BITS");
            
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Nivel de efecto (Wet)")
            .appendField(new Blockly.FieldNumber(0.5, 0, 1), "WET");

        this.appendStatementInput('STATEMENTS')
            .setCheck(null);

        this.setPreviousStatement(true);
        this.setNextStatement(true, null);
        this.setColour(290);
        this.setTooltip('Applies a BitCrusher effect to all notes placed inside.');
    }
};

Blockly.JavaScript['effect_bitcrusher'] = function (block) {
    let bits = block.getFieldValue('BITS');
    let wet = block.getFieldValue('WET');

    let code = ``;

    let myNum = num;
    num++; // Increment global counter to ensure unique IDs

    let effectOptions = `{bits: ${bits}, wet: ${wet}}`;

    code += `// --- Start Effect Wrapper ---\n`;

    code += `var prev_dest_${myNum} = typeof current_dest !== 'undefined' ? current_dest : Tone.Destination;\n`;

    code += `const effect_${myNum} = new Tone.BitCrusher(${effectOptions}).connect(prev_dest_${myNum});\n`;
    code += `if (typeof effect_${myNum}.start === 'function') effect_${myNum}.start();\n`;
    
    code += `current_dest = effect_${myNum};\n`;

    let innerCode = Blockly.JavaScript.statementToCode(block, 'STATEMENTS');
    code += innerCode;

    code += `current_dest = prev_dest_${myNum};\n`;
    code += `// --- End Effect Wrapper ---\n`;

    return code;
}
