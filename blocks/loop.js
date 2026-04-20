Blockly.Blocks['loop'] = {
    init: function () {
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.appendDummyInput()
            .appendField('repetir todo')
            .appendField('a velocidad')
            .appendField(new Blockly.FieldDropdown([["lento", "2n"], ["medio", "4n"], ["rápido", "8n"]]), "times");
        this.appendStatementInput('DO')
            .appendField('hacer');
        this.appendDummyInput()
            .appendField('fin');
        this.setColour(120);
        this.setTooltip("Repite los bloques internos indefinidamente al ritmo elegido.");
    }
};

Blockly.JavaScript['loop'] = function (block) {
    const times = block.getFieldValue('times');
    let loopId = num++;

    // Generar código interno con timeDur renombrado a loopTimeDur
    let innerCode = Blockly.JavaScript.statementToCode(block, 'DO');

    // Renombrar timeDur -> loopTimeDur para no afectar al scope global
    innerCode = innerCode.replace(/\btimeDur\b/g, 'loopTimeDur');

    // Transformar: Tone.Transport.schedule((time) => { BODY }, loopTimeDur);
    // En:          (function(time) { BODY })(loopCallbackTime + loopTimeDur);
    // Esto es necesario porque dentro del callback de scheduleRepeat,
    // los sonidos deben dispararse usando el tiempo absoluto del callback (loopCallbackTime),
    // no programarse de nuevo en el Transport desde tiempo 0.
    innerCode = innerCode.replace(
        /Tone\.Transport\.schedule\s*\(\s*\(time\)\s*=>\s*\{([\s\S]*?)\}\s*,\s*loopTimeDur\s*\)\s*;/g,
        (match, body) => `(function(time) {${body}})(loopCallbackTime + loopTimeDur);`
    );

    var code = `
  Tone.Transport.scheduleRepeat(function(loopCallbackTime) {
    var loopTimeDur = 0;
${innerCode}
  }, "${times}", timeDur);
`;

    return code;
};
