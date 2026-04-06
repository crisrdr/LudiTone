Blockly.Blocks['chord2'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("chord")
            .appendField(new Blockly.FieldDropdown([["c4", "c4"], ["d4", "d4"], ["e4", "e4"], ["f4", "f4"], ["g4", "g4"]]), "note")
            .appendField("type")
            .appendField(new Blockly.FieldDropdown([["major", "major"], ["minor", "minor"]]), "chord_type");
            
        this.appendStatementInput('OPTIONS')
            .setCheck("options2")
            .appendField("options");
            
        this.setPreviousStatement(true);
        this.setNextStatement(true, null);
        this.setColour(0);
        this.setTooltip("A chord block with a statement section for options.");
    }
};

Blockly.JavaScript['chord2'] = function (block) {
    const note = block.getFieldValue('note');
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
    if (options.attack !== undefined || options.release !== undefined || options.decay !== undefined || options.sustain !== undefined) {
        const a = options.attack !== undefined ? options.attack : 0.005;
        const d = options.decay !== undefined ? options.decay : 0.1;
        const s = options.sustain !== undefined ? options.sustain : 0.3;
        const r = options.release !== undefined ? options.release : 1;
        code += `  synth` + num + `.set({envelope: {attack: ` + a + `, decay: ` + d + `, sustain: ` + s + `, release: ` + r + `}});\n`;

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

    // 3. Verificamos volumen
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
    code += `  Tone.Transport.schedule((time) => { synth${num}.triggerAttackRelease(freqs${num}, ${dur}, time${volumeParam}); }, timeDur);\n`;

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
}
