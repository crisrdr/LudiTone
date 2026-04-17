Blockly.Blocks['effect_autopanner'] = {
    init: function () {
        this.appendDummyInput().setAlign(Blockly.ALIGN_LEFT).appendField("AutoPanner");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Frecuencia").appendField(((function(f){ f.setTooltip(`Frecuencia (Hz):\nControla la velocidad de oscilación del paneo.`); return f; })(new Blockly.FieldNumber(1, 0))), "FREQUENCY");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Tipo").appendField(((function(f){ f.setTooltip(`Forma de onda del LFO:\nsine = Oscilación suave y continua\nsquare = Cambios bruscos de izquierda a derecha\ntriangle = Similar al seno pero más angular\nsawtooth = Barrido gradual con caída brusca`); return f; })(new Blockly.FieldDropdown([["sine","sine"],["square","square"],["triangle","triangle"],["sawtooth","sawtooth"]]))), "TYPE");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Profundidad").appendField(((function(f){ f.setTooltip(`Profundidad (0 a 1):\n0 = Efecto sutil\n1 = Efecto muy extremo`); return f; })(new Blockly.FieldNumber(1, 0, 1))), "DEPTH");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Nivel de efecto (Wet)").appendField(((function(f){ f.setTooltip(`Nivel de efecto (0 a 1):\n0 = Señal limpia original\n1 = Efecto al 100%`); return f; })(new Blockly.FieldNumber(1, 0, 1))), "WET");
        this.appendStatementInput('STATEMENTS').setCheck(null);
        this.setPreviousStatement(true);
        this.setNextStatement(true, null);
        this.setColour(290);
        this.setTooltip('Hace que el sonido oscile de izquierda a derecha rítmicamente.');
    }
};

Blockly.JavaScript['effect_autopanner'] = function (block) {
    let frequency = block.getFieldValue('FREQUENCY');
    let type      = block.getFieldValue('TYPE');
    let depth     = block.getFieldValue('DEPTH');
    let wet       = block.getFieldValue('WET');
    let myNum = num++;

    let effectOptions = `{frequency: ${frequency}, type: "${type}", depth: ${depth}, wet: ${wet}}`;
    let code = `var prev_dest_${myNum} = typeof current_dest !== 'undefined' ? current_dest : Tone.Destination;\n`;
    code += `const effect_${myNum} = new Tone.AutoPanner(${effectOptions}).connect(prev_dest_${myNum});\n`;
    code += `if (typeof effect_${myNum}.start === 'function') effect_${myNum}.start();\n`;
    code += `current_dest = effect_${myNum};\n`;
    code += Blockly.JavaScript.statementToCode(block, 'STATEMENTS');
    code += `current_dest = prev_dest_${myNum};\n`;
    return code;
}
