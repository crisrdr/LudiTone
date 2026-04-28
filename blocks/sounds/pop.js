Blockly.Blocks['pop'] = {
    init: function () {
        this.setPreviousStatement(true);
        this.appendDummyInput()
            .appendField("pop")
            .appendField(new Blockly.FieldDropdown([["burp", "d1"], ["pap", "e2"], ["piu", "f3"], ["fiuuh", "g4"]]), "note");
        this.setNextStatement(true, null);
    }
};

Blockly.JavaScript['pop'] = function (block) {
    const note = block.getFieldValue('note');
    const dur = 1;

    let code = `const synth${num} = new Tone.MembraneSynth().connect(typeof current_dest !== 'undefined' ? current_dest : Tone.Destination);\n`;
    code += `  const isLive = Blockly.JavaScript.isLiveMode;\n`;
    code += `  if (isLive) {\n`;
    code += `    Tone.Transport.schedule((time) => { synth${num}.triggerAttack('${note}', time); }, timeDur);\n`;
    code += `  } else {\n`;
    code += `    Tone.Transport.schedule((time) => { synth${num}.triggerAttackRelease('${note}', ${dur}, time); }, timeDur);\n`;
    code += `  }\n`;

    // Check if inside a sequence to advance timeDur
    let topBlock = block.getSurroundParent();
    let isInsideSequence = false;
    while (topBlock) {
        if (topBlock.type === 'sequence') {
            isInsideSequence = true;
        }
        topBlock = topBlock.getSurroundParent();
    }

    if (isInsideSequence) {
        code += `  timeDur += ${dur};\n`;
    }

    num++;
    return code;
};
