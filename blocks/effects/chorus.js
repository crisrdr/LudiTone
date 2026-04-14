Blockly.Blocks['effect_chorus'] = {
    init: function () {
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_LEFT)
            .appendField("Chorus");
            
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Frecuencia")
            .appendField(((function(f){ f.setTooltip(`Frecuencia:
Controla la velocidad, o sobre qué tono base empieza a girar el efecto.`); return f; })(new Blockly.FieldNumber(1.5, 0))), "FREQUENCY");
            
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Tiempo de retardo")
            .appendField(((function(f){ f.setTooltip(`Tiempo de eco:
Admite tempos como '4n', '8n' o valores numéricos.`); return f; })(new Blockly.FieldNumber(3.5, 0))), "DELAY_TIME");
            
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Profundidad")
            .appendField(((function(f){ f.setTooltip(`Profundidad (0 a 1):
0 = Efecto sutil
1 = Efecto muy extremo`); return f; })(new Blockly.FieldNumber(0.7, 0, 1))), "DEPTH");
            
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Nivel de efecto (Wet)")
            .appendField(((function(f){ f.setTooltip(`Nivel de efecto (0 a 1):
0 = Señal limpia original
1 = Efecto al 100%`); return f; })(new Blockly.FieldNumber(0.5, 0, 1))), "WET");

        this.appendStatementInput('STATEMENTS')
            .setCheck(null);

        this.setPreviousStatement(true);
        this.setNextStatement(true, null);
        this.setColour(290);
        this.setTooltip('Altera el sonido haciendo que parezca que varias personas lo tocan a la vez (Efecto Coro).');
    }
};

Blockly.JavaScript['effect_chorus'] = function (block) {
    let frequency = block.getFieldValue('FREQUENCY');
    let delayTime = block.getFieldValue('DELAY_TIME');
    let depth = block.getFieldValue('DEPTH');
    let wet = block.getFieldValue('WET');

    let code = ``;

    let myNum = num;
    num++; // Increment global counter to ensure unique IDs

    let effectOptions = `{frequency: ${frequency}, delayTime: ${delayTime}, depth: ${depth}, wet: ${wet}}`;

    code += `// --- Start Effect Wrapper ---\n`;

    code += `var prev_dest_${myNum} = typeof current_dest !== 'undefined' ? current_dest : Tone.Destination;\n`;

    code += `const effect_${myNum} = new Tone.Chorus(${effectOptions}).connect(prev_dest_${myNum});\n`;
    code += `if (typeof effect_${myNum}.start === 'function') effect_${myNum}.start();\n`;
    
    code += `current_dest = effect_${myNum};\n`;

    let innerCode = Blockly.JavaScript.statementToCode(block, 'STATEMENTS');
    code += innerCode;

    code += `current_dest = prev_dest_${myNum};\n`;
    code += `// --- End Effect Wrapper ---\n`;

    return code;
}
