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
    
    let loopId = num++;
    
    var code = `
  var loop_${loopId} = new Tone.Loop(function(time) {
      let now = time; // Shadow global 'now' inside the loop callback
      let timeDur = 0; // Local timeDur for relative scheduling within this iteration
      
${statement_input}
  }, "${times}").start(now + timeDur);
  // loop infinito, en caso de que queramos que dure un numero finito de veces
  // loop_${loopId}.iterations = 4;
`;
    
    return code;
};
