Blockly.Blocks['repeat'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("repetir esto")
            .appendField(new Blockly.FieldNumber(1, 1, 30, 1), "TIMES")
            .appendField("veces");
        this.appendStatementInput("DO")
            .setCheck(null);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(212);
        this.setTooltip("Repite las notas de su interior secuencialmente. No admite bloques de tipo 'repetir con ritmo' en su interior.");
    },

    // Expulsar bloque 'loop'
    onchange: function (e) {
        if (!this.workspace || this.workspace.isDragging()) return;
        if (e.type !== Blockly.Events.BLOCK_MOVE) return;
        var stmt = this.getInputTargetBlock('DO');
        while (stmt) {
            var next = stmt.getNextBlock();
            if (stmt.type === 'loop') {
                Blockly.Events.disable();
                try {
                    stmt.unplug(true);
                    stmt.moveBy(30, 30);
                } finally {
                    Blockly.Events.enable();
                }
                if (typeof showBlockWarning === 'function') {
                    showBlockWarning('⚠️ Los bloques "repetir esto" y "repetir con ritmo" no pueden anidarse.');
                }
            }
            stmt = next;
        }
    }
};

Blockly.JavaScript['repeat'] = function (block) {
    let code = ``;

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
