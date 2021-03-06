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
 * @param  {Object} bind valid question binding
 * @return {Object}         binding with `defaultsTo` seted
 * @public
 */
binding.parseDefaultValue = function(xformJson, bind) {

    //compute question answer submission key
    var reference = _.filter(bind.nodeset.split('/'), function(item) {
        return !_.isEmpty(item);
    }).join('.');

    //try to obtain default value
    //for non readonly inputs i.e label, hint, output and note
    if (!bind.readonly && bind.type) {
        var defaultsTo = _.get(xformJson.html.head.model.instance, reference);

        //set question default value
        //TODO use option missing value/default value
        if (defaultsTo && !_.isEmpty(defaultsTo)) {
            bind.defaultValue = defaultsTo;
        }
    }

    //TODO cast default value to correct type
    var isNumber =
        (bind.type === 'integer' ||
            bind.type === 'decimal');

    if (isNumber && bind.defaultValue) {
        bind.defaultValue = Number(bind.defaultValue);
    }

    return bind;

};


/**
 * @description parse provided node as a binding
 * @param  {Object} node valid xForm node
 * @return {Object}      binding of the question
 */
binding.parseBinding = function(node) {
    //normalize binding node
    var bind = common.normalizeNode(node);

    //normalize binding attributes

    //normalize nodeset
    bind.nodeset = bind.nodeset || bind.ref;

    //TODO parse relevant

    //normalize type 
    bind.type = common.normalizeType(bind.type);


    if (bind.type) {
        //normalize readonly
        bind.readonly = bind.readonly || 'false()';

        //parse binding required to js types
        bind.required =
            bind.required ? bind.required : 'false()';


        //TODO parse constraints
        
        //convert regex pattern to js compactible regex
        bind.constraint =
            convertor.parseRegexConstraint(bind.constraint);

        if (bind.constraintMsg) {
            bind.constraintMessage = bind.constraintMsg;
            delete bind.constraintMsg;
        }

        //TODO parse calculate

        //normalize saveIncomplete
        bind.saveIncomplete = bind.saveIncomplete || 'false()';

        //convert boolean strings to actual js boolean
        bind = convertor.parseBooleans(bind);

        //compute question variable name from it bindings
        bind.variable = common.parseVariableName(bind.nodeset);

    }

    return bind;

};


/**
 * @description parser xform bindings
 * @param  {Object} xformJson xml2js json represention of xForm xml
 * @return {Object}           normalized bindings of xForm
 */
binding.parseBindings = function(xformJson) {
    var binds = {};

    var xformJsonBindings =
        _.get(xformJson, 'html.head.model.bind');

    //TODO parallelize
    _.forEach(xformJsonBindings, function(bind) {

        //parse and normalize binding
        bind = binding.parseBinding(bind);

        //parse default value
        binding.parseDefaultValue(xformJson, bind);

        //collect bindings
        binds[bind.nodeset] = bind;

    });

    return binds;
};


//export translation module
module.exports = exports = binding;