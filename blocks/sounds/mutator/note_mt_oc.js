/**
 * Bloque nota simple Mutator con selección de escala
 */
Blockly.Blocks['note_mt_oc'] = {
    init: function () {
        this.itemCount_ = 0;
        this.updateShape_();
        this.setPreviousStatement(true);
        this.setNextStatement(true, null);
        this.setColour(20);
        this.setMutator(new Blockly.Mutator(['options_item']));
        this.setTooltip('Reproduce una nota natural especificando la octava (1-7).');
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
        // Save current values if the fields exist to prevent resetting to C4
        var savedNote = this.getFieldValue('note');
        var savedOctave = this.getFieldValue('octave');

        const notes = [["c", "c"], ["d", "d"], ["e", "e"], ["f", "f"], ["g", "g"], ["a", "a"], ["b", "b"]];

        if (this.itemCount_ === 0) {
            if (!this.getInput('BASE')) {
                this.appendDummyInput('BASE')
                    .appendField("nota")
                    .appendField(new Blockly.FieldDropdown(notes), "note")
                    .appendField("octava")
                    .appendField(new Blockly.FieldNumber(4, 1, 7), "octave");
            }
        } else {
            if (this.getInput('BASE')) {
                this.removeInput('BASE');
            }
        }

        // Add options inputs
        for (var i = 0; i < this.itemCount_; i++) {
            if (!this.getInput('ADD' + i)) {
                var input = this.appendValueInput('ADD' + i)
                    .setCheck("options")
                    .setAlign(Blockly.ALIGN_RIGHT);

                if (i === 0) {
                    input.appendField("nota")
                        .appendField(new Blockly.FieldDropdown(notes), "note")
                        .appendField("octava")
                        .appendField(new Blockly.FieldNumber(4, 1, 7), "octave");
                }

                input.appendField("opción");
            } else if (i === 0) {
                if (!this.getField("note")) {
                    this.getInput('ADD0').insertFieldAt(0, "nota");
                    this.getInput('ADD0').insertFieldAt(1, new Blockly.FieldDropdown(notes), "note");
                    this.getInput('ADD0').insertFieldAt(2, "octava");
                    this.getInput('ADD0').insertFieldAt(3, new Blockly.FieldNumber(4, 1, 7), "octave");
                }
            }
        }

        // Remove deleted inputs
        while (this.getInput('ADD' + i)) {
            this.removeInput('ADD' + i);
            i++;
        }

        // Restore saved values
        if (savedNote !== null && this.getField('note')) {
            this.setFieldValue(savedNote, 'note');
        }
        if (savedOctave !== null && this.getField('octave')) {
            this.setFieldValue(savedOctave, 'octave');
        }
    }
};

Blockly.JavaScript['note_mt_oc'] = function (block) {
    const noteName = block.getFieldValue('note');
    const octave = block.getFieldValue('octave');
    const note = noteName + octave;

    let dur = 1;
    let volumeParam = '';

    // Collect options
    var elements = [];
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
    if (options.dur !== undefined) {
        dur = options.dur;
    } else {
        // Si hay envolvente pero no duración explícita, adaptamos la duración
        // para que de tiempo a que ocurra el ataque y el decaimiento.
        if (options.attack !== undefined || options.decay !== undefined || options.release !== undefined) {
            const a = options.attack !== undefined ? options.attack : 0.005;
            const d = options.decay !== undefined ? options.decay : 0.1;
            const r = options.release !== undefined ? options.release : 1;
            dur = a + d + r;
        } else {
            dur = 1; // Duración estándar de 1 segundo
        }
    }

    if (options.volume !== undefined) {
        volumeParam = `, ${options.volume}`;
    }

    // Scheduling
    let topBlock = block.getSurroundParent();
    let isInsideChord = false;
    let isInsideSequence = false;

    while (topBlock) {
        if (topBlock.type.includes('chord')) isInsideChord = true;
        if (topBlock.type === 'sequence') isInsideSequence = true;
        topBlock = topBlock.getSurroundParent();
    }

    if (isInsideChord) {
        code += `  chordNotesObj.push('${note}');\n`;
    } else {
        const isLive = Blockly.JavaScript.isLiveMode;
        if (isPoly) {
            code += `  const baseFreq${num} = Tone.Frequency('${note}').toFrequency();\n`;
            if (options.kind === 'harm') {
                const notes = `[baseFreq${num}, baseFreq${num} * 2, baseFreq${num} * 3, baseFreq${num} * 4]`;
                if (isLive) {
                    code += `  Tone.Transport.schedule((time) => { synth${num}.triggerAttack(${notes}, time${volumeParam}); }, timeDur);\n`;
                } else {
                    code += `  Tone.Transport.schedule((time) => { synth${num}.triggerAttackRelease(${notes}, ${dur}, time${volumeParam}); }, timeDur);\n`;
                }
            } else { // inharmonic
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
        if (isInsideSequence) code += `  timeDur += ${dur};\n`;
    }

    num++;
    return code;
};
