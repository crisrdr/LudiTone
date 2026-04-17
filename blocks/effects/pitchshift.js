Blockly.Blocks['effect_pitchshift'] = {
    init: function () {
        this.appendDummyInput().setAlign(Blockly.ALIGN_LEFT).appendField("PitchShift");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Pitch (semitonos)").appendField(((function(f){ f.setTooltip(`Tono (Semitonos, -36 a 36):\n12 = Sube una octava entera\n-12 = Baja una octava entera`); return f; })(new Blockly.FieldNumber(0, -36, 36))), "PITCH");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Window Size (s)").appendField(((function(f){ f.setTooltip(`Tamaño de ventana (s):\nTamaño del buffer de análisis. Valores más altos = menos artefactos en graves.`); return f; })(new Blockly.FieldNumber(0.1, 0))), "WINDOW_SIZE");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Delay Time (s)").appendField(((function(f){ f.setTooltip(`Retardo adicional (s):\nRetardo entre la entrada y la salida del pitch shifter.`); return f; })(new Blockly.FieldNumber(0, 0))), "DELAY_TIME");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Feedback").appendField(((function(f){ f.setTooltip(`Retroalimentación (0 a 1):\n0 = Sin retroalimentación\n1 = Infinita`); return f; })(new Blockly.FieldNumber(0, 0, 1))), "FEEDBACK");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Nivel de efecto (Wet)").appendField(((function(f){ f.setTooltip(`Nivel de efecto (0 a 1):\n0 = Señal limpia original\n1 = Efecto al 100%`); return f; })(new Blockly.FieldNumber(1, 0, 1))), "WET");
        this.appendStatementInput('STATEMENTS').setCheck(null);
        this.setPreviousStatement(true);
        this.setNextStatement(true, null);
        this.setColour(290);
        this.setTooltip('Altera el tono del sonido en semitonos.');
    }
};

Blockly.JavaScript['effect_pitchshift'] = function (block) {
    let pitch      = block.getFieldValue('PITCH');
    let windowSize = block.getFieldValue('WINDOW_SIZE');
    let delayTime  = block.getFieldValue('DELAY_TIME');
    let feedback   = block.getFieldValue('FEEDBACK');
    let wet        = block.getFieldValue('WET');
    let myNum = num++;

    let effectOptions = `{pitch: ${pitch}, windowSize: ${windowSize}, delayTime: ${delayTime}, feedback: ${feedback}, wet: ${wet}}`;
    let code = `var prev_dest_${myNum} = typeof current_dest !== 'undefined' ? current_dest : Tone.Destination;\n`;
    code += `const effect_${myNum} = new Tone.PitchShift(${effectOptions}).connect(prev_dest_${myNum});\n`;
    code += `if (typeof effect_${myNum}.start === 'function') effect_${myNum}.start();\n`;
    code += `current_dest = effect_${myNum};\n`;
    code += Blockly.JavaScript.statementToCode(block, 'STATEMENTS');
    code += `current_dest = prev_dest_${myNum};\n`;
    return code;
}
