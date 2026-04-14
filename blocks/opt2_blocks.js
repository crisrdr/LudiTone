Blockly.Blocks['opt2_wave_shape'] = {
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
        this.setTooltip("Select the wave shape");
    }
};

Blockly.JavaScript['opt2_wave_shape'] = function (block) {
    var value = block.getFieldValue('shape');
    var code = `options.oscillator = '${value}';\n`;
    return code;
};

Blockly.Blocks['opt2_duration'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("duración")
            .appendField(new Blockly.FieldNumber(1, 0.1, 10, 0.1), "dur");
        this.setPreviousStatement(true, "options2");
        this.setNextStatement(true, "options2");
        this.setColour(210);
        this.setTooltip("Set the duration of the note");
    }
};

Blockly.JavaScript['opt2_duration'] = function (block) {
    var value = block.getFieldValue('dur');
    var code = `options.dur = ${value};\n`;
    return code;
};

Blockly.Blocks['opt2_attack'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("ataque")
            .appendField(new Blockly.FieldNumber(0.1, 0, 5, 0.01), "attack");
        this.setPreviousStatement(true, "options2");
        this.setNextStatement(true, "options2");
        this.setColour(210);
    }
};

Blockly.JavaScript['opt2_attack'] = function (block) {
    var value = block.getFieldValue('attack');
    var code = `options.attack = ${value};\n`;
    return code;
};

Blockly.Blocks['opt2_release'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("liberación")
            .appendField(new Blockly.FieldNumber(1, 0.1, 10, 0.1), "release");
        this.setPreviousStatement(true, "options2");
        this.setNextStatement(true, "options2");
        this.setColour(210);
    }
};

Blockly.JavaScript['opt2_release'] = function (block) {
    var value = block.getFieldValue('release');
    var code = `options.release = ${value};\n`;
    return code;
};

Blockly.Blocks['opt2_volume'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("volumen")
            .appendField(new Blockly.FieldNumber(1, 0, 2, 0.01), "vol");
        this.setPreviousStatement(true, "options2");
        this.setNextStatement(true, "options2");
        this.setColour(210);
    }
};

Blockly.JavaScript['opt2_volume'] = function (block) {
    var value = block.getFieldValue('vol');
    var code = `options.volume = ${value};\n`;
    return code;
};

Blockly.Blocks['opt2_kind'] = {
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

Blockly.JavaScript['opt2_kind'] = function (block) {
    var value = block.getFieldValue('kind');
    var code = `options.kind = '${value}';\n`;
    return code;
};

Blockly.Blocks['opt2_adsr'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("ADSR")
            .appendField("A")
            .appendField(new Blockly.FieldNumber(0.1, 0, 5, 0.01), "attack")
            .appendField("D")
            .appendField(new Blockly.FieldNumber(0.1, 0, 5, 0.01), "decay")
            .appendField("S")
            .appendField(new Blockly.FieldNumber(0.5, 0, 1, 0.01), "sustain")
            .appendField("R")
            .appendField(new Blockly.FieldNumber(1, 0.1, 10, 0.1), "release");
        this.setPreviousStatement(true, "options2");
        this.setNextStatement(true, "options2");
        this.setColour(210);
    }
};

Blockly.JavaScript['opt2_adsr'] = function (block) {
    var a = block.getFieldValue('attack');
    var d = block.getFieldValue('decay');
    var s = block.getFieldValue('sustain');
    var r = block.getFieldValue('release');
    var code = `options.attack = ${a};\noptions.decay = ${d};\noptions.sustain = ${s};\noptions.release = ${r};\n`;
    return code;
};
