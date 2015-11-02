'use strict';

//dependencies
// var fs = require('fs');
var xml2js = require('xml2js');
var path = require('path');
var async = require('async');
var xform = require(path.join(__dirname, 'src', 'xform'));

/**
 * @module xformjs
 * @type {Object}
 * @version 0.1.0
 * @public
 */
var xformjs = {};


/**
 * @description convert xForm xml definition to JSON definition
 * @param  {String}   xForm valid xForm definition
 * @param  {Function} done  function to invoke on success or failure
 * @return {Object}         error object with errors found during conversion or 
 *                          JSON representaion of xForm
 *                                
 */
xformjs.xform2json = function(xForm, done) {
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
    xmljs.parseString(xForm, function(error, xformJson) {
        //backoff
        if (error) {
            done(error);
        }

        //continue parsing form
        async.parallel({
            title: function(next) {
                next(null, xform.parseTitle(xformJson));
            },
            id: function(next) {
                next(null, xform.parseId(xformJson));
            },
            version: function(next) {
                next(null, xform.parseVersion(xformJson));
            },
            instanceName: function(next) {
                next(null, xform.parseInstanceName(xformJson));
            },
            instance: function(next) {
                next(null, xform.parseInstance(xformJson));
            },
            translations: function(next) {
                next(null, xform.parseTranslations(xformJson));
            },
            questions: function(next) {
                next(null, xform.parseQuestions(xformJson));
            },
            meta: function(next) {
                next(null, xform.parseMeta());
            }
        }, done);

    });
};


//export xformjs
module.exports = exports = xformjs;