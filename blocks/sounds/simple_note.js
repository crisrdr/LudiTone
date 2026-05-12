Blockly.Blocks['simple_note'] = {
    init: function () {
        this.itemCount_ = 0; // Starts with 0 option slots
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
        // Alwasy keep the base "note" field
        if (!this.getInput('BASE')) {
            this.appendDummyInput('BASE')
                .appendField(Blockly.Msg['SIMPLE_NOTE_LABEL'] || "nota", "NOTE_LABEL")
                .appendField(new Blockly.FieldDropdown([["c4", "c4"], ["d4", "d4"], ["e4", "e4"], ["f4", "f4"], ["g4", "g4"], ["a4", "a4"], ["b4", "b4"]]), "note");
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

// Mutator Container Block
Blockly.Blocks['options_container'] = {
    init: function () {
        this.setColour(120);
        this.appendDummyInput()
            .appendField('opciones');
        this.appendStatementInput('STACK');
        this.setTooltip('Permite añadir, quitar o cambiar el orden de las opciones del bloque.');
        this.contextMenu = false;
    }
};

// Mutator Item Block
Blockly.Blocks['options_item'] = {
    init: function () {
        this.setColour(120);
        this.appendDummyInput()
            .appendField('opción');
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('Añade un nuevo ajuste o característica sonora al bloque.');
        this.contextMenu = false;
    }
};

Blockly.JavaScript['simple_note'] = function (block) {
    const note = block.getFieldValue('note');
    let dur = 1;
    let waveShape = '';

    // Recolectamos todas las opciones añadidas
    var elements = new Array(block.itemCount_);
    for (var i = 0; i < block.itemCount_; i++) {
        elements[i] = Blockly.JavaScript.valueToCode(block, 'ADD' + i,
            Blockly.JavaScript.ORDER_NONE) || 'null';
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

    let isPoly = false;
    let code = ``;

    // Si la opción "kind" existe, usamos PolySynth en vez de Synth normal.
    if (options.kind !== undefined && options.kind !== null) {
        isPoly = true;
        code += `const synth` + num + ` = new Tone.PolySynth().connect(typeof current_dest !== 'undefined' ? current_dest : Tone.Destination);\n`;
    } else {
        code += `const synth` + num + ` = new Tone.Synth().connect(typeof current_dest !== 'undefined' ? current_dest : Tone.Destination);\n`;
    }

    // 1. Configuramos el oscilador si está presente
    if (options.oscillator) {
        waveShape = options.oscillator;
        code += `  synth` + num + `.set({oscillator: {type: '${waveShape}'}});\n`;
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

    // 4. Verificamos si hay volumen
    let volumeParam = '';
    if (options.volume !== undefined) {
        volumeParam = `, ${options.volume}`;
    }

    // Finalmente hacemos que suene
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

        if (isInsideSequence) {
            code += `  timeDur += ` + dur + `;\n`;
        }
    }

    num++;
    return code;
}

const simple_note_dur = '<block type="simple_note"><mutation items="1"></mutation><value name="ADD0"><shadow type="opt_duration"><field name="dur">1</field></shadow></value></block>';
const simple_note_vol = '<block type="simple_note"><mutation items="1"></mutation><value name="ADD0"><shadow type="opt_volume"><field name="vol">1</field></shadow></value></block>';
