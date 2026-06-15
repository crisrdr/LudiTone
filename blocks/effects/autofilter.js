Blockly.Blocks['effect_autofilter'] = {
    init: function () {
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_LEFT)
            .appendField("Filtro Automático");

        let freqField = new Blockly.FieldTextInput("4n");
        freqField.setTooltip(`Valores rápidos: 16n, 8n
                                        Valores lentos: 4n, 2n, 1m
                                        O números (ej: 5)`);

        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Frecuencia")
            .appendField(freqField, "FREQUENCY");

        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Profundidad")
            .appendField(((function (f) {
                f.setTooltip(`Profundidad (0 a 1):
                                0 = Efecto sutil
                                1 = Efecto muy extremo`); return f;
            })(new Blockly.FieldNumber(1, 0, 1))), "DEPTH");

        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Nivel de efecto (Wet)")
            .appendField(((function (f) {
                f.setTooltip(`Nivel de efecto (0 a 1):
                                0 = Señal limpia original
                                1 = Efecto al 100%`); return f;
            })(new Blockly.FieldNumber(1, 0, 1))), "WET");

        this.appendStatementInput('STATEMENTS')
            .setCheck(null);

        this.setPreviousStatement(true);
        this.setNextStatement(true, null);
        this.setColour(290);
        this.setTooltip('Aplica un filtro automático, haciendo que el sonido sea más brillante o más opaco rítmicamente.');
    }
};

Blockly.JavaScript['effect_autofilter'] = function (block) {
    let frequency = block.getFieldValue('FREQUENCY');
    let depth = block.getFieldValue('DEPTH');
    let wet = block.getFieldValue('WET');

    let code = ``;

    let myNum = num;
    num++; // Incrementa contador global para asegurar IDs únicos

    let effectOptions = `{frequency: "${frequency}", depth: ${depth}, wet: ${wet}}`;

    code += `// --- Start Effect Wrapper ---\n`;

    code += `var prev_dest_${myNum} = typeof current_dest !== 'undefined' ? current_dest : Tone.Destination;\n`;

    code += `const effect_${myNum} = new Tone.AutoFilter(${effectOptions}).connect(prev_dest_${myNum});\n`;
    code += `if (typeof effect_${myNum}.start === 'function') effect_${myNum}.start();\n`;

    code += `current_dest = effect_${myNum};\n`;

    let innerCode = Blockly.JavaScript.statementToCode(block, 'STATEMENTS');
    code += innerCode;

    code += `current_dest = prev_dest_${myNum};\n`;
    code += `// --- End Effect Wrapper ---\n`;

    return code;
}
