Blockly.Blocks['effect_bitcrusher'] = {
    init: function () {
        this.appendDummyInput().setAlign(Blockly.ALIGN_LEFT).appendField("BitCrusher");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Bits").appendField(((function(f){ f.setTooltip(`Calidad de audio (1 a 16):\n1 a 4 = Muy robotizado/roto\n8 = Como una GameBoy\n16 = Calidad de CD normal`); return f; })(new Blockly.FieldNumber(4, 1, 16))), "BITS");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Nivel de efecto (Wet)").appendField(((function(f){ f.setTooltip(`Nivel de efecto (0 a 1):\n0 = Señal limpia original\n1 = Efecto al 100%`); return f; })(new Blockly.FieldNumber(1, 0, 1))), "WET");
        this.appendStatementInput('STATEMENTS').setCheck(null);
        this.setPreviousStatement(true);
        this.setNextStatement(true, null);
        this.setColour(290);
        this.setTooltip('Hace que el sonido tenga un efecto robotizado reduciendo la resolución de bits.');
    }
};

Blockly.JavaScript['effect_bitcrusher'] = function (block) {
    let bits = block.getFieldValue('BITS');
    let wet  = block.getFieldValue('WET');
    let myNum = num++;

    let effectOptions = `{bits: ${bits}, wet: ${wet}}`;
    let code = `var prev_dest_${myNum} = typeof current_dest !== 'undefined' ? current_dest : Tone.Destination;\n`;
    code += `const effect_${myNum} = new Tone.BitCrusher(${effectOptions}).connect(prev_dest_${myNum});\n`;
    code += `if (typeof effect_${myNum}.start === 'function') effect_${myNum}.start();\n`;
    code += `current_dest = effect_${myNum};\n`;
    code += Blockly.JavaScript.statementToCode(block, 'STATEMENTS');
    code += `current_dest = prev_dest_${myNum};\n`;
    return code;
}
