Blockly.Blocks['effect_stereowidener'] = {
    init: function () {
        this.appendDummyInput().setAlign(Blockly.ALIGN_LEFT).appendField("StereoWidener");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Amplitud").appendField(((function(f){ f.setTooltip(`Amplitud Estéreo (0 a 1):
0 = Centrado o Mono
1 = Efecto envolvente extremo`); return f; })(new Blockly.FieldNumber(0.5, 0, 1))), "WIDTH");
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

Blockly.JavaScript['effect_stereowidener'] = function (block) {
    let width = block.getFieldValue('WIDTH');
    let wet = block.getFieldValue('WET');
    let myNum = num++; // unique ID

    let effectOptions = `{width: ${width}, wet: ${wet}}`;
    let code = `var prev_dest_${myNum} = typeof current_dest !== 'undefined' ? current_dest : Tone.Destination;\n`;
    code += `const effect_${myNum} = new Tone.StereoWidener(${effectOptions}).connect(prev_dest_${myNum});\n`;
    code += `if (typeof effect_${myNum}.start === 'function') effect_${myNum}.start();\n`;
    code += `current_dest = effect_${myNum};\n`;
    code += Blockly.JavaScript.statementToCode(block, 'STATEMENTS');
    code += `current_dest = prev_dest_${myNum};\n`;
    return code;
}
