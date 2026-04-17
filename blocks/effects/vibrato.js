Blockly.Blocks['effect_vibrato'] = {
    init: function () {
        this.appendDummyInput().setAlign(Blockly.ALIGN_LEFT).appendField("Vibrato");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Max Delay (s)").appendField(((function(f){ f.setTooltip(`Retardo máximo del LFO (s):\nLímite superior del desplazamiento temporal.`); return f; })(new Blockly.FieldNumber(0.005, 0))), "MAX_DELAY");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Frecuencia").appendField(((function(f){ f.setTooltip(`Frecuencia (Hz):\nVelocidad de oscilación del vibrato.`); return f; })(new Blockly.FieldNumber(5, 0))), "FREQUENCY");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Profundidad").appendField(((function(f){ f.setTooltip(`Profundidad (0 a 1):\n0 = Efecto sutil\n1 = Efecto muy extremo`); return f; })(new Blockly.FieldNumber(0.1, 0, 1))), "DEPTH");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Tipo").appendField(((function(f){ f.setTooltip(`Forma de onda del LFO de tono:\nsine = Vibrato suave y natural (el más habitual)\nsquare = Alternancia brusca entre dos tonos\ntriangle = Similar al seno pero con curva angular\nsawtooth = Sube de tono gradualmente y cae en seco`); return f; })(new Blockly.FieldDropdown([["sine","sine"],["square","square"],["triangle","triangle"],["sawtooth","sawtooth"]]))), "TYPE");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Nivel de efecto (Wet)").appendField(((function(f){ f.setTooltip(`Nivel de efecto (0 a 1):\n0 = Señal limpia original\n1 = Efecto al 100%`); return f; })(new Blockly.FieldNumber(1, 0, 1))), "WET");
        this.appendStatementInput('STATEMENTS').setCheck(null);
        this.setPreviousStatement(true);
        this.setNextStatement(true, null);
        this.setColour(290);
        this.setTooltip('Oscilación de tono que produce un efecto vibrato.');
    }
};

Blockly.JavaScript['effect_vibrato'] = function (block) {
    let maxDelay  = block.getFieldValue('MAX_DELAY');
    let frequency = block.getFieldValue('FREQUENCY');
    let depth     = block.getFieldValue('DEPTH');
    let type      = block.getFieldValue('TYPE');
    let wet       = block.getFieldValue('WET');
    let myNum = num++;

    let effectOptions = `{maxDelay: ${maxDelay}, frequency: ${frequency}, depth: ${depth}, type: "${type}", wet: ${wet}}`;
    let code = `var prev_dest_${myNum} = typeof current_dest !== 'undefined' ? current_dest : Tone.Destination;\n`;
    code += `const effect_${myNum} = new Tone.Vibrato(${effectOptions}).connect(prev_dest_${myNum});\n`;
    code += `if (typeof effect_${myNum}.start === 'function') effect_${myNum}.start();\n`;
    code += `current_dest = effect_${myNum};\n`;
    code += Blockly.JavaScript.statementToCode(block, 'STATEMENTS');
    code += `current_dest = prev_dest_${myNum};\n`;
    return code;
}
