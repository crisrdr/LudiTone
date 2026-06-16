/**
 * Bloque de tipo acorde Statement escala principal
 * Predefinido - Mayor o menor
 */

Blockly.Blocks['chord_st'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("acorde")
            .appendField(new Blockly.FieldDropdown([["c4", "c4"], ["d4", "d4"], ["e4", "e4"], ["f4", "f4"], ["g4", "g4"], ["a4", "a4"], ["b4", "b4"]]), "note")
            .appendField("tipo")
            .appendField(new Blockly.FieldDropdown([["mayor", "major"], ["menor", "minor"]]), "chord_type");

        this.appendStatementInput('OPTIONS')
            .setCheck("options2")
            .appendField("opciones");

        this.setPreviousStatement(true);
        this.setNextStatement(true, null);
        this.setColour(0);
        this.setTooltip("Reproduce varias notas a la vez. Puedes encajarle opciones en su parte inferior.");
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

Blockly.JavaScript['chord_st'] = function (block) {
    const note = block.getFieldValue('note');
    const chordType = block.getFieldValue('chord_type');
    let dur = 1;
    let waveShape = '';
    let options = {};

    // recolección de opciones
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

    //polyphonic
    code += `const synth` + num + ` = new Tone.PolySynth().connect(typeof current_dest !== 'undefined' ? current_dest : Tone.Destination);\n`;

    // oscilador
    if (options.oscillator) {
        waveShape = options.oscillator;
        code += `  synth` + num + `.set({oscillator: {type: '${waveShape}'}});\n`;
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

    // volumen
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

    //disparamos acorde
    const isLive = Blockly.JavaScript.isLiveMode;
    if (isLive) {
        code += `  Tone.Transport.schedule((time) => { synth${num}.triggerAttack(freqs${num}, time${volumeParam}); }, timeDur);\n`;
    } else {
        code += `  Tone.Transport.schedule((time) => { synth${num}.triggerAttackRelease(freqs${num}, ${dur}, time${volumeParam}); }, timeDur);\n`;
    }

    code += `  timeDur += ` + dur + `;\n`;

    num++;
    return code;
}
