Blockly.Blocks['loop'] = {
    init: function () {
        this.setPreviousStatement(true);
        this.appendDummyInput()
            .appendField('repetir esto')
            .appendField('a velocidad')
            .appendField(new Blockly.FieldDropdown([["lento", "2n"], ["medio", "4n"], ["rápido", "8n"]]), "times");
        this.appendStatementInput('DO')
            .appendField('hacer');
        this.appendDummyInput()
            .appendField('fin');
    }
};

Blockly.JavaScript['loop'] = function (block) {
    const times = block.getFieldValue('times');
    const statement_input = Blockly.JavaScript.statementToCode(block, 'DO');
    
    let loopId = num++;
    
    var code = `
  var loop_${loopId} = new Tone.Loop(function(time) {
    //  let now = time; // Shadow global 'now' inside the loop callback
    //  let timeDur = 0; // Local timeDur for relative scheduling within this iteration
      
${statement_input}
  }, "${times}").start(time + timeDur);
  // loop infinito, en caso de que queramos que dure un numero finito de veces
  // loop_${loopId}.iterations = 4;
`;
    
    return code;
};
