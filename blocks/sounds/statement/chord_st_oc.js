/**
 * Bloque de tipo acorde Statement con selección de octava
 * Predefinido - Mayor o menor
 */

Blockly.Blocks['chord_st_oc'] = {
    init: function () {
        const notes = [["c", "c"], ["d", "d"], ["e", "e"], ["f", "f"], ["g", "g"], ["a", "a"], ["b", "b"]];

        this.appendDummyInput()
            .appendField("acorde")
            .appendField(new Blockly.FieldDropdown(notes), "note")
            .appendField("octava")
            .appendField(new Blockly.FieldNumber(4, 1, 7), "octave")
            .appendField("tipo")
            .appendField(new Blockly.FieldDropdown([["mayor", "major"], ["menor", "minor"]]), "chord_type");

        this.appendStatementInput('OPTIONS')
            .setCheck("options2")
            .appendField("opciones");

        this.setPreviousStatement(true);
        this.setNextStatement(true, null);
        this.setColour(0);
        this.setTooltip("Reproduce un acorde mayor o menor especificando la octava (1-7). Puedes encajarle opciones en su parte inferior.");
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
                    showBlockWarning('⚠️ Solo se admiten bloques "opciones caja" dentro de las opciones del acorde.');
                }
            }
            stmt = next;
        }
    }
};

Blockly.JavaScript['chord_st_oc'] = function (block) {
    const noteName = block.getFieldValue('note');
    const octave = block.getFieldValue('octave');
    const note = noteName + octave;
    const chordType = block.getFieldValue('chord_type');
    let dur = 1;
    let waveShape = '';

    // Options object to be populated by the statements
    let options = {};

    // Evaluate the statements directly into JS string, then run it against `options`
    let optionsCode = Blockly.JavaScript.statementToCode(block, 'OPTIONS');
    if (optionsCode && optionsCode.trim() !== '') {
        try {
            let fn = new Function('options', optionsCode);
            fn(options);
        } catch (e) {
            console.error("Error evaluating options2 blocks: ", e);
        }
    }

    let code = ``;

    // Chord is inherently polyphonic
    code += `const synth` + num + ` = new Tone.PolySynth().connect(typeof current_dest !== 'undefined' ? current_dest : Tone.Destination);\n`;

    // 1. Configuramos el oscilador
    if (options.oscillator) {
        waveShape = options.oscillator;
        code += `  synth` + num + `.set({oscillator: {type: '${waveShape}'}});\n`;
    }

    // 2. Configuramos el envelope
    let envParts = [];
    if (options.attack !== undefined) envParts.push(`attack: ${options.attack}`);
    if (options.decay !== undefined) envParts.push(`decay: ${options.decay}`);
    if (options.sustain !== undefined) envParts.push(`sustain: ${options.sustain}`);
    if (options.release !== undefined) envParts.push(`release: ${options.release}`);

    if (envParts.length > 0) {
        code += `  synth` + num + `.set({envelope: {` + envParts.join(', ') + `}});\n`;
    }

    // 3. Configuramos la duración
    const sustainDur = options.dur !== undefined ? options.dur : 1;
    if (options.attack !== undefined || options.decay !== undefined || options.release !== undefined) {
        const a = options.attack !== undefined ? options.attack : 0.005;
        const d = options.decay !== undefined ? options.decay : 0.1;
        const r = options.release !== undefined ? options.release : 1;
        dur = a + d + sustainDur + r;
    } else {
        dur = sustainDur;
    }

    // 4. Verificamos volumen
    let volumeParam = '';
    if (options.volume !== undefined) {
        volumeParam = `, ${options.volume}`;
    }

    // Calculamos las frecuencias del acorde
    code += `  const baseFreq${num} = Tone.Frequency('${note}').toFrequency();\n`;

    if (chordType === 'major') {
        code += `  const freqs${num} = [baseFreq${num}, baseFreq${num} * 1.25992, baseFreq${num} * 1.4983];\n`;
    } else {
        code += `  const freqs${num} = [baseFreq${num}, baseFreq${num} * 1.1892, baseFreq${num} * 1.4983];\n`;
    }

    // Disparamos el acorde
    const isLive = Blockly.JavaScript.isLiveMode;
    if (isLive) {
        code += `  Tone.Transport.schedule((time) => { synth${num}.triggerAttack(freqs${num}, time${volumeParam}); }, timeDur);\n`;
    } else {
        code += `  Tone.Transport.schedule((time) => { synth${num}.triggerAttackRelease(freqs${num}, ${dur}, time${volumeParam}); }, timeDur);\n`;
    }

    // Check if we are inside a sequence block
    let topBlock = block.getSurroundParent();
    let isInsideSequence = false;

    while (topBlock) {
        if (topBlock.type === 'sequence') {
            isInsideSequence = true;
            break;
        }
        topBlock = topBlock.getSurroundParent();
    }

    if (isInsideSequence) {
        code += `  timeDur += ` + dur + `;\n`;
    }

    num++;
    return code;
};
