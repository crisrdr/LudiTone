// Mutator Container Block for Options
Blockly.Blocks['chord_ed_mutator_container'] = {
    init: function () {
        this.setColour(0);
        this.appendDummyInput()
            .appendField('configurar acorde');
        this.appendStatementInput('OPTIONS')
            .setCheck(null)
            .appendField('opciones');
        this.setTooltip('Añade diferentes ajustes musicales al acorde completo.');
        this.contextMenu = false;
    }
};

Blockly.Blocks['chord_ed'] = {
    init: function () {
        this.optionCount_ = 0; // Starts with 0 option slots
        this.updateShape_();
        this.setPreviousStatement(true);
        this.setNextStatement(true, null);
        this.setColour(0);
        this.setMutator(new Blockly.Mutator(['options_item']));
        this.setTooltip('Agrupa varias notas para forzar que suenen juntas al mismo tiempo (creando un acorde).');
    },
    mutationToDom: function () {
        var container = Blockly.utils.xml.createElement('mutation');
        container.setAttribute('options', this.optionCount_);
        return container;
    },
    domToMutation: function (xmlElement) {
        this.optionCount_ = parseInt(xmlElement.getAttribute('options'), 10) || 0;
        this.updateShape_();
    },
    decompose: function (workspace) {
        var containerBlock = workspace.newBlock('chord_ed_mutator_container');
        containerBlock.initSvg();

        var connection = containerBlock.getInput('OPTIONS').connection;
        for (var i = 0; i < this.optionCount_; i++) {
            var itemBlock = workspace.newBlock('options_item');
            itemBlock.initSvg();
            connection.connect(itemBlock.previousConnection);
            connection = itemBlock.nextConnection;
        }

        return containerBlock;
    },
    compose: function (containerBlock) {
        var itemBlock = containerBlock.getInputTargetBlock('OPTIONS');
        var optionConnections = [];
        while (itemBlock && !itemBlock.isInsertionMarker()) {
            if (itemBlock.type == 'options_item') {
                optionConnections.push(itemBlock.valueConnection_);
            }
            itemBlock = itemBlock.nextConnection &&
                itemBlock.nextConnection.targetBlock();
        }

        for (var i = 0; i < this.optionCount_; i++) {
            var connection = this.getInput('OPT' + i) && this.getInput('OPT' + i).connection && this.getInput('OPT' + i).connection.targetConnection;
            if (connection && optionConnections.indexOf(connection) == -1) {
                connection.disconnect();
            }
        }

        this.optionCount_ = optionConnections.length;
        this.updateShape_();

        for (var i = 0; i < this.optionCount_; i++) {
            Blockly.Mutator.reconnect(optionConnections[i], this, 'OPT' + i);
        }
    },
    saveConnections: function (containerBlock) {
        var itemBlock = containerBlock.getInputTargetBlock('OPTIONS');
        var i = 0;
        while (itemBlock) {
            var input = this.getInput('OPT' + i);
            itemBlock.valueConnection_ = input && input.connection.targetConnection;
            i++;
            itemBlock = itemBlock.nextConnection &&
                itemBlock.nextConnection.targetBlock();
        }
    },
    updateShape_: function () {
        if (this.optionCount_ === 0) {
            if (!this.getInput('BASE_DUMMY')) {
                this.appendDummyInput('BASE_DUMMY')
                    .setAlign(Blockly.ALIGN_LEFT)
                    .appendField("acorde");
            }
        } else {
            if (this.getInput('BASE_DUMMY')) {
                this.removeInput('BASE_DUMMY');
            }
        }
        
        // Add dynamically options
        for (var i = 0; i < this.optionCount_; i++) {
            if (!this.getInput('OPT' + i)) {
                let input = this.appendValueInput('OPT' + i)
                    .setCheck("options")
                    .setAlign(Blockly.ALIGN_RIGHT);
                
                if (i === 0) {
                    input.appendField("chord", "CHORD_TITLE"); 
                }
                
                input.appendField("opción");
            } else if (i === 0) {
                if (!this.getField("CHORD_TITLE")) {
                    this.getInput('OPT0').insertFieldAt(0, "chord", "CHORD_TITLE");
                }
            }
        }
        
        var i_remove = this.optionCount_;
        while (this.getInput('OPT' + i_remove)) {
            this.removeInput('OPT' + i_remove);
            i_remove++;
        }

        // Always make sure the NOTES statement wrapper is at the bottom
        if (!this.getInput('NOTES')) {
            this.appendStatementInput('NOTES')
                .setCheck(null);
        } else {
            this.moveInputBefore('NOTES', null);
        }
    }
};

Blockly.JavaScript['chord_ed'] = function (block) {
    let dur = 1;
    let waveShape = '';

    // Recolectamos todas las opciones añadidas
    var elements = [];
    for (var i = 0; i < block.optionCount_; i++) {
        var val = Blockly.JavaScript.valueToCode(block, 'OPT' + i,
            Blockly.JavaScript.ORDER_NONE);
        if (val && val !== "''" && val !== '""') {
            elements.push(val);
        }
    }

    var optionsCode = '{' + elements.join(', ') + '}';

    let options = {};
    if (optionsCode && optionsCode !== "''" && optionsCode !== "null" && optionsCode !== "{}") {
        try {
            options = eval('(' + optionsCode + ')');
        } catch (e) {
            console.error("Error parsing options: ", optionsCode);
        }
    }

    let code = ``;

    let myNum = num;
    num++; // Immediately increment so nested blocks use subsequent numbers.

    code += `// --- Start Chord Wrapper ---\n`;
    code += `const chordNotes_${myNum} = [];\n`;
    code += `var chordNotesObj = chordNotes_${myNum};\n`;
    
    // Convert enclosed notes. We need to pass down context.
    // However, since we're using block.getSurroundParent() in children, 
    // the children already know they are inside a chord block!
    // So we don't even need 'var inChord = true' anymore in the generated code.
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
    // Disparamos el acorde
    const isLive = Blockly.JavaScript.isLiveMode;
    if (isLive) {
        code += `  Tone.Transport.schedule((time) => { synth${myNum}.triggerAttack(freqs${myNum}, time${volumeParam}); }, timeDur);\n`;
    } else {
        code += `  Tone.Transport.schedule((time) => { synth${myNum}.triggerAttackRelease(freqs${myNum}, ${dur}, time${volumeParam}); }, timeDur);\n`;
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
