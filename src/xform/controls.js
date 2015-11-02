'use strict';

//dependencies
var _ = require('lodash');
var path = require('path');
var common = require(path.join(__dirname, '..', 'common'));
var widgets = require(path.join(__dirname, 'widgets'));


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
    var _groupControls = ['group', 'repeat'];

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

        //extend control with bindings
        var ref = node.ref || node.nodeset;
        node = _.merge(node, _.get(controls.bindings, ref));

        //set control type
        node.control = nodeType;

        //iterate through control keys
        _.forEach(node, function(childNode, childType) {
            //TODO check for repeat
            var isControl = controls.isGroupControl(childType);

            var isWidget = widgets.isWidget(childType);

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

            //parse widgets
            if (isWidget) {
                node[childType] = widgets.parse(childNode, childType);
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


controls.flattenControl = function(control) {
    //widgets accumulator
    var accumulatedWidgets = [];


    function flattenControlRecursive(_section, _control) {

        //pick widgets from a control
        var _widgets = _.values(_.pick(_control, widgets.widgets));

        //flatten widgets
        _widgets = _.flattenDeep(_widgets);

        //removed picked widgets
        _control = _.omit(_control, widgets.widgets);

        //check if remain control attributes has `group`
        var groups = _.values(_.pick(_control, ['group']));

        //prepare section
        var section = _.omit(_control, 'group');
        //nest section
        if (_section) {
            _section.section = section;
            section = _section;
        }

        //continue flatten if there are inner groups
        groups = _.flattenDeep(groups);
        if (groups && !_.isEmpty(groups)) {
            _.forEach(groups, function(group) {
                flattenControlRecursive(section, group);
            });
        }

        //collect widgets
        else {
            _.forEach(_widgets, function(_widget) {
                //assign section to widget
                _widget.section = section;
                accumulatedWidgets.push(_widget);
            });
        }

    }

    flattenControlRecursive(undefined, control);

    //compact widgets
    accumulatedWidgets = _.compact(accumulatedWidgets);

    return accumulatedWidgets;

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

    // return _controls;

    //parse and collect widgets from controls
    var _widgets = _.map(_controls, function(_control) {
        return controls.flattenControl(_control);
    });
    //flatten deep array of widgets
    _widgets = _.flattenDeep(_widgets);

    //compact widgets
    _widgets = _.compact(_widgets);

    return _widgets;

};


//export controls parser
module.exports = exports = controls;