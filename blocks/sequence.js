Blockly.Blocks['sequence'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("sequence")
            .appendField("repeat")
            .appendField(new Blockly.FieldNumber(1, 1, 100, 1), "TIMES")
            .appendField("times");
        this.appendStatementInput("DO")
            .setCheck(null);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(212);
        this.setTooltip("Executes notes and chords sequentially, waiting for one to finish before starting the next.");
    }
};

Blockly.JavaScript['sequence'] = function (block) {
    let code = ` var inSequence = true; \n`;
    
    // Convert the statements inside
    let branchCode = Blockly.JavaScript.statementToCode(block, 'DO');
    
    let times = block.getFieldValue('TIMES') || 1;
    let myNum = seqNum;
    seqNum++;
    let loopVar = 'seq_i_' + myNum;
    
    code += `  for (let ${loopVar} = 0; ${loopVar} < ${times}; ${loopVar}++) {\n`;
    code += branchCode;
    code += `  }\n`;
    
    code += `  inSequence = false;`;
    return code;
};
