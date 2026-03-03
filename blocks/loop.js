Blockly.Blocks['loop'] = {
    init: function () {
        this.setPreviousStatement(true);
        this.appendDummyInput()
            .appendField('repeat this')
            .appendField('at')
            .appendField(new Blockly.FieldDropdown([["slow", "2n"], ["medium", "4n"], ["fast", "8n"]]), "times");
        this.appendStatementInput('DO')
            .appendField('do');
        this.appendDummyInput()
            .appendField('end');
    }
};

Blockly.JavaScript['loop'] = function (block) {
    const times = block.getFieldValue('times');
    const statement_input = Blockly.JavaScript.statementToCode(block, 'DO');
    const instructions = statement_input.split(";");
    const synths = instructions.filter((linea) => linea.search("triggerAttackRelease") > -1);
    const rest = instructions.filter((linea) => linea.search("triggerAttackRelease") == -1);

    var code = ``;
    rest.forEach((e) => {
        if (e.trim().length > 0) code += e + '; \n';
    });

    synths.forEach((linea, i) => {
        if (linea.trim().length === 0) return;

        let nowIndex = linea.lastIndexOf("now + ");
        if (nowIndex > -1) {
            let beforeTime = linea.substring(0, nowIndex);
            let afterNow = linea.substring(nowIndex + 6);
            let match = afterNow.match(/([^,)]+)(.*)/);
            if (match) {
                let timeExpr = match[1];
                let afterTime = match[2];
                let loopAction = beforeTime + "time" + afterTime;

                code += `var loop${i}_${num} = new Tone.Loop(function(time){ ${loopAction} }, "${times}").start(now + ${timeExpr});\n`;
                code += `loop${i}_${num}.iterations = 4;\n`;
                return; // successfully matched and written
            }
        }

        // Fallback in case the line didn't match the expected pattern
        code += linea + ';\n';
    });

    return code;
};
