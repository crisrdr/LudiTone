Blockly.Blocks['effect_chebyshev'] = {
    init: function () {
        this.appendDummyInput().setAlign(Blockly.ALIGN_LEFT).appendField("Chebyshev (Distortion)");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Order").appendField(((function(f){ f.setTooltip(`Orden de distorsión (1 a 100):\nMás alto = saturación más sucia.`); return f; })(new Blockly.FieldNumber(1, 1, 100))), "ORDER");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Oversample").appendField(((function(f){ f.setTooltip(`Sobremuestreo:\nnone = Sin sobremuestreo (más ligero, puede tener aliasing)\n2x = Procesa al doble de frecuencia (menos aliasing)\n4x = Máxima calidad, mayor coste de CPU`); return f; })(new Blockly.FieldDropdown([["none","none"],["2x","2x"],["4x","4x"]]))), "OVERSAMPLE");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Nivel de efecto (Wet)").appendField(((function(f){ f.setTooltip(`Nivel de efecto (0 a 1):\n0 = Señal limpia original\n1 = Efecto al 100%`); return f; })(new Blockly.FieldNumber(1, 0, 1))), "WET");
        this.appendStatementInput('STATEMENTS').setCheck(null);
        this.setPreviousStatement(true);
        this.setNextStatement(true, null);
        this.setColour(290);
        this.setTooltip('Aplica distorsión armónica tipo Chebyshev al sonido.');
    }
};

Blockly.JavaScript['effect_chebyshev'] = function (block) {
    let order      = block.getFieldValue('ORDER');
    let oversample = block.getFieldValue('OVERSAMPLE');
    let wet        = block.getFieldValue('WET');
    let myNum = num++;

    let effectOptions = `{order: ${order}, oversample: "${oversample}", wet: ${wet}}`;
    let code = `var prev_dest_${myNum} = typeof current_dest !== 'undefined' ? current_dest : Tone.Destination;\n`;
    code += `const effect_${myNum} = new Tone.Chebyshev(${effectOptions}).connect(prev_dest_${myNum});\n`;
    code += `if (typeof effect_${myNum}.start === 'function') effect_${myNum}.start();\n`;
    code += `current_dest = effect_${myNum};\n`;
    code += Blockly.JavaScript.statementToCode(block, 'STATEMENTS');
    code += `current_dest = prev_dest_${myNum};\n`;
    return code;
}
