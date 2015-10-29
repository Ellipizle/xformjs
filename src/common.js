'use strict';

//dependencies
var _ = require('lodash');

/**
 * @module common
 * @description common xform node operations and transformer
 * @version 0.1.0
 * @type {Object}
 */
var common = {};


/**
 * @description normalize a given xForm node into a flat object and remove 
 *              unwanted attributes
 * @param  {Object} node valid xForm node
 * @return {Object}      
 */
common.normalizeNode = function(node) {

    node = _.merge(node, node.$);
    node = _.omit(node, '$');

    return node;
};



/**
 * @description normalize input type name
 * @param  {String} type input type name
 * @return {String}
 */
common.normalizeType = function(type) {
    //normalize integer input type
    if (_.startsWith(type, 'int')) {
        type = 'integer';
    }

    //normalize string/text inputs type
    if (_.startsWith(type, 'string') || _.startsWith(type, 'text')) {
        type = 'string';
    }

    //normalize datetime/dateTime inputs type
    if (_.startsWith(type, 'dateTime') || _.startsWith(type, 'datetime')) {
        type = 'datetime';
    }

    return type;
};


/**
 * @description convert given xform jr text to translation text id
 * @param  {String} jrText valid xform jr text
 * @return {String}        text id for jr text
 */
common.jrTextToTranslationId = function(jrText) {
    //remove `jr:itext(` at the begin
    var splits = jrText.split('(\'');
    splits = _.last(splits);

    //remove `)` at the end
    splits = splits.split('\')');

    //obtain id
    return _.first(splits);
};


/**
 * @description process nodeset or ref to obtain its instance variable name
 * @param  {String} nodeset valid nodeset or ref
 * @public
 */
common.parseVariableName = function(nodeset) {

    //compute variable name of the given nodeset
    // return _.tail(_.filter(nodeset.split('/'), function(item) {
    //     return !_.isEmpty(item);
    // })).join('.');
    var name = _.last(nodeset.split('/'));
    return name;
};


//export common module
module.exports = exports = common;