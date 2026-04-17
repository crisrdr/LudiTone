Blockly.Blocks['effect_autowah'] = {
    init: function () {
        this.appendDummyInput().setAlign(Blockly.ALIGN_LEFT).appendField("AutoWah");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Base Freq").appendField(((function(f){ f.setTooltip(`Frecuencia Base (Hz):\nFrecuencia desde donde arranca la modulación.`); return f; })(new Blockly.FieldNumber(100, 0))), "BASE_FREQUENCY");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Octavas").appendField(((function(f){ f.setTooltip(`Octavas:\nNúmero de octavas por las que se desplaza el filtro.`); return f; })(new Blockly.FieldNumber(6, 1))), "OCTAVES");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Sensitivity").appendField(((function(f){ f.setTooltip(`Sensibilidad (-40 a 0):\nCómo reacciona al volumen de entrada.`); return f; })(new Blockly.FieldNumber(0, -40, 0))), "SENSITIVITY");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Q").appendField(((function(f){ f.setTooltip(`Resonancia (Q):\nMás alto = pico de frecuencia más acentuado.`); return f; })(new Blockly.FieldNumber(2, 0))), "Q");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Gain").appendField(((function(f){ f.setTooltip(`Ganancia:\nAmplificación de la señal del seguidor de envolvente.`); return f; })(new Blockly.FieldNumber(2, 0))), "GAIN");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Follower Attack").appendField(((function(f){ f.setTooltip(`Ataque del Follower (s):\nTiempo de reacción ascendente.`); return f; })(new Blockly.FieldNumber(0.3, 0))), "FOLLOWER_ATTACK");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Follower Release").appendField(((function(f){ f.setTooltip(`Release del Follower (s):\nTiempo de caída.`); return f; })(new Blockly.FieldNumber(0.5, 0))), "FOLLOWER_RELEASE");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Nivel de efecto (Wet)").appendField(((function(f){ f.setTooltip(`Nivel de efecto (0 a 1):\n0 = Señal limpia original\n1 = Efecto al 100%`); return f; })(new Blockly.FieldNumber(1, 0, 1))), "WET");
        this.appendStatementInput('STATEMENTS').setCheck(null);
        this.setPreviousStatement(true);
        this.setNextStatement(true, null);
        this.setColour(290);
        this.setTooltip('Filtro wah automático modulado por la envolvente de la señal de entrada.');
    }
};

Blockly.JavaScript['effect_autowah'] = function (block) {
    let baseFreq        = block.getFieldValue('BASE_FREQUENCY');
    let octaves         = block.getFieldValue('OCTAVES');
    let sensitivity     = block.getFieldValue('SENSITIVITY');
    let q               = block.getFieldValue('Q');
    let gain            = block.getFieldValue('GAIN');
    let followerAttack  = block.getFieldValue('FOLLOWER_ATTACK');
    let followerRelease = block.getFieldValue('FOLLOWER_RELEASE');
    let wet             = block.getFieldValue('WET');
    let myNum = num++;

    let effectOptions = `{baseFrequency: ${baseFreq}, octaves: ${octaves}, sensitivity: ${sensitivity}, Q: ${q}, gain: ${gain}, follower: {attack: ${followerAttack}, release: ${followerRelease}}, wet: ${wet}}`;
    let code = `var prev_dest_${myNum} = typeof current_dest !== 'undefined' ? current_dest : Tone.Destination;\n`;
    code += `const effect_${myNum} = new Tone.AutoWah(${effectOptions}).connect(prev_dest_${myNum});\n`;
    code += `if (typeof effect_${myNum}.start === 'function') effect_${myNum}.start();\n`;
    code += `current_dest = effect_${myNum};\n`;
    code += Blockly.JavaScript.statementToCode(block, 'STATEMENTS');
    code += `current_dest = prev_dest_${myNum};\n`;
    return code;
}
