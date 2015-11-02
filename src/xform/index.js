'use strict';

//dependencies
var path = require('path');
var _ = require('lodash');
var translation = require(path.join(__dirname, 'translation'));
var binding = require(path.join(__dirname, 'binding'));
var widgets = require(path.join(__dirname, 'widgets'));
var controls = require(path.join(__dirname, 'controls'));
var meta = require(path.join(__dirname, 'meta'));


/**
 * @module xform
 * @description convert xform xml definition to json definition
 * @type {Object}
 * @version 0.1.0
 * @public
 */
var xform = {};

//extend xform with translations
xform = _.extend(xform, translation);


/**
 * @description parse form title from xForm xml
 * @param  {Object} xformJson xml2js json represention of xForm xml 
 * @return {String}           xForm title
 * @public
 */
xform.parseTitle = function(xformJson) {
    return _.get(xformJson, 'html.head.title');
};


/**
 * @description obtain name of the primary instance
 * @param  {[type]} xformJson xml2js json represention of xForm xml
 * @return {String}           primary instance name
 * @public
 */
xform.parseInstanceName = function(xformJson) {
    var instanceNodesName = _.keys(xformJson.html.head.model.instance);
    return _.first(instanceNodesName);
};


/**
 * @description obtain primary instance definition from xform json
 * @param  {Object} xformJson xml2js json represention of xForm xml 
 * @return {Object}           xform primary instance definition
 * @private
 */
xform.getPrimaryInstance = function(xformJson) {
    var key =
        'html.head.model.instance.' + xform.parseInstanceName(xformJson);
    var instance = _.get(xformJson, key);
    return instance;
};


/**
 * @description parse form id from xForm xml
 * @param  {Object} xformJson xml2js json represention of xForm xml 
 * @return {String}           xForm id
 * @public
 */
xform.parseId = function(xformJson) {
    var instance = xform.getPrimaryInstance(xformJson);
    var id =
        (instance && instance.$ && instance.$.id) ? instance.$.id : undefined;
    return id;
};


/**
 * @description parse form version from xForm xml
 * @param  {Object} xformJson xml2js json represention of xForm xml 
 * @return {String}           xForm version
 * @public
 */
xform.parseVersion = function(xformJson) {
    var instance = xform.getPrimaryInstance(xformJson);
    var version =
        (instance && instance.$ && instance.$.version) ? instance.$.version : '1.0.0';
    return version;
};


/**
 * @description parse form instance structure from xForm
 * @param  {Object} xformJson xml2js json represention of xForm xml instance 
 * @return {Object}           xForm instance node
 * @public
 */
xform.parseInstance = function(xformJson) {
    var instance = xform.getPrimaryInstance(xformJson);

    if (instance) {
        //remove unwanted attribute
        instance = _.omit(instance, '$');
    }

    return instance;
};



/**
 * @description parse xform bindings and body to obtain question definition
 * @param  {Object} xformJson xml2js json represention of xForm xml
 * @return {Array<Object>}           xform questions in json representation
 */
xform.parseQuestions = function(xformJson) {
    var questions = [];

    //parse questions bindings
    widgets.bindings =
        controls.bindings =
        meta.bindings =
        binding.parseBindings(xformJson);

    //parse translations
    widgets.translations =
        controls.translations =
        translation.parseTranslations(xformJson);

    //obtain xform body definition
    var body = xformJson.html.body;

    //process body nodes to obtain question
    //TODO parse complex form structure
    _.forEach(body, function(_questions, key) {

        //parse widget
        if (widgets.isWidget(key)) {
            var _widgets = widgets.parse(_questions, key);
            questions = _.union(questions, _widgets);
        }

        //parse as control
        if (controls.isControl(key)) {
            var _controls = controls.parse(_questions, key);
            questions = _.union(questions, _controls);
        }

        //TODO find other use cases

    });

    return questions;

};

xform.parseMeta = function() {
    return meta.parse();
};


//export parser
module.exports = exports = xform;