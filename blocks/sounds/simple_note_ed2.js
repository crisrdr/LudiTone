Blockly.Blocks['simple_note_ed2'] = {
    init: function () {
        const notes = [["c", "c"], ["d", "d"], ["e", "e"], ["f", "f"], ["g", "g"], ["a", "a"], ["b", "b"]];
        this.appendDummyInput()
            .appendField("nota")
            .appendField(new Blockly.FieldDropdown(notes), "note")
            .appendField("octava")
            .appendField(new Blockly.FieldNumber(4, 1, 7), "octave");
        this.appendStatementInput('OPTIONS')
            .setCheck("options2")
            .appendField("opciones");
        this.setPreviousStatement(true);
        this.setNextStatement(true, null);
        this.setColour(20);
        this.setTooltip("Reproduce una nota natural especificando la octava (1-7). Puedes encajarle opciones adicionales.");
    }
};

Blockly.JavaScript['simple_note_ed2'] = function (block) {
    const noteName = block.getFieldValue('note');
    const octave = block.getFieldValue('octave');
    const note = noteName + octave;
    
    let dur = 1;
    let volumeParam = '';
    let options = {};
    
    let optionsCode = Blockly.JavaScript.statementToCode(block, 'OPTIONS');
    if (optionsCode && optionsCode.trim() !== '') {
        try {
            let fn = new Function('options', optionsCode);
            fn(options);
        } catch (e) { 
            console.error("Error evaluating options2 blocks: ", e); 
        }
    }

    let isPoly = false;
    let code = ``;

    if (options.kind !== undefined && options.kind !== null) {
        isPoly = true;
        code += `const synth` + num + ` = new Tone.PolySynth().connect(typeof current_dest !== 'undefined' ? current_dest : Tone.Destination);\n`;
    } else {
        code += `const synth` + num + ` = new Tone.Synth().connect(typeof current_dest !== 'undefined' ? current_dest : Tone.Destination);\n`;
    }

    if (options.oscillator) {
        code += `  synth` + num + `.set({oscillator: {type: '${options.oscillator}'}});\n`;
    }

    if (options.attack !== undefined || options.release !== undefined || options.decay !== undefined || options.sustain !== undefined) {
        const a = options.attack !== undefined ? options.attack : 0.005;
        const d = options.decay !== undefined ? options.decay : 0.1;
        const s = options.sustain !== undefined ? options.sustain : 0.3;
        const r = options.release !== undefined ? options.release : 1;
        code += `  synth` + num + `.set({envelope: {attack: ${a}, decay: ${d}, sustain: ${s}, release: ${r}}});\n`;
        dur = options.dur !== undefined ? options.dur : (a + d + r);
    } else if (options.dur !== undefined) {
        dur = options.dur;
    }

    if (options.volume !== undefined) {
        volumeParam = `, ${options.volume}`;
    }

    // Scheduling
    let topBlock = block.getSurroundParent();
    let isInsideChord = false;
    let isInsideSequence = false;

    while (topBlock) {
        if (topBlock.type.includes('chord')) isInsideChord = true;
        if (topBlock.type === 'sequence') isInsideSequence = true;
        topBlock = topBlock.getSurroundParent();
    }

    const isLive = Blockly.JavaScript.isLiveMode;
    if (isInsideChord) {
        code += `  chordNotesObj.push('${note}');\n`;
    } else {
        if (isPoly) {
            code += `  const baseFreq${num} = Tone.Frequency('${note}').toFrequency();\n`;
            if (options.kind === 'harm') {
                const notes = `[baseFreq${num}, baseFreq${num} * 2, baseFreq${num} * 3, baseFreq${num} * 4]`;
                if (isLive) {
                    code += `  Tone.Transport.schedule((time) => { synth${num}.triggerAttack(${notes}, time${volumeParam}); }, timeDur);\n`;
                } else {
                    code += `  Tone.Transport.schedule((time) => { synth${num}.triggerAttackRelease(${notes}, ${dur}, time${volumeParam}); }, timeDur);\n`;
                }
            } else { // inharmonic
                const notes = `[baseFreq${num}, baseFreq${num} * 2.76, baseFreq${num} * 5.40, baseFreq${num} * 8.93]`;
                if (isLive) {
                    code += `  Tone.Transport.schedule((time) => { synth${num}.triggerAttack(${notes}, time${volumeParam}); }, timeDur);\n`;
                } else {
                    code += `  Tone.Transport.schedule((time) => { synth${num}.triggerAttackRelease(${notes}, ${dur}, time${volumeParam}); }, timeDur);\n`;
                }
            }
        } else {
            if (isLive) {
                code += `  Tone.Transport.schedule((time) => { synth${num}.triggerAttack('${note}', time${volumeParam}); }, timeDur);\n`;
            } else {
                code += `  Tone.Transport.schedule((time) => { synth${num}.triggerAttackRelease('${note}', ${dur}, time${volumeParam}); }, timeDur);\n`;
            }
        }

        if (isInsideSequence) {
            code += `  timeDur += ` + dur + `;\n`;
        }
    }
    num++;
    return code;
};
