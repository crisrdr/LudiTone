Blockly.Blocks['effect_chorus'] = {
    init: function () {
        this.appendDummyInput().setAlign(Blockly.ALIGN_LEFT).appendField("Chorus");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Frecuencia").appendField(((function(f){ f.setTooltip(`Frecuencia (Hz):\nVelocidad de la modulación del coro.`); return f; })(new Blockly.FieldNumber(1.5, 0))), "FREQUENCY");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Tiempo de retardo").appendField(((function(f){ f.setTooltip(`Tiempo de retardo (ms):\nRetardo entre la señal original y la copiada.`); return f; })(new Blockly.FieldNumber(3.5, 0))), "DELAY_TIME");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Profundidad").appendField(((function(f){ f.setTooltip(`Profundidad (0 a 1):\n0 = Efecto sutil\n1 = Efecto muy extremo`); return f; })(new Blockly.FieldNumber(0.7, 0, 1))), "DEPTH");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Tipo").appendField(((function(f){ f.setTooltip(`Forma de onda del LFO:\nsine = Modulación suave y natural\nsquare = Modulación abrupta, efecto robótico\ntriangle = Similar al seno pero más angular\nsawtooth = Barrido gradual con caída brusca`); return f; })(new Blockly.FieldDropdown([["sine","sine"],["square","square"],["triangle","triangle"],["sawtooth","sawtooth"]]))), "TYPE");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Spread (grados)").appendField(((function(f){ f.setTooltip(`Spread (0 a 180°):\nSeparación estéreo entre las voces del coro.`); return f; })(new Blockly.FieldNumber(180, 0, 180))), "SPREAD");
        this.appendDummyInput().setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Nivel de efecto (Wet)").appendField(((function(f){ f.setTooltip(`Nivel de efecto (0 a 1):\n0 = Señal limpia original\n1 = Efecto al 100%`); return f; })(new Blockly.FieldNumber(1, 0, 1))), "WET");
        this.appendStatementInput('STATEMENTS').setCheck(null);
        this.setPreviousStatement(true);
        this.setNextStatement(true, null);
        this.setColour(290);
        this.setTooltip('Altera el sonido haciendo que parezca que varias personas lo tocan a la vez (Efecto Coro).');
    }
};

Blockly.JavaScript['effect_chorus'] = function (block) {
    let frequency = block.getFieldValue('FREQUENCY');
    let delayTime = block.getFieldValue('DELAY_TIME');
    let depth     = block.getFieldValue('DEPTH');
    let type      = block.getFieldValue('TYPE');
    let spread    = block.getFieldValue('SPREAD');
    let wet       = block.getFieldValue('WET');
    let myNum = num++;

    let effectOptions = `{frequency: ${frequency}, delayTime: ${delayTime}, depth: ${depth}, type: "${type}", spread: ${spread}, wet: ${wet}}`;
    let code = `var prev_dest_${myNum} = typeof current_dest !== 'undefined' ? current_dest : Tone.Destination;\n`;
    code += `const effect_${myNum} = new Tone.Chorus(${effectOptions}).connect(prev_dest_${myNum});\n`;
    code += `if (typeof effect_${myNum}.start === 'function') effect_${myNum}.start();\n`;
    code += `current_dest = effect_${myNum};\n`;
    code += Blockly.JavaScript.statementToCode(block, 'STATEMENTS');
    code += `current_dest = prev_dest_${myNum};\n`;
    return code;
}
