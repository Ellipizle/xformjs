'use strict';

//dependencies
var path = require('path');
var _ = require('lodash');
var convertor = require(path.join(__dirname, 'convertor'));
var common = require(path.join(__dirname, 'common'));
var translation = require(path.join(__dirname, 'xform', 'translation'));

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
 * @description parse default value of the question from primary instance nodes
 *              and set it to the binding
 * @param  {Object} binding valid question binding
 * @return {Object}         binding with `defaultsTo` seted
 * @public
 */
parser.parseDefaultValue = function(xformJson, binding) {

    //compute question answer submission key
    var reference = _.filter(binding.nodeset.split('/'), function(item) {
        return !_.isEmpty(item);
    }).join('.');

    //try to obtain default value
    //for non readonly inputs i.e label, hint, output and note
    if (!binding.readonly) {
        var defaultsTo = _.get(xformJson.html.head.model.instance, reference);

        //set question default value
        //TODO use option missing value/default value
        if (defaultsTo && !_.isEmpty(defaultsTo)) {
            binding.defaultsTo = defaultsTo;
        }
    }

    //TODO cast default value to correct type
    var isNumber =
        (binding.type === 'integer' ||
            binding.type === 'decimal');

    if (isNumber && binding.defaultsTo) {
        binding.defaultsTo = Number(binding.defaultsTo);
    }

};


/**
 * @description process nodeset or ref to obtain its instance variable name
 * @param  {String} nodeset valid nodeset or ref
 * @public
 */
parser.parseVariableName = function(nodeset) {

    //compute variable name of the given nodeset
    return _.tail(_.filter(nodeset.split('/'), function(item) {
        return !_.isEmpty(item);
    })).join('.');

};


/**
 * @description parse provided node as a binding
 * @param  {Object} node valid xForm node
 * @return {Object}      binding of the question
 */
parser.parseBinding = function(node) {
    //normalize binding node
    var binding = common.normalizeNode(node);

    //normalize binding attributes

    //normalize nodeset
    binding.nodeset = binding.nodeset || binding.ref;

    //normalize type
    binding.type = binding.type || 'string';
    binding.type = common.normalizeType(binding.type);

    //normalize readonly
    binding.readonly = binding.readonly || 'false()';

    //normalize saveIncomplete
    binding.saveIncomplete = binding.saveIncomplete || 'false()';

    //parse binding required to js types
    binding.required =
        binding.required ? binding.required : 'false()';

    //convert boolean strings to actual js boolean
    binding = convertor.parseBooleans(binding);

    //compute question variable name from it bindings
    binding.name = parser.parseVariableName(binding.nodeset);


    return binding;

};


/**
 * @description parser form bindings from xForm
 * @param  {Object} xformJson xml2js json represention of xForm xml
 * @return {Object}           normalized bindings of xForm
 */
parser.parseBindings = function(xformJson) {
    var bindings = {};

    var xformJsonBindings =
        _.get(xformJson, 'html.head.model.bind');

    //TODO parallelize
    _.forEach(xformJsonBindings, function(binding) {

        //parse and normalize binding
        binding = parser.parseBinding(binding);

        //parse default value
        parser.parseDefaultValue(xformJson, binding);

        //collect bindings
        bindings[binding.nodeset] = binding;

    });

    return bindings;
};





/**
 * @description normalize question label and use angular style databing to allow 
 *              label to reference instance values
 * @param  {Object|String} label question label
 * @return {String}          [description]
 */
parser.parseLabel = function(label) {
    //if label has reference to instance value
    if (_.isPlainObject(label)) {
        //obtain label text from object label definition
        var text = label._;

        //obtain reference instance path
        var ref =
            label.output && label.output.$ ? label.output.$.ref : undefined;

        if (ref) {
            var path = parser.parseVariableName(ref);

            //bind instance path reference using angular style
            text = text.replace('\n', ' {{' + path + '}}');

            //remove unwanted tabs on the label
            text = text.replace(/\s+/g, ' ');
        }

        label = text;
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
            hint.default = hint._;
            hint = _.omit(hint, '_');
        }

        if (hint.ref && translations) {
            //convert hint jrText to translation id
            hint.id =
                common.jrTextToTranslationId(hint.ref);

            //parse default language hint definition
            hint.default =
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
        _hint.default = hint;
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
    var bindings = parser.parseBindings(xformJson);

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
        question.label = parser.parseLabel(question.label);

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