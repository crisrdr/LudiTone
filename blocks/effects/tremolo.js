Blockly.Blocks['effect_tremolo'] = {
    init: function () {
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_LEFT)
            .appendField("Tremolo (LFO Volume)");
            
        let freqField = new Blockly.FieldNumber(9, 0);
        freqField.setTooltip(`Hercios (Hz):
1-5 = Lento y relajado
6-8 = Ritmo tartamudo
10+ = Zumbido rápido`);
            
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Frecuencia")
            .appendField(freqField, "FREQUENCY");
            
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Profundidad")
            .appendField(((function(f){ f.setTooltip(`Profundidad (0 a 1):
0 = Efecto sutil
1 = Efecto muy extremo`); return f; })(new Blockly.FieldNumber(0.75, 0, 1))), "DEPTH");
            
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Nivel de efecto (Wet)")
            .appendField(((function(f){ f.setTooltip(`Nivel de efecto (0 a 1):
0 = Señal limpia original
1 = Efecto al 100%`); return f; })(new Blockly.FieldNumber(1, 0, 1))), "WET");

        this.appendStatementInput('STATEMENTS')
            .setCheck(null);

        this.setPreviousStatement(true);
        this.setNextStatement(true, null);
        this.setColour(290);
        this.setTooltip('Actúa como un filtro de volumen, haciendo que el sonido tiemble.');
    }
};

Blockly.JavaScript['effect_tremolo'] = function (block) {
    let frequency = block.getFieldValue('FREQUENCY');
    let depth = block.getFieldValue('DEPTH');
    let wet = block.getFieldValue('WET');

    let code = ``;

    let myNum = num;
    num++; // Increment global counter to ensure unique IDs

    let effectOptions = `{frequency: ${frequency}, depth: ${depth}, wet: ${wet}}`;

    code += `// --- Start Effect Wrapper ---\n`;

    code += `var prev_dest_${myNum} = typeof current_dest !== 'undefined' ? current_dest : Tone.Destination;\n`;

    code += `const effect_${myNum} = new Tone.Tremolo(${effectOptions}).connect(prev_dest_${myNum});\n`;
    code += `if (typeof effect_${myNum}.start === 'function') effect_${myNum}.start();\n`;
    
    code += `current_dest = effect_${myNum};\n`;

    let innerCode = Blockly.JavaScript.statementToCode(block, 'STATEMENTS');
    code += innerCode;

    code += `current_dest = prev_dest_${myNum};\n`;
    code += `// --- End Effect Wrapper ---\n`;

    return code;
}
