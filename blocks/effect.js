Blockly.Blocks['effect'] = {
    init: function () {
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_LEFT)
            .appendField("add effect")
            .appendField(new Blockly.FieldDropdown([
                ["Reverb", "JCReverb"], 
                ["Delay", "FeedbackDelay"], 
                ["Distortion", "Distortion"], 
                ["Chorus", "Chorus"], 
                ["BitCrusher", "BitCrusher"], 
                ["PitchShift", "PitchShift"]
            ]), "EFFECT_TYPE");

        this.appendStatementInput('STATEMENTS')
            .setCheck(null);

        this.setPreviousStatement(true);
        this.setNextStatement(true, null);
        this.setColour(290);
        this.setTooltip('Applies an audio effect to all notes placed inside.');
    }
};

Blockly.JavaScript['effect'] = function (block) {
    let effectType = block.getFieldValue('EFFECT_TYPE');

    let code = ``;

    let myNum = num;
    num++; // Increment global counter to ensure unique IDs

    let effectOptions = '';
    switch(effectType) {
        case 'PitchShift': effectOptions = '{pitch: 5}'; break;
        case 'JCReverb': effectOptions = '{roomSize: 0.8, wet: 0.6}'; break;
        case 'FeedbackDelay': effectOptions = '{delayTime: "8n", feedback: 0.4, wet: 0.5}'; break;
        case 'Distortion': effectOptions = '{distortion: 0.8, wet: 0.5}'; break;
        case 'Chorus': effectOptions = '{frequency: 1.5, delayTime: 3.5, depth: 0.7, wet: 0.5}'; break;
        case 'BitCrusher': effectOptions = '{bits: 4, wet: 0.5}'; break;
    }

    code += `// --- Start Effect Wrapper ---\n`;

    // Tone.Freeverb and others can optionally take arguments, but defaults are usually fine.
    // For effect connection chain, current_dest starts as Tone.Destination
    code += `var prev_dest_${myNum} = typeof current_dest !== 'undefined' ? current_dest : Tone.Destination;\n`;

    // Create the effect node and connect it to the PREVIOUS destination
    code += `const effect_${myNum} = new Tone.${effectType}(${effectOptions}).connect(prev_dest_${myNum});\n`;
    code += `if (typeof effect_${myNum}.start === 'function') effect_${myNum}.start();\n`;
    
    // Set the CURRENT destination for inner blocks
    code += `current_dest = effect_${myNum};\n`;

    // Generate the inner code
    let innerCode = Blockly.JavaScript.statementToCode(block, 'STATEMENTS');
    code += innerCode;

    // Restore the PREVIOUS destination for subsequent blocks
    code += `current_dest = prev_dest_${myNum};\n`;
    code += `// --- End Effect Wrapper ---\n`;

    return code;
}
