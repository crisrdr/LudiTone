Blockly.Blocks['simple_note2'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg['SIMPLE_NOTE_LABEL'] || "nota")
            .appendField(new Blockly.FieldDropdown([["c4", "c4"], ["d4", "d4"], ["e4", "e4"], ["f4", "f4"], ["g4", "g4"]]), "note");
        this.appendStatementInput('OPTIONS')
            .setCheck("options2")
            .appendField("opciones");
        this.setPreviousStatement(true);
        this.setNextStatement(true, null);
        this.setColour(20);
        this.setTooltip("Reproduce una nota. Puedes encajarle opciones adicionales en su parte inferior.");
    }
};

Blockly.JavaScript['simple_note2'] = function (block) {
    const note = block.getFieldValue('note');
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

    // Si la opción "kind" existe, usamos PolySynth en vez de Synth normal.
    if (options.kind !== undefined && options.kind !== null) {
        isPoly = true;
        code += `const synth` + num + ` = new Tone.PolySynth().connect(typeof current_dest !== 'undefined' ? current_dest : Tone.Destination);\n`;
    } else {
        code += `const synth` + num + ` = new Tone.Synth().connect(typeof current_dest !== 'undefined' ? current_dest : Tone.Destination);\n`;
    }

    // 1. Configuramos el oscilador si está presente
    if (options.oscillator) {
        waveShape = options.oscillator;
        code += `  synth` + num + `.set({oscillator: {type: '${waveShape}'}});\n`;
    }

    // 2. Configuramos el envelope (Attack, Decay, Sustain, Release) si hay algo de eso
    if (options.attack !== undefined || options.release !== undefined || options.decay !== undefined || options.sustain !== undefined) {
        const a = options.attack !== undefined ? options.attack : 0.005; // default attack in Tone.js
        const d = options.decay !== undefined ? options.decay : 0.1;     // default decay
        const s = options.sustain !== undefined ? options.sustain : 0.3; // default sustain
        const r = options.release !== undefined ? options.release : 1;   // default release
        code += `  synth` + num + `.set({envelope: {attack: ` + a + `, decay: ` + d + `, sustain: ` + s + `, release: ` + r + `}});\n`;

        // La duración real afecta también al decaimiento antes del release
        if (options.dur !== undefined) {
            dur = options.dur;
        } else {
            dur = a + d + r; // Add decay for reasonable default duration calculation
        }
    } else {
        // 3. Configuramos la duración simple si no hay envelope pero sí dur
        if (options.dur !== undefined) {
            dur = options.dur;
        }
    }

    // 4. Verificamos si hay volumen
    let volumeParam = '';
    if (options.volume !== undefined) {
        volumeParam = `, ${options.volume}`;
    }

    // Finalmente hacemos que suene
    // Check if we are inside a chord block
    let topBlock = block.getSurroundParent();
    let isInsideChord = false;
    let isInsideSequence = false;

    while (topBlock) {
        if (topBlock.type === 'chord' || topBlock.type === 'chord_ed') {
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
            } else { // inharmonic
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
}

const simple_note2_dur = '<block type="simple_note2"><statement name="OPTIONS"><block type="opt2_duration"><field name="dur">1</field></block></statement></block>';
