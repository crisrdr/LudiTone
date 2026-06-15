/**
 * Bloque de tipo acorde Mutator con selección de octava
 * Predefinido - Mayor o menor
 */

Blockly.Blocks['chord_mt_oc'] = {
    init: function () {
        this.itemCount_ = 0; // empieza con 0 opciones
        this.updateShape_();
        this.setPreviousStatement(true);
        this.setNextStatement(true, null);
        this.setColour(0);
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
        // guarda los valores para evitar reseteo 
        var savedNote = this.getFieldValue('note');
        var savedOctave = this.getFieldValue('octave');
        var savedChordType = this.getFieldValue('chord_type');

        const notes = [["c", "c"], ["d", "d"], ["e", "e"], ["f", "f"], ["g", "g"], ["a", "a"], ["b", "b"]];

        // mantener los campos base
        if (!this.getInput('BASE')) {
            this.appendDummyInput('BASE')
                .appendField("acorde")
                .appendField(new Blockly.FieldDropdown(notes), "note")
                .appendField("octava")
                .appendField(new Blockly.FieldNumber(4, 1, 7), "octave")
                .appendField("tipo")
                .appendField(new Blockly.FieldDropdown([["mayor", "major"], ["menor", "minor"]]), "chord_type");
        }

        // Añadimos dinámicamente las opciones
        for (var i = 0; i < this.itemCount_; i++) {
            if (!this.getInput('ADD' + i)) {
                var input = this.appendValueInput('ADD' + i)
                    .setCheck("options")
                    .setAlign(Blockly.ALIGN_RIGHT)
                    .appendField("opción");
            }
        }

        // quitamos las opciones eliminadas
        while (this.getInput('ADD' + i)) {
            this.removeInput('ADD' + i);
            i++;
        }

        // Restauramos los valores guardados
        if (savedNote !== null && this.getField('note')) {
            this.setFieldValue(savedNote, 'note');
        }
        if (savedOctave !== null && this.getField('octave')) {
            this.setFieldValue(savedOctave, 'octave');
        }
        if (savedChordType !== null && this.getField('chord_type')) {
            this.setFieldValue(savedChordType, 'chord_type');
        }
    }
};

Blockly.JavaScript['chord_mt_oc'] = function (block) {
    const noteName = block.getFieldValue('note');
    const octave = block.getFieldValue('octave');
    const note = noteName + octave;
    const chordType = block.getFieldValue('chord_type');
    let dur = 1;
    let waveShape = '';

    // Recolectamos todas las opciones añadidas
    var elements = new Array(block.itemCount_);
    for (var i = 0; i < block.itemCount_; i++) {
        elements[i] = Blockly.JavaScript.valueToCode(block, 'ADD' + i,
            Blockly.JavaScript.ORDER_NONE) || 'null';
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

    // El acorde es polifónico por naturaleza
    code += `const synth` + num + ` = new Tone.PolySynth().connect(typeof current_dest !== 'undefined' ? current_dest : Tone.Destination);\n`;

    // configuración del oscilador
    if (options.oscillator) {
        waveShape = options.oscillator;
        code += `  synth` + num + `.set({oscillator: {type: '${waveShape}'}});\n`;
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

    // calculamos las frecuencias del acorde
    code += `  const baseFreq${num} = Tone.Frequency('${note}').toFrequency();\n`;

    if (chordType === 'major') {
        code += `  const freqs${num} = [baseFreq${num}, baseFreq${num} * 1.25992, baseFreq${num} * 1.4983];\n`;
    } else {
        code += `  const freqs${num} = [baseFreq${num}, baseFreq${num} * 1.1892, baseFreq${num} * 1.4983];\n`;
    }

    // Disparamos el acorde
    const isLive = Blockly.JavaScript.isLiveMode;
    if (isLive) {
        code += `  Tone.Transport.schedule((time) => { synth${num}.triggerAttack(freqs${num}, time${volumeParam}); }, timeDur);\n`;
    } else {
        code += `  Tone.Transport.schedule((time) => { synth${num}.triggerAttackRelease(freqs${num}, ${dur}, time${volumeParam}); }, timeDur);\n`;
    }

    // comprobamos si está dentro de un bloque sequence
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
};
