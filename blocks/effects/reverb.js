Blockly.Blocks['effect_reverb'] = {
    init: function () {
        this.appendDummyInput().setAlign(Blockly.ALIGN_LEFT).appendField("Reverb");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Caida").appendField(((function(f){ f.setTooltip(`Tiempo de Caída (s):
Tiempo que tarda la reverberación en silenciarse.`); return f; })(new Blockly.FieldNumber(1.5, 0.1, 10))), "DECAY");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Pre-Retardo").appendField(((function(f){ f.setTooltip(`Pre-Retardo (s):
Tiempo de espera antes de que el eco empiece a sonar.`); return f; })(new Blockly.FieldNumber(0.01, 0, 1))), "PREDELAY");
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

Blockly.JavaScript['effect_reverb'] = function (block) {
    let decay = block.getFieldValue('DECAY');
    let predelay = block.getFieldValue('PREDELAY');
    let wet = block.getFieldValue('WET');
    let myNum = num++; // unique ID

    let effectOptions = `{decay: ${decay}, preDelay: ${predelay}, wet: ${wet}}`;
    let code = `var prev_dest_${myNum} = typeof current_dest !== 'undefined' ? current_dest : Tone.Destination;\n`;
    code += `const effect_${myNum} = new Tone.Reverb(${effectOptions}).connect(prev_dest_${myNum});\n`;
    code += `if (typeof effect_${myNum}.start === 'function') effect_${myNum}.start();\n`;
    code += `current_dest = effect_${myNum};\n`;
    code += Blockly.JavaScript.statementToCode(block, 'STATEMENTS');
    code += `current_dest = prev_dest_${myNum};\n`;
    return code;
}
