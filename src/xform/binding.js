'use strict';

//dependendies
var _ = require('lodash');
var path = require('path');
var common = require(path.join(__dirname, '..', 'common'));
var convertor = require(path.join(__dirname, '..', 'convertor'));


/**
 * @module binding
 * @description parse and normalize xform bindings
 * @type {Object}
 * @version 0.1.0
 * @public
 */
var binding = {};


/**
 * @description parse default value of the question from primary instance nodes
 *              and set it to the binding
 * @param  {Object} binding valid question binding
 * @return {Object}         binding with `defaultsTo` seted
 * @public
 */
binding.parseDefaultValue = function(xformJson, _binding) {

    //compute question answer submission key
    var reference = _.filter(_binding.nodeset.split('/'), function(item) {
        return !_.isEmpty(item);
    }).join('.');

    //try to obtain default value
    //for non readonly inputs i.e label, hint, output and note
    if (!_binding.readonly) {
        var defaultsTo = _.get(xformJson.html.head.model.instance, reference);

        //set question default value
        //TODO use option missing value/default value
        if (defaultsTo && !_.isEmpty(defaultsTo)) {
            _binding.defaultsTo = defaultsTo;
        }
    }

    //TODO cast default value to correct type
    var isNumber =
        (_binding.type === 'integer' ||
            _binding.type === 'decimal');

    if (isNumber && _binding.defaultsTo) {
        _binding.defaultsTo = Number(_binding.defaultsTo);
    }

};


/**
 * @description parse provided node as a binding
 * @param  {Object} node valid xForm node
 * @return {Object}      binding of the question
 */
binding.parseBinding = function(node) {
    //normalize binding node
    var _binding = common.normalizeNode(node);

    //normalize binding attributes

    //normalize nodeset
    _binding.nodeset = _binding.nodeset || _binding.ref;

    //normalize type
    _binding.type = _binding.type || 'string';
    _binding.type = common.normalizeType(_binding.type);

    //normalize readonly
    _binding.readonly = _binding.readonly || 'false()';

    //normalize saveIncomplete
    _binding.saveIncomplete = _binding.saveIncomplete || 'false()';

    //parse binding required to js types
    _binding.required =
        _binding.required ? _binding.required : 'false()';

    //convert boolean strings to actual js boolean
    _binding = convertor.parseBooleans(_binding);

    //compute question variable name from it bindings
    _binding.name = common.parseVariableName(_binding.nodeset);


    return _binding;

};


/**
 * @description parser form bindings from xForm
 * @param  {Object} xformJson xml2js json represention of xForm xml
 * @return {Object}           normalized bindings of xForm
 */
binding.parseBindings = function(xformJson) {
    var _bindings = {};

    var xformJsonBindings =
        _.get(xformJson, 'html.head.model.bind');

    //TODO parallelize
    _.forEach(xformJsonBindings, function(_binding) {

        //parse and normalize binding
        _binding = binding.parseBinding(_binding);

        //parse default value
        binding.parseDefaultValue(xformJson, _binding);

        //collect bindings
        _bindings[_binding.nodeset] = _binding;

    });

    return _bindings;
};


//export translation module
module.exports = exports = binding;