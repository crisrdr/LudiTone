Blockly.Blocks['semitone'] = {
    init: function () {
        this.itemCount_ = 0;
        this.updateShape_();
        this.setPreviousStatement(true);
        this.setNextStatement(true, null);
        this.setColour(20);
        this.setMutator(new Blockly.Mutator(['options_item']));
    },
    mutationToDom: function () {
        var container = Blockly.utils.xml.createElement('mutation');
        container.setAttribute('items', this.itemCount_);
        return container;
    },
    domToMutation: function (xmlElement) {
        this.itemCount_ = parseInt(xmlElement.getAttribute('items'), 10) || 0;
        this.updateShape_();
    },
    decompose: function (workspace) {
        var containerBlock = workspace.newBlock('options_container');
        containerBlock.initSvg();
        var connection = containerBlock.getInput('STACK').connection;
        for (var i = 0; i < this.itemCount_; i++) {
            var itemBlock = workspace.newBlock('options_item');
            itemBlock.initSvg();
            connection.connect(itemBlock.previousConnection);
            connection = itemBlock.nextConnection;
        }
        return containerBlock;
    },
    compose: function (containerBlock) {
        var itemBlock = containerBlock.getInputTargetBlock('STACK');
        var connections = [];
        while (itemBlock && !itemBlock.isInsertionMarker()) {
            connections.push(itemBlock.valueConnection_);
            itemBlock = itemBlock.nextConnection &&
                itemBlock.nextConnection.targetBlock();
        }
        for (var i = 0; i < this.itemCount_; i++) {
            var input = this.getInput('ADD' + i);
            if (input && input.connection && input.connection.targetConnection) {
                var connection = input.connection.targetConnection;
                if (connection && connections.indexOf(connection) == -1) {
                    connection.disconnect();
                }
            }
        }
        this.itemCount_ = connections.length;
        this.updateShape_();
        for (var i = 0; i < this.itemCount_; i++) {
            Blockly.Mutator.reconnect(connections[i], this, 'ADD' + i);
        }
    },
    saveConnections: function (containerBlock) {
        var itemBlock = containerBlock.getInputTargetBlock('STACK');
        var i = 0;
        while (itemBlock) {
            var input = this.getInput('ADD' + i);
            itemBlock.valueConnection_ = input && input.connection.targetConnection;
            i++;
            itemBlock = itemBlock.nextConnection &&
                itemBlock.nextConnection.targetBlock();
        }
    },
    updateShape_: function () {
        const basicNotes = [
            ["c4", "c4"], ["d4", "d4"], ["e4", "e4"], 
            ["f4", "f4"], ["g4", "g4"], ["a4", "a4"], ["b4", "b4"],
            ["c5", "c5"], ["d5", "d5"], ["e5", "e5"], 
            ["f5", "f5"], ["g5", "g5"], ["a5", "a5"], ["b5", "b5"]
        ];

        const accidentals = [
            ["♮ (natural)", ""],
            ["♯ (sostenido)", "#"],
            ["♭ (bemol)", "b"]
        ];

        if (this.itemCount_ === 0) {
            if (!this.getInput('BASE_DUMMY')) {
                this.appendDummyInput('BASE_DUMMY')
                    .setAlign(Blockly.ALIGN_LEFT)
                    .appendField("semitone")
                    .appendField(new Blockly.FieldDropdown(basicNotes), "note")
                    .appendField(new Blockly.FieldDropdown(accidentals), "accidental");
            }
        } else {
            if (this.getInput('BASE_DUMMY')) {
                this.removeInput('BASE_DUMMY');
            }
        }

        // Add options inputs
        for (var i = 0; i < this.itemCount_; i++) {
            if (!this.getInput('ADD' + i)) {
                let input = this.appendValueInput('ADD' + i)
                    .setCheck("options")
                    .setAlign(Blockly.ALIGN_RIGHT);
                
                if (i === 0) {
                    input.appendField("semitone", "BASE_TITLE")
                         .appendField(new Blockly.FieldDropdown(basicNotes), "note")
                         .appendField(new Blockly.FieldDropdown(accidentals), "accidental");
                }
                
                input.appendField("option");
            } else if (i === 0) {
                if (!this.getField("BASE_TITLE")) {
                    this.getInput('ADD0').insertFieldAt(0, "semitone", "BASE_TITLE");
                    this.getInput('ADD0').insertFieldAt(1, new Blockly.FieldDropdown(basicNotes), "note");
                    this.getInput('ADD0').insertFieldAt(2, new Blockly.FieldDropdown(accidentals), "accidental");
                }
            }
        }

        // Remove deleted inputs
        var i_remove = this.itemCount_;
        while (this.getInput('ADD' + i_remove)) {
            this.removeInput('ADD' + i_remove);
            i_remove++;
        }
    }
};

Blockly.JavaScript['semitone'] = function (block) {
    let baseNote = block.getFieldValue('note'); // e.g., 'c4'
    let accidental = block.getFieldValue('accidental'); // e.g., '#' or 'b' or ''
    
    // Construct the actual Tone.js note string: 'c#4' or 'cb4' or 'c4'
    let pitchClass = baseNote.charAt(0);
    let octave = baseNote.charAt(1);
    const note = pitchClass + accidental + octave;

    let dur = 1;
    let waveShape = '';

    // Coleccionar opciones
    var elements = [];
    for (var i = 0; i < block.itemCount_; i++) {
        var val = Blockly.JavaScript.valueToCode(block, 'ADD' + i, Blockly.JavaScript.ORDER_NONE);
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

const semitone_dur = '<block type="semitone"><mutation items="1"></mutation><value name="ADD0"><shadow type="opt_duration"><field name="dur">1</field></shadow></value></block>';
