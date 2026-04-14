Blockly.Blocks['effect_pingpongdelay'] = {
    init: function () {
        this.appendDummyInput().setAlign(Blockly.ALIGN_LEFT).appendField("PingPongDelay");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Tiempo de retardo").appendField(((function(f){ f.setTooltip(`Tiempo de eco:
Admite tempos como '4n', '8n' o valores numéricos.`); return f; })(new Blockly.FieldTextInput("8n"))), "DELAY_TIME");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Retroalimentación").appendField(((function(f){ f.setTooltip(`Retroalimentación (0 a 1):
0 = Un solo eco
1 = El eco se repite infinitamente`); return f; })(new Blockly.FieldNumber(0.2, 0, 1))), "FEEDBACK");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Nivel de efecto (Wet)").appendField(((function(f){ f.setTooltip(`Nivel de efecto (0 a 1):
0 = Señal limpia original
1 = Efecto al 100%`); return f; })(new Blockly.FieldNumber(0.5, 0, 1))), "WET");
        this.appendStatementInput('STATEMENTS').setCheck(null);
        this.setPreviousStatement(true);
        this.setNextStatement(true, null);
        this.setColour(290);
    }
};

Blockly.JavaScript['effect_pingpongdelay'] = function (block) {
    let delayTime = block.getFieldValue('DELAY_TIME');
    let feedback = block.getFieldValue('FEEDBACK');
    let wet = block.getFieldValue('WET');
    let myNum = num++; // unique ID

    let effectOptions = `{delayTime: "${delayTime}", feedback: ${feedback}, wet: ${wet}}`;
    let code = `var prev_dest_${myNum} = typeof current_dest !== 'undefined' ? current_dest : Tone.Destination;\n`;
    code += `const effect_${myNum} = new Tone.PingPongDelay(${effectOptions}).connect(prev_dest_${myNum});\n`;
    code += `if (typeof effect_${myNum}.start === 'function') effect_${myNum}.start();\n`;
    code += `current_dest = effect_${myNum};\n`;
    code += Blockly.JavaScript.statementToCode(block, 'STATEMENTS');
    code += `current_dest = prev_dest_${myNum};\n`;
    return code;
}
