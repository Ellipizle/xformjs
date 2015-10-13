'use strict';

//dependencies
// var fs = require('fs');
var xml2js = require('xml2js');
var path = require('path');
var async = require('async');
var parser = require(path.join(__dirname, 'src', 'parser'));

/**
 * @module xformjs
 * @type {Object}
 * @version 0.1.0
 * @public
 */
var xformjs = {};


/**
 * @description convert xForm xml definition to JSON definition
 * @param  {String}   xform valid xForm definition
 * @param  {Function} done  function to invoke on success or failure
 * @return {Object}         error object with errors found during conversion or 
 *                          JSON representaion of xForm
 *                                
 */
xformjs.xform2json = function(xform, done) {
    //prepare xml2js convertor
    var xmljs = new xml2js.Parser({
        tagNameProcessors: [
            xml2js.processors.stripPrefix //strip prefixes from tag names
        ],

        attrNameProcessors: [
            xml2js.processors.stripPrefix //strip prefixes from attribute names
        ],

        valueProcessors: [
            xml2js.processors.stripPrefix, //strip prefixes from value
            xml2js.processors.parseBooleans // parse boolean value
        ],

        explicitArray: false
    });


    //parse form
    xmljs.parseString(xform, function(error, xformJson) {
        //backoff
        if (error) {
            done(error);
        }

        //dump xformjson
        // fs.writeFileSync('form.json', JSON.stringify(xformJson), 'utf-8');

        //continue parsing form
        async.parallel({
            title: function(next) {
                next(null, parser.parseTitle(xformJson));
            },
            instanceName: function(next) {
                next(null, parser.parsePrimaryInstanceName(xformJson));
            },
            instance: function(next) {
                next(null, parser.parseInstance(xformJson));
            },
            translations: function(next) {
                next(null, parser.parseTranslations(xformJson));
            },
            questions: function(next) {
                next(null, parser.parseQuestions(xformJson));
            }
        }, done);

    });
};


//export xformjs
module.exports = exports = xformjs;