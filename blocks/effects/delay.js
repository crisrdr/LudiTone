Blockly.Blocks['effect_delay'] = {
    init: function () {
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_LEFT)
            .appendField("Delay");
            
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Tiempo de retardo")
            .appendField(new Blockly.FieldTextInput("8n"), "DELAY_TIME");
            
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Retroalimentación")
            .appendField(new Blockly.FieldNumber(0.4, 0, 1), "FEEDBACK");
            
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Nivel de efecto (Wet)")
            .appendField(new Blockly.FieldNumber(0.5, 0, 1), "WET");

        this.appendStatementInput('STATEMENTS')
            .setCheck(null);

        this.setPreviousStatement(true);
        this.setNextStatement(true, null);
        this.setColour(290);
        this.setTooltip('Applies a Delay effect to all notes placed inside.');
    }
};

Blockly.JavaScript['effect_delay'] = function (block) {
    let delayTime = block.getFieldValue('DELAY_TIME');
    let feedback = block.getFieldValue('FEEDBACK');
    let wet = block.getFieldValue('WET');

    let code = ``;

    let myNum = num;
    num++; // Increment global counter to ensure unique IDs

    // Delay time is often a string like "8n", so we keep it quoted
    let effectOptions = `{delayTime: "${delayTime}", feedback: ${feedback}, wet: ${wet}}`;

    code += `// --- Start Effect Wrapper ---\n`;

    code += `var prev_dest_${myNum} = typeof current_dest !== 'undefined' ? current_dest : Tone.Destination;\n`;

    code += `const effect_${myNum} = new Tone.FeedbackDelay(${effectOptions}).connect(prev_dest_${myNum});\n`;
    code += `if (typeof effect_${myNum}.start === 'function') effect_${myNum}.start();\n`;
    
    code += `current_dest = effect_${myNum};\n`;

    let innerCode = Blockly.JavaScript.statementToCode(block, 'STATEMENTS');
    code += innerCode;

    code += `current_dest = prev_dest_${myNum};\n`;
    code += `// --- End Effect Wrapper ---\n`;

    return code;
}
