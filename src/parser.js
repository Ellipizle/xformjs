'use strict';

//dependencies
var path = require('path');
var _ = require('lodash');
var common = require(path.join(__dirname, 'common'));
var translation = require(path.join(__dirname, 'xform', 'translation'));
var binding = require(path.join(__dirname, 'xform', 'binding'));

/**
 * @module parser
 * @type {Object}
 * @version 0.1.0
 * @public
 */
var parser = {};

//extend parser
parser = _.extend(parser, translation);


/**
 * @description parse form title from xForm
 * @param  {Object} xformJson xml2js json represention of xForm xml 
 * @return {String}           xForm title
 * @public
 */
parser.parseTitle = function(xformJson) {
    return _.get(xformJson, 'html.head.title');
};


/**
 * @description obtain name of the primary instance
 * @param  {[type]} xformJson xml2js json represention of xForm xml
 * @return {String}           primary instance name
 * @public
 */
parser.parsePrimaryInstanceName = function(xformJson) {
    var instanceNodesName = _.keys(xformJson.html.head.model.instance);
    return _.first(instanceNodesName);
};


/**
 * @description parse form instance structure from xForm
 * @param  {Object} xformJson xml2js json represention of xForm xml instance 
 * @return {Object}           xForm instance node
 * @public
 */
parser.parseInstance = function(xformJson) {
    var key =
        'html.head.model.instance.' + parser.parsePrimaryInstanceName(xformJson);
    var instance = _.get(xformJson, key);
    if (instance) {
        //remove unwanted attribute
        instance = _.omit(instance, '$');
    }
    return instance;
};


/**
 * @description normalize question label and use angular style databing to allow 
 *              label to reference instance values
 * @param  {Array<Object>} translations available language translations
 * @param  {Object|String} label question label
 * @return {String}          [description]
 */
parser.parseLabel = function(translations, label) {
    //if label has reference to instance value
    if (_.isPlainObject(label)) {
        //normalize node
        label = common.normalizeNode(label);

        //obtain label text from object label definition
        if (label._) {
            label.defaultsTo = {
                value: label._
            };
            label = _.omit(label, '_');
        }

        if (label.ref && translations) {
            //convert label jrText to translation id
            label.id =
                common.jrTextToTranslationId(label.ref);

            //parse default language label definition
            label.defaultsTo =
                translation.parseNodeLanguage(translations, label.id);

            //parse all label languages
            label.languages =
                translation.parseNodeLanguages(translations, label.id);
        }

        //delete ref from label
        label = _.omit(label, 'ref');

        //obtain reference instance path
        var ref =
            label.output && label.output.$ ? label.output.$.ref : undefined;

        if (ref) {
            var path = common.parseVariableName(ref);

            //bind instance path reference using angular style
            label.defaultsTo.value =
                label.defaultsTo.value.replace('\n', ' {{' + path + '}}');

            //remove unwanted tabs on the label
            label.defaultsTo.value =
                label.defaultsTo.value.replace(/\s+/g, ' ');

            //delete output from label
            label = _.omit(label, 'output');
        }
    }

    //hint its just a string
    if (_.isString(label)) {
        var _label = {};
        _label.defaultsTo = {
            value: label
        };
        label = _label;
    }

    return label;
};


/**
 * @description parse question hint, both from free hint and translated hint
 * @param  {Array<Object>} translations available language translations
 * @param  {Object} question     question to hintify
 * @return {Object}              parsed question hint
 */
parser.parserQuestionHint = function(translations, question) {
    var hint = question.hint;

    //if hint is plain object definition
    if (_.isPlainObject(hint)) {
        //normalize hint node
        hint = common.normalizeNode(hint);

        if (hint._) {
            hint.defaultsTo = {
                value: hint._
            };
            hint = _.omit(hint, '_');
        }

        if (hint.ref && translations) {
            //convert hint jrText to translation id
            hint.id =
                common.jrTextToTranslationId(hint.ref);

            //parse default language hint definition
            hint.defaultsTo =
                translation.parseNodeLanguage(translations, hint.id);

            //parse all hint languages
            hint.languages =
                translation.parseNodeLanguages(translations, hint.id);
        }

        //delete ref from hint
        hint = _.omit(hint, 'ref');
    }

    //hint its just a string
    if (_.isString(hint)) {
        var _hint = {};
        _hint.defaultsTo = {
            value: hint
        };
        hint = _hint;
    }

    return hint;
};



/**
 * @description parse xform bindings and body to obtain question definition
 * @param  {Object} xformJson xml2js json represention of xForm xml
 * @return {Array<Object>}           xform questions in json representation
 */
parser.parseQuestions = function(xformJson) {
    var questions = [];

    //parse questions bindings
    var bindings = binding.parseBindings(xformJson);

    //parse translations
    var translations = translation.parseTranslations(xformJson);

    //obtain xform body definition
    var body = xformJson.html.body;

    function parseQuestion(question, widget) {
        question = common.normalizeNode(question);

        //extend question with bindings
        var ref = question.ref || question.nodeset;
        question = _.merge(question, _.get(bindings, ref));

        //set question input widget
        question.widget = widget;

        //normalize question label
        question.label = parser.parseLabel(translations, question.label);

        //normalize hint
        if (question.hint) {
            question.hint = parser.parserQuestionHint(translations, question);
        }

        //collect question
        questions.push(question);
    }

    //process body nodes to obtain question
    //TODO parse complex form structure
    _.forEach(body, function(_questions, key) {
        if (_.isArray(_questions)) {
            _.forEach(_questions, function(_question) {
                parseQuestion(_question, key);
            });
        } else {
            parseQuestion(_questions, key);
        }
    });

    return questions;

};


//export parser
module.exports = exports = parser;