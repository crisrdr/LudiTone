Blockly.Blocks['effect_highpassfilter'] = {
    init: function () {
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_LEFT)
            .appendField("Filtro de Pasa Alta");

        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Frecuencia")
            .appendField(((function (f) {
                f.setTooltip(`Velocidad del LFO que modula el filtro (Hz).
                                Valores bajos (< 1): cambio muy lento
                                Valores altos (> 4): cambio rápido`); return f;
            })(new Blockly.FieldNumber(1, 0))), "FREQUENCY");

        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Frecuencia base (Hz)")
            .appendField(((function (f) {
                f.setTooltip(`Frecuencia central del filtro en Hz.
                                Valores bajos (< 200): corta menos graves
                                Valores altos (> 1000): corta más graves`); return f;
            })(new Blockly.FieldNumber(200, 0))), "BASEFREQUENCY");

        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Octavas")
            .appendField(((function (f) {
                f.setTooltip(`Rango de barrido del filtro en octavas.
                                Valores bajos (< 1): efecto sutil
                                Valores altos (> 4): efecto muy pronunciado`); return f;
            })(new Blockly.FieldNumber(2.6, 0))), "OCTAVES");

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
        this.setTooltip('Aplica un filtro de pasa alta modulado por un LFO. Permite el paso de las frecuencias altas y atenúa las bajas, con barrido controlado por frecuencia base, octavas y velocidad de modulación.');
    }
};

Blockly.JavaScript['effect_highpassfilter'] = function (block) {
    let frequency     = block.getFieldValue('FREQUENCY');
    let baseFrequency = block.getFieldValue('BASEFREQUENCY');
    let octaves       = block.getFieldValue('OCTAVES');
    let wet           = block.getFieldValue('WET');

    let code = ``;

    let myNum = num;
    num++; // Increment global counter to ensure unique IDs

    let effectOptions = `{
                            frequency: ${frequency},
                            type: "sine",
                            depth: 1,
                            baseFrequency: ${baseFrequency},
                            octaves: ${octaves},
                            filter: { type: "highpass", rolloff: -12, Q: 1 },
                            wet: ${wet}
                        }`;

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
