/**
 * Bloque semitono Statement en escala principal
 */

Blockly.Blocks['semitone_st'] = {
    init: function () {
        const basicNotes = [
            ["c4", "c4"], ["d4", "d4"], ["e4", "e4"],
            ["f4", "f4"], ["g4", "g4"], ["a4", "a4"], ["b4", "b4"]
        ];

        const accidentals = [
            ["♮ (natural)", ""],
            ["♯ (sostenido)", "#"],
            ["♭ (bemol)", "b"]
        ];

        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_LEFT)
            .appendField("semitono")
            .appendField(new Blockly.FieldDropdown(basicNotes), "note")
            .appendField(new Blockly.FieldDropdown(accidentals), "accidental");

        this.appendStatementInput('OPTIONS')
            .setCheck("options2")
            .appendField("opciones");

        this.setPreviousStatement(true);
        this.setNextStatement(true, null);
        this.setColour(20);
        this.setTooltip("Reproduce una nota usando semitonos. Puedes encajarle opciones en su parte interior.");
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

Blockly.JavaScript['semitone_st'] = function (block) {
    let baseNote = block.getFieldValue('note');
    let accidental = block.getFieldValue('accidental');

    let pitchClass = baseNote.charAt(0);
    let octave = baseNote.charAt(1);
    const note = pitchClass + accidental + octave;

    let dur = 1;
    let waveShape = '';

    // opciones
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
        waveShape = options.oscillator;
        code += `  synth` + num + `.set({ oscillator: { type: '${waveShape}' } });\n`;
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

    let volumeParam = '';
    if (options.volume !== undefined) {
        volumeParam = `, ${options.volume}`;
    }

    // eventos acorde y secuencia
    let topBlock = block.getSurroundParent();
    let isInsideChord = false;
    let isInsideSequence = false;

    while (topBlock) {
        if (topBlock.type.includes('chord')) {
            isInsideChord = true;
        }
        if (topBlock.type === 'sequence') {
            isInsideSequence = true;
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

        if (isInsideSequence) {
            code += `  timeDur += ` + dur + `;\n`;
        }
    }

    num++;
    return code;
};