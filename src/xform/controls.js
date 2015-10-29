'use strict';

//dependencies
var _ = require('lodash');
var path = require('path');
var common = require(path.join(__dirname, '..', 'common'));
// var widgets = require(path.join(__dirname, 'widgets'));


/**
 * @module controls
 * @description parse xForm user controls and normalize them to json
 * @type {Object}
 * @public
 */
var controls = {};

/**
 * @description check if the given node type is form control
 * @param  {String}  type node type
 * @return {Boolean} whether node is a control or not
 * @public
 */
controls.isControl = function(type) {
    //allowed control
    var _controls = ['group', 'repeat', 'label', 'hint', 'output', 'item', 'itemset', 'value'];

    //check if node is a control
    var isControl = _.contains(_controls, type);

    return isControl;
};


/**
 * @description check if the given node type is form group control
 * @param  {String}  type node type
 * @return {Boolean} whether node is a group control or not
 * @public
 */
controls.isGroupControl = function(type) {
    //allowed group control
    var _groupControls = ['group'];

    //check if node is a group control
    var isGroupControl = _.contains(_groupControls, type);

    return isGroupControl;
};


controls.normalizeControl = function(control, controlType) {
    //controls cache
    var _controls = [];

    function normalizeControlRecursive(accumulator, node, nodeType) {
        //normalize control
        node = common.normalizeNode(node);

        //set control type
        node.control = nodeType;

        //iterate through control keys
        _.forEach(node, function(childNode, childType) {
            var isControl = controls.isGroupControl(childType);

            if (isControl) {

                //parse collection of controls
                if (_.isArray(childNode)) {
                    _.forEach(childNode, function(kid /*, kidType*/ ) {
                        //reset accumulator
                        node[childType] = [];

                        normalizeControlRecursive(node[childType], kid, childType);
                    });
                }

                //parse single control
                //TODO test this use case
                else {
                    //reset accumulator
                    node[childType] = [];

                    normalizeControlRecursive(node[childType], childNode, childType);
                }
            }

        });

        //collect control
        accumulator.push(node);
    }

    normalizeControlRecursive(_controls, control, controlType);

    //compact controls
    _controls = _.compact(_controls);

    return _controls;

};

controls.parseControl = function(control, controlType) {
    var _controls = [];

    //normalize control
    control = common.normalizeNode(control);

    //set control type
    control.control = controlType;

    //collect _controls
    _controls.push(control);

    return _controls;
};


controls.parse = function(control, controlType) {
    var _controls = [];

    if (!_.isArray(control)) {
        control = [control];
    }

    //parse control collection
    _.forEach(control, function(_control) {
        _controls =
            _.union(_controls, controls.normalizeControl(_control, controlType));
    });

    //compact controls
    _controls = _.compact(_controls);

    return _controls;

};


//export controls parser
module.exports = exports = controls;