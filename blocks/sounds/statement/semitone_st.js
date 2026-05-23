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
    }
};

Blockly.JavaScript['semitone_st'] = function (block) {
    let baseNote = block.getFieldValue('note'); // e.g., 'c4'
    let accidental = block.getFieldValue('accidental'); // e.g., '#' or 'b' or ''

    // Construct the actual Tone.js note string: 'c#4' or 'cb4' or 'c4'
    let pitchClass = baseNote.charAt(0);
    let octave = baseNote.charAt(1);
    const note = pitchClass + accidental + octave;

    let dur = 1;
    let waveShape = '';

    // Options object to be populated by the statements
    let options = {};

    // Evaluate the statements directly into JS string, then run it against `options`
    let optionsCode = Blockly.JavaScript.statementToCode(block, 'OPTIONS');
    if (optionsCode && optionsCode.trim() !== '') {
        try {
            // Evaluates something like: "options.dur = 1;\noptions.oscillator = 'sine';\n"
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

    // 2. Configuramos el envelope (Attack, Decay, Sustain, Release) de forma independiente
    let envParts = [];
    if (options.attack !== undefined) envParts.push(`attack: ${options.attack}`);
    if (options.decay !== undefined) envParts.push(`decay: ${options.decay}`);
    if (options.sustain !== undefined) envParts.push(`sustain: ${options.sustain}`);
    if (options.release !== undefined) envParts.push(`release: ${options.release}`);

    if (envParts.length > 0) {
        code += `  synth` + num + `.set({envelope: {` + envParts.join(', ') + `}});\n`;
    }

    // 3. Configuramos la duración
    // 'dur' representa la duración del sustain. La duración total es A+D+sustain+R.
    const sustainDur = options.dur !== undefined ? options.dur : 1;
    if (options.attack !== undefined || options.decay !== undefined || options.release !== undefined) {
        const a = options.attack !== undefined ? options.attack : 0.005;
        const d = options.decay !== undefined ? options.decay : 0.1;
        const r = options.release !== undefined ? options.release : 1;
        dur = a + d + sustainDur + r;
    } else {
        dur = sustainDur; // Sin envolvente: la duración total es la del sustain
    }

    let volumeParam = '';
    if (options.volume !== undefined) {
        volumeParam = `, ${options.volume}`;
    }

    // Check if we are inside a chord block
    let topBlock = block.getSurroundParent();
    let isInsideChord = false;
    let isInsideSequence = false;

    while (topBlock) {
        if (topBlock.type.includes('chord_mt')) {
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