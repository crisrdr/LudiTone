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
    var originals = synths.map((linea) => linea.split("now + ")[0]);
    var schedules = synths.map((linea) => linea.split("now + ")[1]);
    originals = originals.map((linea) => linea.substring(0, linea.length - 2) + ");");
    schedules = schedules.map((linea) => linea.substring(0, linea.length - 1));

    var code = ``;
    rest.forEach((e, i) => { code = code + e + ';'; });
    originals.forEach((e, i) => {
        const num = schedules[i];
        code = code + 'var loop' + i + ' = new Tone.Loop(function(time){' + e + '}, "' + times + '").start(now + ' + num + '); loop' + i + '.iterations = 4;'
    });
    return code;
};
