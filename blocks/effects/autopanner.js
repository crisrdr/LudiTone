Blockly.Blocks['effect_autopanner'] = {
    init: function () {
        this.appendDummyInput().setAlign(Blockly.ALIGN_LEFT).appendField("AutoPanner");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Frecuencia").appendField(((function(f){ f.setTooltip(`Frecuencia:
Controla la velocidad, o sobre qué tono base empieza a girar el efecto.`); return f; })(new Blockly.FieldNumber(1, 0))), "FREQUENCY");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Profundidad").appendField(((function(f){ f.setTooltip(`Profundidad (0 a 1):
0 = Efecto sutil
1 = Efecto muy extremo`); return f; })(new Blockly.FieldNumber(1, 0, 1))), "DEPTH");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Nivel de efecto (Wet)").appendField(((function(f){ f.setTooltip(`Nivel de efecto (0 a 1):
0 = Señal limpia original
1 = Efecto al 100%`); return f; })(new Blockly.FieldNumber(1, 0, 1))), "WET");
        this.appendStatementInput('STATEMENTS').setCheck(null);
        this.setPreviousStatement(true);
        this.setNextStatement(true, null);
        this.setColour(290);
    }
};

Blockly.JavaScript['effect_autopanner'] = function (block) {
    let frequency = block.getFieldValue('FREQUENCY');
    let depth = block.getFieldValue('DEPTH');
    let wet = block.getFieldValue('WET');
    let myNum = num++; // unique ID

    let effectOptions = `{frequency: ${frequency}, depth: ${depth}, wet: ${wet}}`;
    let code = `var prev_dest_${myNum} = typeof current_dest !== 'undefined' ? current_dest : Tone.Destination;\n`;
    code += `const effect_${myNum} = new Tone.AutoPanner(${effectOptions}).connect(prev_dest_${myNum});\n`;
    code += `if (typeof effect_${myNum}.start === 'function') effect_${myNum}.start();\n`;
    code += `current_dest = effect_${myNum};\n`;
    code += Blockly.JavaScript.statementToCode(block, 'STATEMENTS');
    code += `current_dest = prev_dest_${myNum};\n`;
    return code;
}
