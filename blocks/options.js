Blockly.Blocks['options'] = {
    init: function () {
        this.itemCount_ = 1;
        this.updateShape_();
        this.setOutput(true, 'options');
        this.setColour(120);
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
        // Modify this if you want a different text label for the block overall
        if (this.itemCount_ && this.getInput('EMPTY')) {
            this.removeInput('EMPTY');
        } else if (!this.itemCount_ && !this.getInput('EMPTY')) {
            this.appendDummyInput('EMPTY')
                .appendField('options');
        }

        for (var i = 0; i < this.itemCount_; i++) {
            if (!this.getInput('ADD' + i)) {
                var input = this.appendValueInput('ADD' + i)
                    .setAlign(Blockly.ALIGN_RIGHT);
                if (i == 0) {
                    input.appendField('options');
                }
            }
        }
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
            .appendField('options');
        this.appendStatementInput('STACK');
        this.setTooltip('Add, remove, or reorder options.');
        this.contextMenu = false;
    }
};

// Mutator Item Block
Blockly.Blocks['options_item'] = {
    init: function () {
        this.setColour(120);
        this.appendDummyInput()
            .appendField('option');
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('Add a new option.');
        this.contextMenu = false;
    }
};

Blockly.JavaScript['options'] = function (block) {
    var elements = new Array(block.itemCount_);
    for (var i = 0; i < block.itemCount_; i++) {
        elements[i] = Blockly.JavaScript.valueToCode(block, 'ADD' + i,
            Blockly.JavaScript.ORDER_NONE) || 'null';
    }
    var code = '{' + elements.join(', ') + '}';
    return [code, Blockly.JavaScript.ORDER_NONE];
};
