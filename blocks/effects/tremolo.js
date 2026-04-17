Blockly.Blocks['effect_tremolo'] = {
    init: function () {
        this.appendDummyInput().setAlign(Blockly.ALIGN_LEFT).appendField("Tremolo (LFO Volume)");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Frecuencia").appendField(((function(f){ f.setTooltip(`Hercios (Hz):\n1-5 = Lento y relajado\n6-8 = Ritmo tartamudo\n10+ = Zumbido rápido`); return f; })(new Blockly.FieldNumber(10, 0))), "FREQUENCY");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Tipo").appendField(((function(f){ f.setTooltip(`Forma de onda del LFO de volumen:\nsine = Fluctuación suave y continua\nsquare = El volumen se corta y vuelve bruscamente\ntriangle = Similar al seno pero más angular\nsawtooth = Sube gradualmente y cae en seco`); return f; })(new Blockly.FieldDropdown([["sine","sine"],["square","square"],["triangle","triangle"],["sawtooth","sawtooth"]]))), "TYPE");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Profundidad").appendField(((function(f){ f.setTooltip(`Profundidad (0 a 1):\n0 = Efecto sutil\n1 = Efecto muy extremo`); return f; })(new Blockly.FieldNumber(0.5, 0, 1))), "DEPTH");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Spread (grados)").appendField(((function(f){ f.setTooltip(`Spread (0 a 180°):\nSeparación de fase entre canales estéreo.`); return f; })(new Blockly.FieldNumber(180, 0, 180))), "SPREAD");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Nivel de efecto (Wet)").appendField(((function(f){ f.setTooltip(`Nivel de efecto (0 a 1):\n0 = Señal limpia original\n1 = Efecto al 100%`); return f; })(new Blockly.FieldNumber(1, 0, 1))), "WET");
        this.appendStatementInput('STATEMENTS').setCheck(null);
        this.setPreviousStatement(true);
        this.setNextStatement(true, null);
        this.setColour(290);
        this.setTooltip('Actúa como un filtro de volumen, haciendo que el sonido tiemble.');
    }
};

Blockly.JavaScript['effect_tremolo'] = function (block) {
    let frequency = block.getFieldValue('FREQUENCY');
    let type      = block.getFieldValue('TYPE');
    let depth     = block.getFieldValue('DEPTH');
    let spread    = block.getFieldValue('SPREAD');
    let wet       = block.getFieldValue('WET');
    let myNum = num++;

    let effectOptions = `{frequency: ${frequency}, type: "${type}", depth: ${depth}, spread: ${spread}, wet: ${wet}}`;
    let code = `var prev_dest_${myNum} = typeof current_dest !== 'undefined' ? current_dest : Tone.Destination;\n`;
    code += `const effect_${myNum} = new Tone.Tremolo(${effectOptions}).connect(prev_dest_${myNum});\n`;
    code += `if (typeof effect_${myNum}.start === 'function') effect_${myNum}.start();\n`;
    code += `current_dest = effect_${myNum};\n`;
    code += Blockly.JavaScript.statementToCode(block, 'STATEMENTS');
    code += `current_dest = prev_dest_${myNum};\n`;
    return code;
}
