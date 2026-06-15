/**
 * Bloque de nota simple Mutator en escala principal
 */
Blockly.Blocks['note_mt'] = {
    init: function () {
        this.itemCount_ = 0; // empieza con 0 opciones
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
        // siempre mantiene el campo "nota"
        if (!this.getInput('BASE')) {
            this.appendDummyInput('BASE')
                .appendField(Blockly.Msg['SIMPLE_NOTE_LABEL'] || "nota", "NOTE_LABEL")
                .appendField(new Blockly.FieldDropdown([["c4", "c4"], ["d4", "d4"], ["e4", "e4"], ["f4", "f4"], ["g4", "g4"], ["a4", "a4"], ["b4", "b4"]]), "note");
        }

        // añade dinámicamente las opciones
        for (var i = 0; i < this.itemCount_; i++) {
            if (!this.getInput('ADD' + i)) {
                var input = this.appendValueInput('ADD' + i)
                    .setCheck("options")
                    .setAlign(Blockly.ALIGN_RIGHT)
                    .appendField("opción");
            }
        }

        // quita las opciones eliminadas
        while (this.getInput('ADD' + i)) {
            this.removeInput('ADD' + i);
            i++;
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

// Bloque contenedor del mutator
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

// Bloque item del mutator
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

Blockly.JavaScript['note_mt'] = function (block) {
    const note = block.getFieldValue('note');
    let dur = 1;
    let waveShape = '';

    // cogemos las opciones
    var elements = new Array(block.itemCount_);
    for (var i = 0; i < block.itemCount_; i++) {
        elements[i] = Blockly.JavaScript.valueToCode(block, 'ADD' + i,
            Blockly.JavaScript.ORDER_NONE) || 'null';
    }

    // reconstruimos el string JSON
    var optionsCode = '{' + elements.join(', ') + '}';

    // inicializamos objeto de opciones por defecto
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

    // configuración del oscilador si está presente
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

    // volumen
    let volumeParam = '';
    if (options.volume !== undefined) {
        volumeParam = `, ${options.volume}`;
    }

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

const note_mt_dur = '<block type="note_mt"><mutation items="1"></mutation><value name="ADD0"><shadow type="opt_mt_duration"><field name="dur">1</field></shadow></value></block>';
const note_mt_vol = '<block type="note_mt"><mutation items="1"></mutation><value name="ADD0"><shadow type="opt_mt_volume"><field name="vol">1</field></shadow></value></block>';
