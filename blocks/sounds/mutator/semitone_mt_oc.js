/**
 * Bloque semitono Mutator con elección de octava
 */

Blockly.Blocks['semitone_mt_oc'] = {
    init: function () {
        this.itemCount_ = 0;
        this.updateShape_();
        this.setPreviousStatement(true);
        this.setNextStatement(true, null);
        this.setColour(20);
        this.setMutator(new Blockly.Mutator(['options_item']));
        this.setTooltip('Reproduce una nota con accidentes (♯, ♭) especificando la octava (1-7).');
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
            var connection = this.getInput('ADD' + i).connection.targetConnection;
            if (connection && connections.indexOf(connection) == -1) {
                connection.disconnect();
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
        // guardamos los valores introducidos
        var savedNote = this.getFieldValue('note');
        var savedAccidental = this.getFieldValue('accidental');
        var savedOctave = this.getFieldValue('octave');

        const notes = [["c", "c"], ["d", "d"], ["e", "e"], ["f", "f"], ["g", "g"], ["a", "a"], ["b", "b"]];
        const accidentals = [["♮ (natural)", ""], ["♯ (sostenido)", "#"], ["♭ (bemol)", "b"]];

        if (this.itemCount_ === 0) {
            if (!this.getInput('BASE')) {
                this.appendDummyInput('BASE')
                    .appendField("semitono")
                    .appendField(new Blockly.FieldDropdown(notes), "note")
                    .appendField(new Blockly.FieldDropdown(accidentals), "accidental")
                    .appendField("octava")
                    .appendField(new Blockly.FieldNumber(4, 1, 7), "octave");
            }
        } else {
            if (this.getInput('BASE')) {
                this.removeInput('BASE');
            }
        }

        // añadir los inputs de las opciones
        for (var i = 0; i < this.itemCount_; i++) {
            if (!this.getInput('ADD' + i)) {
                var input = this.appendValueInput('ADD' + i)
                    .setCheck("options")
                    .setAlign(Blockly.ALIGN_RIGHT);

                if (i === 0) {
                    input.appendField("semitono")
                        .appendField(new Blockly.FieldDropdown(notes), "note")
                        .appendField(new Blockly.FieldDropdown(accidentals), "accidental")
                        .appendField("octava")
                        .appendField(new Blockly.FieldNumber(4, 1, 7), "octave");
                }

                input.appendField("opción");
            } else if (i === 0) {
                if (!this.getField("note")) {
                    this.getInput('ADD0').insertFieldAt(0, "semitono");
                    this.getInput('ADD0').insertFieldAt(1, new Blockly.FieldDropdown(notes), "note");
                    this.getInput('ADD0').insertFieldAt(2, new Blockly.FieldDropdown(accidentals), "accidental");
                    this.getInput('ADD0').insertFieldAt(3, "octava");
                    this.getInput('ADD0').insertFieldAt(4, new Blockly.FieldNumber(4, 1, 7), "octave");
                }
            }
        }

        // quitamos los inputs eliminados
        while (this.getInput('ADD' + i)) {
            this.removeInput('ADD' + i);
            i++;
        }

        // restauramos los valores
        if (savedNote !== null && this.getField('note')) {
            this.setFieldValue(savedNote, 'note');
        }
        if (savedAccidental !== null && this.getField('accidental')) {
            this.setFieldValue(savedAccidental, 'accidental');
        }
        if (savedOctave !== null && this.getField('octave')) {
            this.setFieldValue(savedOctave, 'octave');
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

Blockly.JavaScript['semitone_mt_oc'] = function (block) {
    const noteName = block.getFieldValue('note');
    const accidental = block.getFieldValue('accidental');
    const octave = block.getFieldValue('octave');
    const note = noteName + accidental + octave;

    let dur = 1;
    let volumeParam = '';
    let elements = [];
    for (var i = 0; i < block.itemCount_; i++) {
        var val = Blockly.JavaScript.valueToCode(block, 'ADD' + i, Blockly.JavaScript.ORDER_NONE);
        if (val && val !== "''" && val !== '""' && val !== "null") {
            elements.push(val);
        }
    }

    var optionsCode = '{' + elements.join(', ') + '}';
    let options = {};
    if (optionsCode && optionsCode !== "{}" && optionsCode !== "{null}") {
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
        code += `  synth` + num + `.set({oscillator: {type: '${options.oscillator}'}});\n`;
    }

    // configuración del envelope
    let envParts = [];
    if (options.attack !== undefined) envParts.push(`attack: ${options.attack}`);
    if (options.decay !== undefined) envParts.push(`decay: ${options.decay}`);
    if (options.sustain !== undefined) envParts.push(`sustain: ${options.sustain}`);
    if (options.release !== undefined) envParts.push(`release: ${options.release}`);

    if (envParts.length > 0) {
        code += `  synth` + num + `.set({envelope: {` + envParts.join(', ') + `}});\n`;
    }

    // duración
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

    if (options.volume !== undefined) {
        volumeParam = `, ${options.volume}`;
    }

    let topBlock = block.getSurroundParent();
    let isInsideChord = false;

    while (topBlock) {
        if (topBlock.type.includes('chord')) {
            isInsideChord = true;
            break;
        }
        topBlock = topBlock.getSurroundParent();
    }

    if (isInsideChord) {
        code += `  chordNotesObj.push('${note}');\n`;
    } else {
        if (isPoly) {
            code += `  const baseFreq${num} = Tone.Frequency('${note}').toFrequency();\n`;
            if (options.kind === 'harm') {
                const notes = `[baseFreq${num}, baseFreq${num} * 2, baseFreq${num} * 3, baseFreq${num} * 4]`;
                code += `  Tone.Transport.schedule((time) => { synth${num}.triggerAttackRelease(${notes}, ${dur}, time${volumeParam}); }, timeDur);\n`;
            } else {
                const notes = `[baseFreq${num}, baseFreq${num} * 2.76, baseFreq${num} * 5.40, baseFreq${num} * 8.93]`;
                code += `  Tone.Transport.schedule((time) => { synth${num}.triggerAttackRelease(${notes}, ${dur}, time${volumeParam}); }, timeDur);\n`;
            }
        } else {
            code += `  Tone.Transport.schedule((time) => { synth${num}.triggerAttackRelease('${note}', ${dur}, time${volumeParam}); }, timeDur);\n`;
        }
        code += `  timeDur += ${dur};\n`;
    }

    num++;
    return code;
};
