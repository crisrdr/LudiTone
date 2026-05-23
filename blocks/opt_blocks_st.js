/**
 * Bloques de opciones para Statement
 */
Blockly.Blocks['opt_st_wave_shape'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("onda")
            .appendField(new Blockly.FieldDropdown([
                ["sine", "sine"],
                ["square", "square"],
                ["triangle", "triangle"],
                ["sawtooth", "sawtooth"]
            ]), "shape");
        this.setPreviousStatement(true, "options2");
        this.setNextStatement(true, "options2");
        this.setColour(210);
        this.setTooltip("Cambia el tipo de onda, que altera la textura o 'voz' pura del sonido.");
    }
};

Blockly.JavaScript['opt_st_wave_shape'] = function (block) {
    var value = block.getFieldValue('shape');
    var code = `options.oscillator = '${value}';\n`;
    return code;
};

Blockly.Blocks['opt_st_duration'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("duración")
            .appendField(new Blockly.FieldNumber(1, 0.1, 10, 0.1), "dur");
        this.setPreviousStatement(true, "options2");
        this.setNextStatement(true, "options2");
        this.setColour(210);
        this.setTooltip("Controla durante cuánto tiempo se estará reproduciendo la nota.");
    }
};

Blockly.JavaScript['opt_st_duration'] = function (block) {
    var value = block.getFieldValue('dur');
    var code = `options.dur = ${value};\n`;
    return code;
};

Blockly.Blocks['opt_st_attack'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("ataque")
            .appendField(new Blockly.FieldNumber(0.1, 0, 2, 0.01), "attack");
        this.setPreviousStatement(true, "options2");
        this.setNextStatement(true, "options2");
        this.setColour(210);
    }
};


Blockly.JavaScript['opt_st_attack'] = function (block) {
    var value = block.getFieldValue('attack');
    var code = `options.attack = ${value};\n`;
    return code;
};

Blockly.Blocks['opt_st_decay'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("caída")
            .appendField(new Blockly.FieldNumber(0.1, 0, 2, 0.01), "decay");
        this.setPreviousStatement(true, "options2");
        this.setNextStatement(true, "options2");
        this.setColour(210);
    }
};

Blockly.JavaScript['opt_st_decay'] = function (block) {
    var value = block.getFieldValue('decay');
    var code = `options.decay = ${value};\n`;
    return code;
};

Blockly.Blocks['opt_st_sustain'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("sostenimiento")
            .appendField(new Blockly.FieldNumber(0.3, 0, 1, 0.01), "sustain");
        this.setPreviousStatement(true, "options2");
        this.setNextStatement(true, "options2");
        this.setColour(210);
    }
};

Blockly.JavaScript['opt_st_sustain'] = function (block) {
    var value = block.getFieldValue('sustain');
    var code = `options.sustain = ${value};\n`;
    return code;
};

Blockly.Blocks['opt_st_release'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("liberación")
            .appendField(new Blockly.FieldNumber(1, 0.1, 5, 0.1), "release");
        this.setPreviousStatement(true, "options2");
        this.setNextStatement(true, "options2");
        this.setColour(210);
    }
};

Blockly.JavaScript['opt_st_release'] = function (block) {
    var value = block.getFieldValue('release');
    var code = `options.release = ${value};\n`;
    return code;
};

Blockly.Blocks['opt_st_volume'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("volumen")
            .appendField(new Blockly.FieldNumber(1, 0, 10, 0.01), "vol");
        this.setPreviousStatement(true, "options2");
        this.setNextStatement(true, "options2");
        this.setColour(210);
    }
};

Blockly.JavaScript['opt_st_volume'] = function (block) {
    var value = block.getFieldValue('vol');
    var code = `options.volume = ${value};\n`;
    return code;
};

Blockly.Blocks['opt_st_kind'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("tipo")
            .appendField(new Blockly.FieldDropdown([
                ["harmonic", "harm"],
                ["inharmonic", "inharm"]
            ]), "kind");
        this.setPreviousStatement(true, "options2");
        this.setNextStatement(true, "options2");
        this.setColour(210);
    }
};

Blockly.JavaScript['opt_st_kind'] = function (block) {
    var value = block.getFieldValue('kind');
    var code = `options.kind = '${value}';\n`;
    return code;
};

Blockly.Blocks['opt_st_adsr'] = {
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
        this.setPreviousStatement(true, "options2");
        this.setNextStatement(true, "options2");
        this.setColour(210);
    }
};

Blockly.JavaScript['opt_st_adsr'] = function (block) {
    var a = block.getFieldValue('attack');
    var d = block.getFieldValue('decay');
    var s = block.getFieldValue('sustain');
    var r = block.getFieldValue('release');
    var code = `options.attack = ${a};\noptions.decay = ${d};\noptions.sustain = ${s};\noptions.release = ${r};\n`;
    return code;
};
