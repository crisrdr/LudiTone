Blockly.Blocks['wait'] = {
    init: function () {
        this.setPreviousStatement(true);
        this.appendDummyInput()
            .appendField("wait")
            .appendField(new Blockly.FieldNumber(1, 0, 10, 0.1), "wait");
        this.setNextStatement(true, null);
    }
};

Blockly.JavaScript['wait'] = function (block) {
    const wait = block.getFieldValue('wait');
    timeDur = timeDur + wait;
    const code = ``;
    return code;
};
