/**
 * Contenedor de creación de acorde Statement
 */
Blockly.Blocks['chord_st_ed'] = {
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
        this.setTooltip('Agrupa varias notas para forzar que suenen juntas al mismo tiempo (creando un acorde).');
    },

    // Expulsar bloques que no sean options2 que intenten entrar en el OPTIONS
    // y bloques que no sean nota o semitono dentro de las notas del acorde
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
        stmt = this.getInputTargetBlock('NOTES');
        while (stmt) {
            var next = stmt.getNextBlock();
            if (!stmt.type.startsWith('note_') && !stmt.type.startsWith('semitone_')) {
                Blockly.Events.disable();
                try {
                    stmt.unplug(true);
                    stmt.moveBy(30, 30);
                } finally {
                    Blockly.Events.enable();
                }
                if (typeof showBlockWarning === 'function') {
                    showBlockWarning('⚠️ Solo se admiten bloques "nota" o "semitono" dentro de las notas del acorde.');
                }
            }
            stmt = next;
        }        
    }
};

Blockly.JavaScript['chord_st_ed'] = function (block) {
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

    // 2. Configuramos el envelope (Attack, Decay, Sustain, Release) de forma independiente
    let envParts = [];
    if (options.attack !== undefined) envParts.push(`attack: ${options.attack}`);
    if (options.decay !== undefined) envParts.push(`decay: ${options.decay}`);
    if (options.sustain !== undefined) envParts.push(`sustain: ${options.sustain}`);
    if (options.release !== undefined) envParts.push(`release: ${options.release}`);

    if (envParts.length > 0) {
        code += `  synth${myNum}.set({envelope: {` + envParts.join(', ') + `}});\n`;
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

    // Usar directamente el array recolectado
    code += `  const freqs${myNum} = chordNotes_${myNum}.map(n => Tone.Frequency(n).toFrequency());\n`;

    code += `  if (freqs${myNum}.length > 0) {\n`;
    const isLive = Blockly.JavaScript.isLiveMode;
    if (isLive) {
        code += `    Tone.Transport.schedule((time) => { synth${myNum}.triggerAttack(freqs${myNum}, time${volumeParam}); }, timeDur);\n`;
    } else {
        code += `    Tone.Transport.schedule((time) => { synth${myNum}.triggerAttackRelease(freqs${myNum}, ${dur}, time${volumeParam}); }, timeDur);\n`;
    }
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
