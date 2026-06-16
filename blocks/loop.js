Blockly.Blocks['loop'] = {
    init: function () {
        this.setPreviousStatement(true);
        this.setNextStatement(true);

        // validador de repeticiones
        var repsValidator = function (value) {
            var trimmed = (value || '').trim();
            if (trimmed === '' || trimmed === '∞' || trimmed === 'inf' || trimmed === 'Infinity') return '∞';
            var n = parseInt(trimmed, 10);
            if (isNaN(n) || n < 1) return null;
            return String(n);
        };

        this.appendDummyInput()
            .appendField('repetir con ritmo')
            .appendField(new Blockly.FieldTextInput('∞', repsValidator), 'reps')
            .appendField('veces a velocidad')
            .appendField(new Blockly.FieldDropdown([["muy lento","2n"],["lento", "4n"], ["medio", "8n"], ["rápido", "16n"], ["muy rápido","32n"]]), "times");
        this.appendStatementInput('DO')
            .appendField('hacer');
        this.appendDummyInput()
            .appendField('fin');
        this.setColour(120);
        this.setTooltip("Repite los bloques internos a la velocidad seleccionada. Pon '∞' para infinito o un número de veces. No admite bloques de tipo 'repetir esto' en su interior.");
    },

    // expulsar bloque 'repeat' 
    onchange: function (e) {
        if (!this.workspace || this.workspace.isDragging()) return;
        if (e.type !== Blockly.Events.BLOCK_MOVE) return;
        var stmt = this.getInputTargetBlock('DO');
        while (stmt) {
            var next = stmt.getNextBlock();
            if (stmt.type === 'repeat') {
                Blockly.Events.disable();
                try {
                    stmt.unplug(true);
                    stmt.moveBy(30, 30);
                } finally {
                    Blockly.Events.enable();
                }
                if (typeof showBlockWarning === 'function') {
                    showBlockWarning('⚠️ Los bloques "repetir con ritmo" y "repetir esto" no pueden anidarse.');
                }
            }
            stmt = next;
        }
    }
};

Blockly.JavaScript['loop'] = function (block) {
    const times = block.getFieldValue('times');
    const repsRaw = (block.getFieldValue('reps') || '∞').trim();
    const infinite = (repsRaw === '∞' || repsRaw === '');
    const reps = infinite ? null : parseInt(repsRaw, 10);
    let loopId = num++;

    let innerCode = Blockly.JavaScript.statementToCode(block, 'DO');

    innerCode = innerCode.replace(/\btimeDur\b/g, 'loopTimeDur');
    innerCode = innerCode.replace(
        /Tone\.Transport\.schedule\s*\(\s*\(time\)\s*=>\s*\{([\s\S]*?)\}\s*,\s*loopTimeDur\s*\)\s*;/g,
        (match, body) => `(function(time) {${body}})(loopCallbackTime + loopTimeDur);`
    );

    let code;
    if (infinite) {
        code = `
  Tone.Transport.scheduleRepeat(function(loopCallbackTime) {
    var loopTimeDur = 0;
${innerCode}
  }, "${times}", timeDur);
`;
    } else {
        code = `
  (function() {
    var _loopCount_${loopId} = 0;
    var _loopId_${loopId} = Tone.Transport.scheduleRepeat(function(loopCallbackTime) {
      if (_loopCount_${loopId} >= ${reps}) {
        Tone.Transport.clear(_loopId_${loopId});
        return;
      }
      _loopCount_${loopId}++;
      var loopTimeDur = 0;
${innerCode}
    }, "${times}", timeDur);
  })();
`;
    }

    return code;
};
