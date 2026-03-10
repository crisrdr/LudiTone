// Mutator Container Block
Blockly.Blocks['chord_mutator_container'] = {
    init: function () {
        this.setColour(20);
        this.appendDummyInput()
            .appendField('chord setup');
        this.appendStatementInput('NOTES')
            .setCheck(null)
            .appendField('notes');
        this.appendStatementInput('OPTIONS')
            .setCheck(null)
            .appendField('options');
        this.setTooltip('Add notes or options.');
        this.contextMenu = false;
    }
};

// Mutator Item Block for Notes
Blockly.Blocks['note_item'] = {
    init: function () {
        this.setColour(20);
        this.appendDummyInput()
            .appendField('note');
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('Add a note to the chord.');
        this.contextMenu = false;
    }
};

Blockly.Blocks['chord_ed'] = {
    init: function () {
        this.noteCount_ = 0; // Starts with 0 additional notes
        this.optionCount_ = 0; // Starts with 0 option slots
        this.updateShape_();
        this.setPreviousStatement(true);
        this.setNextStatement(true, null);
        this.setColour(20);
        this.setMutator(new Blockly.Mutator(['note_item', 'options_item']));
    },
    mutationToDom: function () {
        var container = Blockly.utils.xml.createElement('mutation');
        container.setAttribute('notes', this.noteCount_);
        container.setAttribute('options', this.optionCount_);
        return container;
    },
    domToMutation: function (xmlElement) {
        this.noteCount_ = parseInt(xmlElement.getAttribute('notes'), 10) || 0;
        this.optionCount_ = parseInt(xmlElement.getAttribute('options'), 10) || 0;
        this.updateShape_();
    },
    decompose: function (workspace) {
        var containerBlock = workspace.newBlock('chord_mutator_container');
        containerBlock.initSvg();
        
        var connection = containerBlock.getInput('NOTES').connection;
        for (var i = 0; i < this.noteCount_; i++) {
            var itemBlock = workspace.newBlock('note_item');
            itemBlock.initSvg();
            connection.connect(itemBlock.previousConnection);
            connection = itemBlock.nextConnection;
        }

        connection = containerBlock.getInput('OPTIONS').connection;
        for (var i = 0; i < this.optionCount_; i++) {
            var itemBlock = workspace.newBlock('options_item');
            itemBlock.initSvg();
            connection.connect(itemBlock.previousConnection);
            connection = itemBlock.nextConnection;
        }

        return containerBlock;
    },
    compose: function (containerBlock) {
        var itemBlock = containerBlock.getInputTargetBlock('NOTES');
        var noteConnections = [];
        while (itemBlock && !itemBlock.isInsertionMarker()) {
            if (itemBlock.type == 'note_item') {
                noteConnections.push(itemBlock.valueConnection_);
            }
            itemBlock = itemBlock.nextConnection &&
                itemBlock.nextConnection.targetBlock();
        }

        itemBlock = containerBlock.getInputTargetBlock('OPTIONS');
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

        this.noteCount_ = noteConnections.length;
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
        const basicNotes = [["c4", "c4"], ["d4", "d4"], ["e4", "e4"], ["f4", "f4"], ["g4", "g4"]];

        // Base input for the block title 
        // If there are options, we should put the title "chord" on the FIRST option input.
        // Otherwise, it gets its own dummy input.

        // First, check if we need a standalone BASE dummy
        if (this.optionCount_ === 0) {
            if (!this.getInput('BASE_DUMMY')) {
                this.appendDummyInput('BASE_DUMMY')
                    .setAlign(Blockly.ALIGN_LEFT)
                    .appendField("chord");
            }
        } else {
            if (this.getInput('BASE_DUMMY')) {
                this.removeInput('BASE_DUMMY');
            }
        }
        
        // It's easier to rip out all inputs and rebuild them if the structure changes,
        // but rebuilding inputs loses connections. We must use carefully managed input additions.
        // Let's modify the existing approach:
        // 1. Header is 'BASE'
        // 2. Options are 'OPT' + i
        // 3. 'NOTE_BASE_1' and 'NOTE_BASE_2' for the default two notes.
        // 4. 'NOTE' + i for extra notes.

        // Actually, purely visual:
        if (!this.getInput('NOTE_BASE_1')) {
            this.appendDummyInput('NOTE_BASE_1')
                .setAlign(Blockly.ALIGN_LEFT)
                .appendField("note                 ")
                .appendField(new Blockly.FieldDropdown(basicNotes), "note1");
            this.moveInputBefore('NOTE_BASE_1', null); 
        }
        if (!this.getInput('NOTE_BASE_2')) {
            this.appendDummyInput('NOTE_BASE_2')
                .setAlign(Blockly.ALIGN_LEFT)
                .appendField("note                 ")
                .appendField(new Blockly.FieldDropdown(basicNotes), "note2");
        }

        // Add dynamically extra notes
        for (var i = 0; i < this.noteCount_; i++) {
            if (!this.getInput('NOTE' + i)) {
                this.appendDummyInput('NOTE' + i)
                    .setAlign(Blockly.ALIGN_LEFT)
                    .appendField("note                 ")
                    .appendField(new Blockly.FieldDropdown(basicNotes), "note" + (i + 3));
            }
        }

        // Add dynamically options
        for (var i = 0; i < this.optionCount_; i++) {
            if (!this.getInput('OPT' + i)) {
                let input = this.appendValueInput('OPT' + i)
                    .setCheck("options")
                    .setAlign(Blockly.ALIGN_RIGHT);
                
                if (i === 0) {
                    input.appendField("chord", "CHORD_TITLE"); // Title stays on top left
                }
                
                input.appendField("option");
            } else if (i === 0) {
                // Ensure the 0th input has the CHORD_TITLE field if we transitioned from no options.
                if (!this.getField("CHORD_TITLE")) {
                    this.getInput('OPT0').insertFieldAt(0, "chord", "CHORD_TITLE");
                }
            }
        }
        
        // Ensure OPT0 doesn't have CHORD_TITLE if it's somehow not the first one, but i is always 0.
        // Also if we have no options, but had them before, the 'OPT' removal loop below handles it.

        // Remove deleted inputs
        var i_remove = this.noteCount_;
        while (this.getInput('NOTE' + i_remove)) {
            this.removeInput('NOTE' + i_remove);
            i_remove++;
        }

        i_remove = this.optionCount_;
        while (this.getInput('OPT' + i_remove)) {
            this.removeInput('OPT' + i_remove);
            i_remove++;
        }

        // Now, strictly reorder inputs so they appear exactly as requested:
        // 1. BASE_DUMMY (if no options)
        // 2. OPTx (options)
        // 3. NOTE_BASE_1
        // 4. NOTE_BASE_2
        // 5. NOTEx (extra notes)

        var inputOrder = [];
        if (this.optionCount_ === 0 && this.getInput('BASE_DUMMY')) {
            inputOrder.push('BASE_DUMMY');
        }
        for (var i = 0; i < this.optionCount_; i++) {
            if (this.getInput('OPT' + i)) inputOrder.push('OPT' + i);
        }
        inputOrder.push('NOTE_BASE_1');
        inputOrder.push('NOTE_BASE_2');
        for (var i = 0; i < this.noteCount_; i++) {
            inputOrder.push('NOTE' + i);
        }

        // Move inputs to their correct positions
        for (var i = 0; i < inputOrder.length - 1; i++) {
            this.moveInputBefore(inputOrder[i], inputOrder[i+1]);
        }
        // The last one is just naturally at the end relative to the others.
        // If we want to be safe, move it to the end by moving it before `null`
        if (inputOrder.length > 0) {
            this.moveInputBefore(inputOrder[inputOrder.length - 1], null);
        }
    }
};

Blockly.JavaScript['chord_ed'] = function (block) {
    let dur = 1;
    let waveShape = '';

    let noteList = [];
    noteList.push(block.getFieldValue('note1'));
    noteList.push(block.getFieldValue('note2'));

    for (var i = 0; i < block.noteCount_; i++) {
        let n = block.getFieldValue('note' + (i + 3));
        if (n) {
            noteList.push(n);
        }
    }

    // Recolectamos todas las opciones añadidas
    var elements = [];
    for (var i = 0; i < block.optionCount_; i++) {
        var val = Blockly.JavaScript.valueToCode(block, 'OPT' + i,
            Blockly.JavaScript.ORDER_NONE);
        if (val && val !== "''" && val !== '""') {
            elements.push(val);
        }
    }

    // Reconstruimos el string JSON gigante como si viniera de un solo bloque options
    var optionsCode = '{' + elements.join(', ') + '}';

    // Inicializamos un objeto de opciones vacío por defecto
    let options = {};
    if (optionsCode && optionsCode !== "''" && optionsCode !== "null" && optionsCode !== "{}") {
        try {
            options = eval('(' + optionsCode + ')');
        } catch (e) {
            console.error("Error parsing options: ", optionsCode);
        }
    }

    let code = ``;

    code += `const synth` + num + ` = new Tone.PolySynth().toDestination();\n`;

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

    let freqArray = noteList.map(n => `Tone.Frequency('${n}').toFrequency()`);

    if (options.kind === 'inharm') {
        // No debería alterar el acorde. posibilidad de bloqueo ?
    }

    code += `  const freqs${num} = [${freqArray.join(', ')}];\n`;

    code += `  synth` + num + `.triggerAttackRelease(freqs${num}, ` + dur + `, now + ` + timeDur + `${volumeParam});\n`;
    num++;
    return code;
}
