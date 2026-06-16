/**
 * Bloque semitono Statement con selección de octava
 */

Blockly.Blocks['semitone_st_oc'] = {
    init: function () {
        const notes = [["c", "c"], ["d", "d"], ["e", "e"], ["f", "f"], ["g", "g"], ["a", "a"], ["b", "b"]];
        const accidentals = [["♮ (natural)", ""], ["♯ (sostenido)", "#"], ["♭ (bemol)", "b"]];
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_LEFT)
            .appendField("semitono")
            .appendField(new Blockly.FieldDropdown(notes), "note")
            .appendField(new Blockly.FieldDropdown(accidentals), "accidental")
            .appendField("octava")
            .appendField(new Blockly.FieldNumber(4, 1, 7), "octave");

        this.appendStatementInput('OPTIONS')
            .setCheck("options2")
            .appendField("opciones");

        this.setPreviousStatement(true);
        this.setNextStatement(true, null);
        this.setColour(20);
        this.setTooltip("Reproduce una nota con semitono a elegir, especificando la octava (1-7). Puedes encajarle opciones adicionales dentro de la caja.");
    },

    // Expulsar bloques que no sean options2 que intenten entrar en el OPTIONS
    onchange: function (e) {
        if (!this.workspace || this.workspace.isDragging()) return;
        if (e.type !== Blockly.Events.BLOCK_MOVE) return;
        var stmt = this.getInputTargetBlock('OPTIONS');
        while (stmt) {
            var next = stmt.getNextBlock();
            if (!stmt.type.startsWith('opt_st_')) {
                Blockly.Events.disable();
                try {
                    stmt.unplug(true);
                    stmt.moveBy(30, 30);
                } finally {
                    Blockly.Events.enable();
                }
                if (typeof showBlockWarning === 'function') {
                    showBlockWarning('⚠️ Solo se admiten bloques "opciones caja" dentro de las opciones de la nota.');
                }
            }
            stmt = next;
        }
    }
};

Blockly.JavaScript['semitone_st_oc'] = function (block) {
    const noteName = block.getFieldValue('note');
    const accidental = block.getFieldValue('accidental');
    const octave = block.getFieldValue('octave');
    const note = noteName + accidental + octave;

    let dur = 1;
    let volumeParam = '';
    let options = {};

    let optionsCode = Blockly.JavaScript.statementToCode(block, 'OPTIONS');
    if (optionsCode && optionsCode.trim() !== '') {
        try {
            let fn = new Function('options', optionsCode);
            fn(options);
        } catch (e) {
            console.error("Error evaluating options2 blocks in semitone_st_oc. optionsCode:", optionsCode, "Error:", e);
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

    // envolvente
    let envParts = [];
    if (options.attack !== undefined) envParts.push(`attack: ${options.attack}`);
    if (options.decay !== undefined) envParts.push(`decay: ${options.decay}`);
    if (options.sustain !== undefined) envParts.push(`sustain: ${options.sustain}`);
    if (options.release !== undefined) envParts.push(`release: ${options.release}`);

    if (envParts.length > 0) {
        code += `  synth` + num + `.set({envelope: {` + envParts.join(', ') + `}});\n`;
    }

    // duración
    const sustainDur = options.dur !== undefined ? options.dur : 1;
    if (options.attack !== undefined || options.decay !== undefined || options.release !== undefined) {
        const a = options.attack !== undefined ? options.attack : 0.005;
        const d = options.decay !== undefined ? options.decay : 0.1;
        const r = options.release !== undefined ? options.release : 1;
        dur = a + d + sustainDur + r;
    } else {
        dur = sustainDur;
    }

    if (options.volume !== undefined) {
        volumeParam = `, ${options.volume}`;
    }

    let topBlock = block.getSurroundParent();
    let isInsideChord = false;

    while (topBlock) {
        if (topBlock.type.includes('chord')) {
            isInsideChord = true;
            break;
        }
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
            } else {
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

        code += `  timeDur += ` + dur + `;\n`;
    }
    num++;
    return code;
};
