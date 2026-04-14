Blockly.Blocks['effect_freeverb'] = {
    init: function () {
        this.appendDummyInput().setAlign(Blockly.ALIGN_LEFT).appendField("Freeverb");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Tamaño de sala").appendField(((function(f){ f.setTooltip(`Tamaño de sala (0 a 1):
0 = Habitación pequeña
1 = Catedral inmensa`); return f; })(new Blockly.FieldNumber(0.7, 0, 1))), "ROOM_SIZE");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Dampening").appendField(((function(f){ f.setTooltip(`Amortiguación (Hz):
Controla qué tan rápido se apagan las frecuencias agudas.`); return f; })(new Blockly.FieldNumber(3000, 0))), "DAMPENING");
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

Blockly.JavaScript['effect_freeverb'] = function (block) {
    let roomSize = block.getFieldValue('ROOM_SIZE');
    let dampening = block.getFieldValue('DAMPENING');
    let wet = block.getFieldValue('WET');
    let myNum = num++; // unique ID

    let effectOptions = `{roomSize: ${roomSize}, dampening: ${dampening}, wet: ${wet}}`;
    let code = `var prev_dest_${myNum} = typeof current_dest !== 'undefined' ? current_dest : Tone.Destination;\n`;
    code += `const effect_${myNum} = new Tone.Freeverb(${effectOptions}).connect(prev_dest_${myNum});\n`;
    code += `if (typeof effect_${myNum}.start === 'function') effect_${myNum}.start();\n`;
    code += `current_dest = effect_${myNum};\n`;
    code += Blockly.JavaScript.statementToCode(block, 'STATEMENTS');
    code += `current_dest = prev_dest_${myNum};\n`;
    return code;
}
