Blockly.Blocks['chord'] = {
    init: function () {
        this.itemCount_ = 0; // Starts with 0 option slots
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
        this.itemCount_ = parseInt(xmlElement.getAttribute('items'), 10);
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
        // Always keep the base fields
        if (!this.getInput('BASE')) {
            this.appendDummyInput('BASE')
                .appendField("acorde")
                .appendField(new Blockly.FieldDropdown([["c4", "c4"], ["d4", "d4"], ["e4", "e4"], ["f4", "f4"], ["g4", "g4"], ["a4", "a4"], ["b4", "b4"]]), "note")
                .appendField("tipo")
                .appendField(new Blockly.FieldDropdown([["mayor", "major"], ["menor", "minor"]]), "chord_type");
        }

        // Add options inputs
        for (var i = 0; i < this.itemCount_; i++) {
            if (!this.getInput('ADD' + i)) {
                var input = this.appendValueInput('ADD' + i)
                    .setCheck("options")
                    .setAlign(Blockly.ALIGN_RIGHT)
                    .appendField("opción");
            }
        }

        // Remove deleted inputs
        while (this.getInput('ADD' + i)) {
            this.removeInput('ADD' + i);
            i++;
        }
    }
};

Blockly.JavaScript['chord'] = function (block) {
    const note = block.getFieldValue('note');
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

    // Major chord: root, major 3rd, perfect 5th (ratios roughly 1, 1.2599, 1.4983 in equal temperament)
    // Minor chord: root, minor 3rd, perfect 5th (ratios roughly 1, 1.1892, 1.4983)
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
