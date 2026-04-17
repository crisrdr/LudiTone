Blockly.Blocks['effect_jcreverb'] = {
    init: function () {
        this.appendDummyInput().setAlign(Blockly.ALIGN_LEFT).appendField("JCReverb");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Tamaño de sala").appendField(((function(f){ f.setTooltip(`Tamaño de sala (0 a 1):\n0 = Habitación pequeña\n1 = Catedral inmensa`); return f; })(new Blockly.FieldNumber(0.5, 0, 0.9))), "ROOM_SIZE");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Nivel de efecto (Wet)").appendField(((function(f){ f.setTooltip(`Nivel de efecto (0 a 1):\n0 = Señal limpia original\n1 = Efecto al 100%`); return f; })(new Blockly.FieldNumber(1, 0, 1))), "WET");
        this.appendStatementInput('STATEMENTS').setCheck(null);
        this.setPreviousStatement(true);
        this.setNextStatement(true, null);
        this.setColour(290);
        this.setTooltip('Reverberación tipo JC con control de tamaño de sala.');
    }
};

Blockly.JavaScript['effect_jcreverb'] = function (block) {
    let roomSize = block.getFieldValue('ROOM_SIZE');
    let wet      = block.getFieldValue('WET');
    let myNum = num++;

    let effectOptions = `{roomSize: ${roomSize}, wet: ${wet}}`;
    let code = `var prev_dest_${myNum} = typeof current_dest !== 'undefined' ? current_dest : Tone.Destination;\n`;
    code += `const effect_${myNum} = new Tone.JCReverb(${effectOptions}).connect(prev_dest_${myNum});\n`;
    code += `if (typeof effect_${myNum}.start === 'function') effect_${myNum}.start();\n`;
    code += `current_dest = effect_${myNum};\n`;
    code += Blockly.JavaScript.statementToCode(block, 'STATEMENTS');
    code += `current_dest = prev_dest_${myNum};\n`;
    return code;
}
