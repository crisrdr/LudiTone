/**
 * Bloques de opciones para Statement
 */
Blockly.Blocks['opt_wave_shape'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("onda")
            .appendField(new Blockly.FieldDropdown([
                ["sine", "sine"],
                ["square", "square"],
                ["triangle", "triangle"],
                ["sawtooth", "sawtooth"]
            ]), "shape");
        this.setOutput(true, "options");
        this.setColour(210);
        this.setTooltip("Cambia el tipo de onda, que altera la textura o 'voz' pura del sonido.");
    }
};

Blockly.JavaScript['opt_wave_shape'] = function (block) {
    var value = block.getFieldValue('shape');
    var code = `oscillator: '${value}'`;
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.Blocks['opt_duration'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("duración")
            .appendField(new Blockly.FieldNumber(1, 0.1, 10, 0.1), "dur");
        this.setOutput(true, "options");
        this.setColour(210);
        this.setTooltip("Controla durante cuánto tiempo se estará reproduciendo la nota.");
    }
};

Blockly.JavaScript['opt_duration'] = function (block) {
    var value = block.getFieldValue('dur');
    var code = `dur: ${value}`;
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.Blocks['opt_attack'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("ataque")
            .appendField(new Blockly.FieldNumber(0.1, 0, 2, 0.01), "attack");
        this.setOutput(true, "options");
        this.setColour(210);
    }
};

Blockly.JavaScript['opt_attack'] = function (block) {
    var value = block.getFieldValue('attack');
    var code = `attack: ${value}`;
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.Blocks['opt_decay'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("caída")
            .appendField(new Blockly.FieldNumber(0.1, 0, 2, 0.01), "decay");
        this.setOutput(true, "options");
        this.setColour(210);
    }
};

Blockly.JavaScript['opt_decay'] = function (block) {
    var value = block.getFieldValue('decay');
    var code = `decay: ${value}`;
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.Blocks['opt_sustain'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("sostenimiento")
            .appendField(new Blockly.FieldNumber(0.3, 0, 1, 0.01), "sustain");
        this.setOutput(true, "options");
        this.setColour(210);
    }
};

Blockly.JavaScript['opt_sustain'] = function (block) {
    var value = block.getFieldValue('sustain');
    var code = `sustain: ${value}`;
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.Blocks['opt_release'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("liberación")
            .appendField(new Blockly.FieldNumber(1, 0.1, 5, 0.1), "release");
        this.setOutput(true, "options");
        this.setColour(210);
    }
};

Blockly.JavaScript['opt_release'] = function (block) {
    var value = block.getFieldValue('release');
    var code = `release: ${value}`;
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.Blocks['opt_volume'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("volumen")
            .appendField(new Blockly.FieldNumber(1, 0, 10, 0.01), "vol");
        this.setOutput(true, "options");
        this.setColour(210);
    }
};

Blockly.JavaScript['opt_volume'] = function (block) {
    var value = block.getFieldValue('vol');
    var code = `volume: ${value}`;
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.Blocks['opt_kind'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("tipo")
            .appendField(new Blockly.FieldDropdown([
                ["harmonic", "harm"],
                ["inharmonic", "inharm"]
            ]), "kind");
        this.setOutput(true, "options");
        this.setColour(210);
    }
};

Blockly.JavaScript['opt_kind'] = function (block) {
    var value = block.getFieldValue('kind');
    var code = `kind: '${value}'`;
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.Blocks['opt_adsr'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("ADSR")
            .appendField("A")
            .appendField(new Blockly.FieldNumber(0.1, 0, 2, 0.01), "attack")
            .appendField("D")
            .appendField(new Blockly.FieldNumber(0.1, 0, 2, 0.01), "decay")
            .appendField("S")
            .appendField(new Blockly.FieldNumber(0.5, 0, 1, 0.01), "sustain")
            .appendField("R")
            .appendField(new Blockly.FieldNumber(1, 0.1, 5, 0.1), "release");
        this.setOutput(true, "options");
        this.setColour(210);
    }
};

Blockly.JavaScript['opt_adsr'] = function (block) {
    var a = block.getFieldValue('attack');
    var d = block.getFieldValue('decay');
    var s = block.getFieldValue('sustain');
    var r = block.getFieldValue('release');
    var code = `attack: ${a}, decay: ${d}, sustain: ${s}, release: ${r}`;
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};
