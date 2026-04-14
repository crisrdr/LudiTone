Blockly.Blocks['effect_jcreverb'] = {
    init: function () {
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_LEFT)
            .appendField("JCReverb");
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Tamaño de sala")
            .appendField(new Blockly.FieldNumber(0.8, 0, 0.9), "ROOM_SIZE");
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Nivel de efecto (Wet)")
            .appendField(new Blockly.FieldNumber(0.6, 0, 1), "WET");
        this.appendStatementInput('STATEMENTS')
            .setCheck(null);
        this.setPreviousStatement(true);
        this.setNextStatement(true, null);
        this.setColour(290);
    }
};

Blockly.JavaScript['effect_jcreverb'] = function (block) {
    let roomSize = block.getFieldValue('ROOM_SIZE');
    let wet = block.getFieldValue('WET');

    let code = ``;
    let myNum = num;
    num++; // Increment global counter to ensure unique IDs

    let effectOptions = `{roomSize: ${roomSize}, wet: ${wet}}`;
    code += `// --- Start Effect Wrapper ---\n`;
    code += `var prev_dest_${myNum} = typeof current_dest !== 'undefined' ? current_dest : Tone.Destination;\n`;
    code += `const effect_${myNum} = new Tone.JCReverb(${effectOptions}).connect(prev_dest_${myNum});\n`;
    code += `if (typeof effect_${myNum}.start === 'function') effect_${myNum}.start();\n`;
    code += `current_dest = effect_${myNum};\n`;
    let innerCode = Blockly.JavaScript.statementToCode(block, 'STATEMENTS');
    code += innerCode;
    code += `current_dest = prev_dest_${myNum};\n`;
    code += `// --- End Effect Wrapper ---\n`;
    return code;
}
