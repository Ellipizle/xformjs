'use strict';

//dependencies
var _ = require('lodash');
var path = require('path');
var common = require(path.join(__dirname, '..', 'common'));
var translation = require(path.join(__dirname, 'translation'));

/**
 * @module widgets
 * @description parse input controls
 * @type {Object}
 * @public
 */
var widgets = {};

//collection of known widgets
widgets.widgets = ['input', 'select1', 'select', 'upload', 'trigger'];

//reference to form translations
widgets.translations;

//reference to form bindings
widgets.bindings;


/**
 * @description check if the given node type is input widget
 * @param  {String}  type node type
 * @return {Boolean} whether node is a widget or not
 * @public
 */
widgets.isWidget = function(type) {
    //check if input is widget
    var isWidget = _.contains(widgets.widgets, type);

    return isWidget;
};


/**
 * @description normalize widget label and use angular style databing to allow 
 *              label to reference instance values
 * @param  {Array<Object>} translations available language translations
 * @param  {Object|String} label widget label
 * @return {Object}        widget label
 * @private
 */
widgets.parseLabel = function(label) {

    //if label has reference to instance value
    if (_.isPlainObject(label)) {
        //normalize node
        label = common.normalizeNode(label);

        //obtain label text from object label definition
        if (label._) {
            label.defaultsTo = {
                value: {
                    long: label._
                }
            };
            label = _.omit(label, '_');
        }

        //obtain label text from translations
        if (label.ref && widgets.translations) {
            //convert label jrText to translation id
            label.id =
                common.jrTextToTranslationId(label.ref);

            //parse default language label definition
            label.defaultsTo =
                translation.parseNodeLanguage(widgets.translations, label.id);

            //parse all label languages
            label.languages =
                translation.parseNodeLanguages(widgets.translations, label.id);
        }

        //delete ref from label
        label = _.omit(label, 'ref');

        //obtain output reference instance path
        var ref =
            label.output && label.output.$ ? label.output.$.ref : undefined;

        if (ref) {
            var path = common.parseVariableName(ref);

            //bind instance path reference using angular style
            label.defaultsTo.value.long =
                label.defaultsTo.value.long.replace('\n', ' {{' + path + '}}');

            //remove unwanted tabs on the label
            label.defaultsTo.value.long =
                label.defaultsTo.value.long.replace(/\s+/g, ' ');

            //delete output from label
            label = _.omit(label, 'output');
        }
    }

    //label is just a string
    if (_.isString(label)) {
        var _label = {};
        _label.defaultsTo = {
            value: {
                long: label
            }
        };
        label = _label;
    }

    return label;
};


/**
 * @description parse widget hint, both from free hint and translated hint
 * @param  {Array<Object>} translations available language translations
 * @param  {Object} hint     hint to hintify
 * @return {Object}              parsed widget hint
 * @private
 */
widgets.parseHint = function(hint) {

    //if hint is plain object definition
    if (_.isPlainObject(hint)) {
        //normalize hint node
        hint = common.normalizeNode(hint);

        if (hint._) {
            hint.defaultsTo = {
                value: {
                    long: hint._
                }
            };
            hint = _.omit(hint, '_');
        }

        if (hint.ref && widgets.translations) {
            //convert hint jrText to translation id
            hint.id =
                common.jrTextToTranslationId(hint.ref);

            //parse default language hint definition
            hint.defaultsTo =
                translation.parseNodeLanguage(widgets.translations, hint.id);

            //parse all hint translation languages
            hint.languages =
                translation.parseNodeLanguages(widgets.translations, hint.id);
        }

        //delete ref from hint
        hint = _.omit(hint, 'ref');
    }

    //hint its just a string
    if (_.isString(hint)) {
        var _hint = {};
        _hint.defaultsTo = {
            value: {
                long: hint
            }
        };
        hint = _hint;
    }

    return hint;
};


/**
 * @description parse user input widget
 * @param  {Object} widget valid user input widget
 * @param  {String} widgetType   type of the widget
 * @return {Object}        widget
 * @private
 */
widgets.parseWidget = function(widget, widgetType) {
    //normalize widget node
    widget = common.normalizeNode(widget);

    //extend widget with bindings
    var ref = widget.ref || widget.nodeset;
    widget = _.merge(widget, _.get(widgets.bindings, ref));

    //set widget type
    widget.widget = widgetType;

    //normalize widget label
    widget.label = widgets.parseLabel(widget.label);

    //normalize hint
    if (widget.hint) {
        widget.hint = widgets.parseHint(widget.hint);
    }

    //compute instance answer json reference key
    var reference = common.parseReference(ref);

    widget.reference = reference;

    return widget;
};


widgets.parse = function(widget, widgetType) {
    var _widgets = [];

    if (!_.isArray(widget)) {
        widget = [widget];
    }

    //parse widget collection
    _.forEach(widget, function(_widget) {
        _widgets.push(widgets.parseWidget(_widget, widgetType));
    });

    //compact widgets
    _widgets = _.compact(_widgets);

    return _widgets;

};

//export widget parser
module.exports = exports = widgets;