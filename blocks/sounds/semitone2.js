Blockly.Blocks['semitone2'] = {
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

Blockly.JavaScript['semitone2'] = function (block) {
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

    if (options.attack !== undefined || options.release !== undefined || options.decay !== undefined || options.sustain !== undefined) {
        const a = options.attack !== undefined ? options.attack : 0.005;
        const d = options.decay !== undefined ? options.decay : 0.1;
        const s = options.sustain !== undefined ? options.sustain : 0.3;
        const r = options.release !== undefined ? options.release : 1;
        code += `  synth` + num + `.set({ envelope: { attack: ` + a + `, decay: ` + d + `, sustain: ` + s + `, release: ` + r + ` } });\n`;

        if (options.dur !== undefined) {
            dur = options.dur;
        } else {
            dur = a + d + r; 
        }
    } else {
        if (options.dur !== undefined) {
            dur = options.dur;
        }
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
        if (topBlock.type.includes('chord')) {
            isInsideChord = true;
        }
        if (topBlock.type === 'sequence') {
            isInsideSequence = true;
        }
        topBlock = topBlock.getSurroundParent();
    }

    if (isInsideChord) {
        code += `  chordNotesObj.push('${note}');\n`;
    } else {
        if (isPoly) {
            code += `  const baseFreq${num} = Tone.Frequency('${note}').toFrequency();\n`;
            if (options.kind === 'harm') {
                code += `  Tone.Transport.schedule((time) => { synth${num}.triggerAttackRelease([baseFreq${num}, baseFreq${num} * 2, baseFreq${num} * 3, baseFreq${num} * 4], ${dur}, time${volumeParam}); }, timeDur);\n`;
            } else {
                code += `  Tone.Transport.schedule((time) => { synth${num}.triggerAttackRelease([baseFreq${num}, baseFreq${num} * 2.76, baseFreq${num} * 5.40, baseFreq${num} * 8.93], ${dur}, time${volumeParam}); }, timeDur);\n`;
            }
        } else {
            code += `  Tone.Transport.schedule((time) => { synth${num}.triggerAttackRelease('${note}', ${dur}, time${volumeParam}); }, timeDur);\n`;
        }

        if (isInsideSequence) {
            code += `  timeDur += ` + dur + `;\n`;
        }
    }

    num++;
    return code;
};

const semitone2_dur = '<block type="semitone2"><statement name="OPTIONS"><block type="opt2_duration"><field name="dur">1</field></block></statement></block>';
