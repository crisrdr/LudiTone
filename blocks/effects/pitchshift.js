Blockly.Blocks['effect_pitchshift'] = {
    init: function () {
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_LEFT)
            .appendField("PitchShift");
            
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Pitch (semitones)")
            .appendField(new Blockly.FieldNumber(5, -36, 36), "PITCH");
            
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Nivel de efecto (Wet)")
            .appendField(new Blockly.FieldNumber(0.5, 0, 1), "WET");

        this.appendStatementInput('STATEMENTS')
            .setCheck(null);

        this.setPreviousStatement(true);
        this.setNextStatement(true, null);
        this.setColour(290);
        this.setTooltip('Applies a PitchShift effect to all notes placed inside.');
    }
};

Blockly.JavaScript['effect_pitchshift'] = function (block) {
    let pitch = block.getFieldValue('PITCH');
    let wet = block.getFieldValue('WET');

    let code = ``;

    let myNum = num;
    num++; // Increment global counter to ensure unique IDs

    let effectOptions = `{pitch: ${pitch}, wet: ${wet}}`;

    code += `// --- Start Effect Wrapper ---\n`;

    code += `var prev_dest_${myNum} = typeof current_dest !== 'undefined' ? current_dest : Tone.Destination;\n`;

    code += `const effect_${myNum} = new Tone.PitchShift(${effectOptions}).connect(prev_dest_${myNum});\n`;
    code += `if (typeof effect_${myNum}.start === 'function') effect_${myNum}.start();\n`;
    
    code += `current_dest = effect_${myNum};\n`;

    let innerCode = Blockly.JavaScript.statementToCode(block, 'STATEMENTS');
    code += innerCode;

    code += `current_dest = prev_dest_${myNum};\n`;
    code += `// --- End Effect Wrapper ---\n`;

    return code;
}
