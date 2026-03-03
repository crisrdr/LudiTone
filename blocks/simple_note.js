Blockly.Blocks['simple_note'] = {
    init: function () {
        this.setPreviousStatement(true);
        this.appendDummyInput()
            .appendField("note")
            .appendField(new Blockly.FieldDropdown([["c4", "c4"], ["d4", "d4"], ["e4", "e4"], ["f4", "f4"], ["g4", "g4"]]), "note");
        this.setNextStatement(true, null);
        this.appendValueInput("options")
            .setCheck("options") // This enforces that only blocks with an output type "options" can connect here
            .appendField("options"); // This adds the visible text "options" next to the hole
        this.setColour(20);
    }

};

Blockly.JavaScript['simple_note'] = function (block) {
    const note = block.getFieldValue('note');
    let dur = 1;
    let waveShape = '';
    let envelopeObj = '';

    // Generamos el código a partir del bloque conectado a "options".
    const optionsCode = Blockly.JavaScript.valueToCode(block, 'options', Blockly.JavaScript.ORDER_NONE);

    // Inicializamos un objeto de opciones vacío por defecto
    let options = {};
    if (optionsCode && optionsCode !== "''" && optionsCode !== "null") {
        try {
            options = eval('(' + optionsCode + ')');
        } catch (e) {
            console.error("Error parsing options: ", optionsCode);
        }
    }

    let isPoly = false;
    let code = ``;

    // Si la opción "kind" existe, usamos PolySynth en vez de Synth normal.
    if (options.kind !== undefined) {
        isPoly = true;
        code += `const synth` + num + ` = new Tone.PolySynth().toDestination();\n`;
    } else {
        code += `const synth` + num + ` = new Tone.Synth().toDestination();\n`;
    }

    // 1. Configuramos el oscilador si está presente
    if (options.oscillator) {
        waveShape = options.oscillator.type;
        code += `  synth` + num + `.set({oscillator: {type: '${waveShape}'}});\n`;
    }

    // 2. Configuramos el envelope (Attack, Release) si hay algo de eso
    if (options.attack !== undefined || options.release !== undefined) {
        const a = options.attack !== undefined ? options.attack : 0.005; // default attack in Tone.js
        const r = options.release !== undefined ? options.release : 1;   // default release in Tone.js
        code += `  synth` + num + `.set({envelope: {attack: ` + a + `, decay: 0.1, sustain: 0.3, release: ` + r + `}});\n`;

        // La duración real afecta también al decaimiento antes del release
        if (options.dur !== undefined) {
            dur = options.dur;
        } else {
            dur = a + r;
        }
    } else {
        // 3. Configuramos la duración simple si no hay envelope pero sí dur
        if (options.dur !== undefined) {
            dur = options.dur;
        }
    }

    // 4. Verificamos si hay volumen
    let volumeParam = '';
    if (options.volume !== undefined) {
        volumeParam = `, ${options.volume}`;
    }

    // Finalmente hacemos que suene
    if (isPoly) {
        code += `  const baseFreq${num} = Tone.Frequency('${note}').toFrequency();\n`;
        if (options.kind === 'harm') {
            code += `  synth` + num + `.triggerAttackRelease([baseFreq${num}, baseFreq${num} * 2, baseFreq${num} * 3, baseFreq${num} * 4], ` + dur + `, now + ` + timeDur + `${volumeParam});\n`;
        } else { // inharmonic
            code += `  synth` + num + `.triggerAttackRelease([baseFreq${num}, baseFreq${num} * 2.76, baseFreq${num} * 5.40, baseFreq${num} * 8.93], ` + dur + `, now + ` + timeDur + `${volumeParam});\n`;
        }
    } else {
        code += `  synth` + num + `.triggerAttackRelease('${note}', ` + dur + `, now + ` + timeDur + `${volumeParam});\n`;
    }

    num++;
    return code;
}
