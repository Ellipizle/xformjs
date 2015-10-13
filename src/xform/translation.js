'use strict';

//dependendies
var _ = require('lodash');
var path = require('path');
var common = require(path.join(__dirname, '..', 'common'));
var convertor = require(path.join(__dirname, '..', 'convertor'));


/**
 * @module parser
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
 */
translation.parseTranslations = function(xformJson) {
    var translations = _.get(xformJson, 'html.head.model.itext');
    if (translations) {
        translations = translations.translation;
    }
    if (translations && !_.isArray(translations)) {
        translations = [translations];
    }

    //normalize node
    translations = _.map(translations, function(translation) {
        //normalize translation node
        translation = common.normalizeNode(translation);

        //detect boolean like values
        translation = convertor.parseBooleans(translation);

        //normalize translation text
        translation.text = _.map(translation.text, function(text) {
            //normalize translation text node
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
            }

            return text;
        });

        return translation;
    });

    //normalize default language
    var defaultLanguage = _.find(translations, {
        default: true
    });
    if (!defaultLanguage) {
        translations[0] = _.merge(translations[0], {
            default: true
        });
    }

    return translations;
};


/**
 * @description parse default language details from translations
 * @param  {Array<Object>} translations collection of form translations
 * @param  {String} lang language to lookup from translations
 * @return {Object}              language details if found else default language
 *                                        details
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

//parser 
translation.parseNodeLanguage = function(translations, id) {
    //find default language
    var language = translation.parseLanguage(translations);

    //obtain jrText default language
    language = _.find(language.text, {
        id: id
    });

    //extend language definition
    language = _.merge(language, _.pick(translation, 'lang'));

    return language;
};


translation.parseNodeLanguages = function(translations, id) {
    //languages accumulator
    var languages = [];

    //find node language
    _.forEach(translations, function(translation) {
        //obtain language using node id
        var language = _.find(translation.text, {
            id: id
        });

        //extend language definition
        language = _.merge(language, _.pick(translation, 'lang'));

        //collect language
        languages.push(language);
    });

    //compact languages
    languages = _.compact(languages);

    return languages;
};

//export translation module
module.exports = exports = translation;