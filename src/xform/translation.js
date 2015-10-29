'use strict';

//dependendies
var _ = require('lodash');
var path = require('path');
var common = require(path.join(__dirname, '..', 'common'));
var convertor = require(path.join(__dirname, '..', 'convertor'));


/**
 * @module translation
 * @description parse and normalize xform translation text
 * @type {Object}
 * @version 0.1.0
 * @public
 */
var translation = {};


/**
 * @description parse translation text form xformJson instance
 * @param  {Object} xformJson json represenation of xform xml
 * @return {Object}           translation object
 * @public
 */
translation.parseTranslations = function(xformJson) {
    var translations =
        _.get(xformJson, 'html.head.model.itext') || undefined;

    //obtain translations
    if (translations) {
        translations = translations.translation;
    }

    //normalize translations to array
    if (translations && !_.isArray(translations)) {
        translations = [translations];
    }

    //normalize each translation nodes
    //
    translations = _.map(translations, function(translation) {
        //normalize translation node and its attributes
        translation = common.normalizeNode(translation);

        //detect boolean like values
        translation = convertor.parseBooleans(translation);

        //normalize translation text
        translation.text = _.map(translation.text, function(text) {
            //normalize translation text node and its attributes
            text = common.normalizeNode(text);

            //normalize text value
            if (text.value && _.isArray(text.value)) {
                var values = {};

                _.forEach(text.value, function(value) {
                    var label = _.get(value, '$.form') || 'long';

                    if (_.isString(value)) {
                        values[label] = value;
                    } else {
                        values[label] = _.get(value, '_');
                    }
                });

                text.value = values;
            } else {
                text.value = {
                    long: text.value
                };
            }

            return text;
        });

        return translation;
    });

    //normalize and detect default language
    var defaultLanguage = _.find(translations, {
        default: true
    });
    if (!defaultLanguage) {
        translations[0] = _.merge(translations[0], {
            default: true
        });
    }

    //compact translations
    translations = _.compact(translations);

    return translations;
};


/**
 * @description parse require language details from translations
 * @param  {Array<Object>} form translations collection
 * @param  {String} lang language to lookup from translations
 * @return {Object}              language details if found else default language
 *                                        details
 *
 * @public
 */
translation.parseLanguage = function(translations, lang) {
    //prepare language selection criteria
    var criteria;
    if (lang && _.isString(lang)) {
        criteria.lang = lang;
    } else {
        criteria = {
            default: true
        };
    }

    //find language details using criteria
    var language = _.find(translations, criteria);

    return language;
};


/**
 * @description parse default language of the specific node
 * @param  {Array<Object>} form translations collection
 * @param  {String} id           node identifier
 * @return {Object}              default node language
 * @public
 */
translation.parseNodeLanguage = function(translations, id) {
    //find default language
    var _translation = translation.parseLanguage(translations);


    //obtain jrText default language
    var language = _.find(_translation.text, {
        id: id
    });

    //extend language definition
    language = _.merge(language, _.pick(_translation, 'lang'));

    return language;
};


/**
 * @description parse node languages
 * @param  {Array<Object>} form translations collection
 * @param  {String} id           node identifier
 * @return {Array<Object>}       node languages
 * @public
 */
translation.parseNodeLanguages = function(translations, id) {
    //languages accumulator
    var languages = [];

    //find node languages
    //
    _.forEach(translations, function(_translation) {

        //obtain language using node id
        var language = _.find(_translation.text, {
            id: id
        });

        //extend language definition
        language = _.merge(language, _.pick(_translation, 'lang'));

        //collect language
        languages.push(language);

    });

    //compact languages
    languages = _.compact(languages);

    return languages;
};

//export translation module
module.exports = exports = translation;