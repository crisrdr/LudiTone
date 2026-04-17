Blockly.Blocks['effect_phaser'] = {
    init: function () {
        this.appendDummyInput().setAlign(Blockly.ALIGN_LEFT).appendField("Phaser");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Frecuencia").appendField(((function(f){ f.setTooltip(`Frecuencia (Hz):\nVelocidad de la modulación del phaser.`); return f; })(new Blockly.FieldNumber(0.5, 0))), "FREQUENCY");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Octavas").appendField(((function(f){ f.setTooltip(`Octavas:\nRango de barrido del filtro en octavas.`); return f; })(new Blockly.FieldNumber(3, 1))), "OCTAVES");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Stages").appendField(((function(f){ f.setTooltip(`Etapas (stages):\nNúmero de filtros all-pass en cadena. Más = efecto más pronunciado.`); return f; })(new Blockly.FieldNumber(10, 1))), "STAGES");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Q").appendField(((function(f){ f.setTooltip(`Resonancia (Q):\nMás alto = pico de frecuencia más acentuado.`); return f; })(new Blockly.FieldNumber(10, 0))), "Q");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Base Freq").appendField(((function(f){ f.setTooltip(`Frecuencia Base (Hz):\nFrecuencia central desde donde arranca el phaser.`); return f; })(new Blockly.FieldNumber(350, 0))), "BASE_FREQUENCY");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Nivel de efecto (Wet)").appendField(((function(f){ f.setTooltip(`Nivel de efecto (0 a 1):\n0 = Señal limpia original\n1 = Efecto al 100%`); return f; })(new Blockly.FieldNumber(1, 0, 1))), "WET");
        this.appendStatementInput('STATEMENTS').setCheck(null);
        this.setPreviousStatement(true);
        this.setNextStatement(true, null);
        this.setColour(290);
        this.setTooltip('Aplica un efecto phaser con múltiples etapas de filtros all-pass.');
    }
};

Blockly.JavaScript['effect_phaser'] = function (block) {
    let frequency = block.getFieldValue('FREQUENCY');
    let octaves   = block.getFieldValue('OCTAVES');
    let stages    = block.getFieldValue('STAGES');
    let q         = block.getFieldValue('Q');
    let baseFreq  = block.getFieldValue('BASE_FREQUENCY');
    let wet       = block.getFieldValue('WET');
    let myNum = num++;

    let effectOptions = `{frequency: ${frequency}, octaves: ${octaves}, stages: ${stages}, Q: ${q}, baseFrequency: ${baseFreq}, wet: ${wet}}`;
    let code = `var prev_dest_${myNum} = typeof current_dest !== 'undefined' ? current_dest : Tone.Destination;\n`;
    code += `const effect_${myNum} = new Tone.Phaser(${effectOptions}).connect(prev_dest_${myNum});\n`;
    code += `if (typeof effect_${myNum}.start === 'function') effect_${myNum}.start();\n`;
    code += `current_dest = effect_${myNum};\n`;
    code += Blockly.JavaScript.statementToCode(block, 'STATEMENTS');
    code += `current_dest = prev_dest_${myNum};\n`;
    return code;
}
