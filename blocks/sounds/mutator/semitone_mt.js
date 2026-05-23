/**
 * Bloque semitono Mutator
 */

Blockly.Blocks['semitone_mt'] = {
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
        // Save current values if the fields exist to prevent resetting to C4
        var savedNote = this.getFieldValue('note');
        var savedAccidental = this.getFieldValue('accidental');

        const basicNotes = [
            ["c4", "c4"], ["d4", "d4"], ["e4", "e4"],
            ["f4", "f4"], ["g4", "g4"], ["a4", "a4"], ["b4", "b4"]
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
                    .appendField("semitono")
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

                input.appendField("opción");
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

        // Restore saved values
        if (savedNote !== null && this.getField('note')) {
            this.setFieldValue(savedNote, 'note');
        }
        if (savedAccidental !== null && this.getField('accidental')) {
            this.setFieldValue(savedAccidental, 'accidental');
        }
    },
    onchange: function (e) {
        if (!this.workspace || this.workspace.isDragging()) return;

        let topBlock = this.getSurroundParent();
        let isInsideChord = false;
        while (topBlock) {
            if (topBlock.type && topBlock.type.includes('chord')) {
                isInsideChord = true;
                break;
            }
            topBlock = topBlock.getSurroundParent();
        }

        if (isInsideChord) {
            if (this.mutator) {
                if (this.mutator.setVisible) {
                    this.mutator.setVisible(false);
                }
                this.setMutator(null);
            }
        } else {
            if (!this.mutator) {
                this.setMutator(new Blockly.Mutator(['options_item']));
            }
        }
    }
};

Blockly.JavaScript['semitone_mt'] = function (block) {
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

    // 2. Configuramos el envelope (Attack, Decay, Sustain, Release) de forma independiente
    let envParts = [];
    if (options.attack !== undefined) envParts.push(`attack: ${options.attack}`);
    if (options.decay !== undefined) envParts.push(`decay: ${options.decay}`);
    if (options.sustain !== undefined) envParts.push(`sustain: ${options.sustain}`);
    if (options.release !== undefined) envParts.push(`release: ${options.release}`);

    if (envParts.length > 0) {
        code += `  synth` + num + `.set({envelope: {` + envParts.join(', ') + `}});\n`;
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

    const isLive = Blockly.JavaScript.isLiveMode;
    if (isInsideChord) {
        code += `  chordNotesObj.push('${note}');\n`;
    } else {
        if (isPoly) {
            code += `  const baseFreq${num} = Tone.Frequency('${note}').toFrequency();\n`;
            if (options.kind === 'harm') {
                const notes = `[baseFreq${num}, baseFreq${num} * 2, baseFreq${num} * 3, baseFreq${num} * 4]`;
                if (isLive) {
                    code += `  Tone.Transport.schedule((time) => { synth${num}.triggerAttack(${notes}, time${volumeParam}); }, timeDur);\n`;
                } else {
                    code += `  Tone.Transport.schedule((time) => { synth${num}.triggerAttackRelease(${notes}, ${dur}, time${volumeParam}); }, timeDur);\n`;
                }
            } else {
                const notes = `[baseFreq${num}, baseFreq${num} * 2.76, baseFreq${num} * 5.40, baseFreq${num} * 8.93]`;
                if (isLive) {
                    code += `  Tone.Transport.schedule((time) => { synth${num}.triggerAttack(${notes}, time${volumeParam}); }, timeDur);\n`;
                } else {
                    code += `  Tone.Transport.schedule((time) => { synth${num}.triggerAttackRelease(${notes}, ${dur}, time${volumeParam}); }, timeDur);\n`;
                }
            }
        } else {
            if (isLive) {
                code += `  Tone.Transport.schedule((time) => { synth${num}.triggerAttack('${note}', time${volumeParam}); }, timeDur);\n`;
            } else {
                code += `  Tone.Transport.schedule((time) => { synth${num}.triggerAttackRelease('${note}', ${dur}, time${volumeParam}); }, timeDur);\n`;
            }
        }

        if (isInsideSequence) {
            code += `  timeDur += ` + dur + `;\n`;
        }
    }

    num++;
    return code;
};