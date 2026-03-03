Blockly.Blocks['opt_wave_shape'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("shape")
            .appendField(new Blockly.FieldDropdown([
                ["sine", "sine"],
                ["square", "square"],
                ["triangle", "triangle"],
                ["sawtooth", "sawtooth"]
            ]), "shape");
        this.setOutput(true, "options");
        this.setColour(210); // Blue hue
        this.setTooltip("Select the wave shape");
    }
};

Blockly.JavaScript['opt_wave_shape'] = function (block) {
    var value = block.getFieldValue('shape');
    var code = `oscillator: {type: '${value}'}`;
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.Blocks['opt_duration'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("duration")
            .appendField(new Blockly.FieldNumber(1, 0.1, 10, 0.1), "dur");
        this.setOutput(true, "options");
        this.setColour(210);
        this.setTooltip("Set the duration of the note");
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
            .appendField("attack")
            .appendField(new Blockly.FieldNumber(0.1, 0, 5, 0.01), "attack");
        this.setOutput(true, "options");
        this.setColour(210);
    }
};

Blockly.JavaScript['opt_attack'] = function (block) {
    var value = block.getFieldValue('attack');
    var code = `attack: ${value}`;
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.Blocks['opt_release'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("release")
            .appendField(new Blockly.FieldNumber(1, 0.1, 10, 0.1), "release");
        this.setOutput(true, "options");
        this.setColour(210);
    }
};

Blockly.JavaScript['opt_release'] = function (block) {
    var value = block.getFieldValue('release');
    var code = `release: ${value}`;
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};
