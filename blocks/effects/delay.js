Blockly.Blocks['effect_delay'] = {
    init: function () {
        this.appendDummyInput().setAlign(Blockly.ALIGN_LEFT).appendField("Delay");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Tiempo de retardo (s)").appendField(((function(f){ f.setTooltip(`Tiempo de retardo (segundos):\n0 = Sin retardo\n1 = Un segundo de eco`); return f; })(new Blockly.FieldNumber(0, 0))), "DELAY_TIME");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Retardo máximo (s)").appendField(((function(f){ f.setTooltip(`Retardo máximo (segundos):\nLímite superior que puede alcanzar el retardo.`); return f; })(new Blockly.FieldNumber(1, 0))), "MAX_DELAY");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Nivel de efecto (Wet)").appendField(((function(f){ f.setTooltip(`Nivel de efecto (0 a 1):\n0 = Señal limpia original\n1 = Efecto al 100%`); return f; })(new Blockly.FieldNumber(1, 0, 1))), "WET");
        this.appendStatementInput('STATEMENTS').setCheck(null);
        this.setPreviousStatement(true);
        this.setNextStatement(true, null);
        this.setColour(290);
        this.setTooltip('Añade un retardo simple al sonido.');
    }
};

Blockly.JavaScript['effect_delay'] = function (block) {
    let delayTime = block.getFieldValue('DELAY_TIME');
    let maxDelay  = block.getFieldValue('MAX_DELAY');
    let wet       = block.getFieldValue('WET');
    let myNum = num++;

    let effectOptions = `{delayTime: ${delayTime}, maxDelay: ${maxDelay}, wet: ${wet}}`;
    let code = `var prev_dest_${myNum} = typeof current_dest !== 'undefined' ? current_dest : Tone.Destination;\n`;
    code += `const effect_${myNum} = new Tone.Delay(${effectOptions}).connect(prev_dest_${myNum});\n`;
    code += `if (typeof effect_${myNum}.start === 'function') effect_${myNum}.start();\n`;
    code += `current_dest = effect_${myNum};\n`;
    code += Blockly.JavaScript.statementToCode(block, 'STATEMENTS');
    code += `current_dest = prev_dest_${myNum};\n`;
    return code;
}
