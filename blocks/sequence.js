Blockly.Blocks['sequence'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("secuenciar esto")
            .appendField(new Blockly.FieldNumber(1, 1, 100, 1), "TIMES")
            .appendField("veces");
        this.appendStatementInput("DO")
            .setCheck(null);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(212);
        this.setTooltip("Actúa como un hilo musical: hace sonar las notas una tras otra en orden.");
    }
};

Blockly.JavaScript['sequence'] = function (block) {
    let code = ``;
    
    // Convert the statements inside
    let branchCode = Blockly.JavaScript.statementToCode(block, 'DO');
    
    let times = block.getFieldValue('TIMES') || 1;
    let myNum = seqNum;
    seqNum++;
    let loopVar = 'seq_i_' + myNum;
    
    code += `  for (let ${loopVar} = 0; ${loopVar} < ${times}; ${loopVar}++) {\n`;
    code += branchCode;
    code += `  }\n`;
    
    return code;
};
