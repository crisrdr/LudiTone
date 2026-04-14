Blockly.Blocks['chord_ed2'] = {
    init: function () {
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_LEFT)
            .appendField("acorde");
            
        this.appendStatementInput('OPTIONS')
            .setCheck("options2")
            .appendField("opciones");

        this.appendStatementInput('NOTES')
            .setCheck(null);

        this.setPreviousStatement(true);
        this.setNextStatement(true, null);
        this.setColour(0);
        this.setTooltip('A chord wrapper that plays any notes placed inside it simultaneously, with statement options.');
    }
};

Blockly.JavaScript['chord_ed2'] = function (block) {
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

    let myNum = num;
    num++; // Immediately increment so nested blocks use subsequent numbers.

    code += `// --- Start Chord Wrapper ---\n`;
    code += `const chordNotes_${myNum} = [];\n`;
    code += `var chordNotesObj = chordNotes_${myNum};\n`;
    
    // Convert enclosed notes. We need to pass down context.
    let notesCode = Blockly.JavaScript.statementToCode(block, 'NOTES');
    code += notesCode;
    
    code += `// --- Execute PolySynth ---\n`;
    code += `const synth${myNum} = new Tone.PolySynth().connect(typeof current_dest !== 'undefined' ? current_dest : Tone.Destination);\n`;

    if (options.oscillator) {
        waveShape = options.oscillator;
        code += `  synth${myNum}.set({ oscillator: { type: '${waveShape}' } });\n`;
    }

    if (options.attack !== undefined || options.release !== undefined || options.decay !== undefined || options.sustain !== undefined) {
        const a = options.attack !== undefined ? options.attack : 0.005;
        const d = options.decay !== undefined ? options.decay : 0.1;
        const s = options.sustain !== undefined ? options.sustain : 0.3;
        const r = options.release !== undefined ? options.release : 1;
        code += `  synth${myNum}.set({ envelope: { attack: ` + a + `, decay: ` + d + `, sustain: ` + s + `, release: ` + r + ` } });\n`;

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

    // Usar directamente el array recolectado
    code += `  const freqs${myNum} = chordNotes_${myNum}.map(n => Tone.Frequency(n).toFrequency());\n`;

    code += `  if (freqs${myNum}.length > 0) {\n`;
    code += `    Tone.Transport.schedule((time) => { synth${myNum}.triggerAttackRelease(freqs${myNum}, ${dur}, time${volumeParam}); }, timeDur);\n`;
    code += `  }\n`;

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

    code += `// --- End Chord Wrapper ---\n`;

    return code;
}
