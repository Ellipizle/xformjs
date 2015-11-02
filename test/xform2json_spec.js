'use strict';

//dependencies
var fs = require('fs');
var _ = require('lodash');
var path = require('path');
var expect = require('chai').expect;
var xform2json = require(path.join(__dirname, '..')).xform2json;

//forms
var phoneForm =
    fs.readFileSync(path.join(__dirname, 'forms', 'phone', 'forms', 'Phone.xml'), 'utf-8');

var waterForm =
    fs.readFileSync(path.join(__dirname, 'forms', 'water', 'forms', 'WaterSimple.xml'), 'utf-8');

var registrationForm =
    fs.readFileSync(path.join(__dirname, 'forms', 'registration', 'forms', 'registration.xml'), 'utf-8');

var farmerForm =
    fs.readFileSync(path.join(__dirname, 'forms', 'farmer', 'forms', 'Farmer.xml'), 'utf-8');

var waterComplexForm =
    fs.readFileSync(path.join(__dirname, 'forms', 'water', 'forms', 'Water_2011_03_17.xml'), 'utf-8');

describe('xform2json', function() {

    it('should be a function', function(done) {
        expect(xform2json).to.be.a('function');
        done();
    });

    describe('parse head', function() {
        it('should be able to parse form title', function(done) {
            xform2json(phoneForm, function(error, xformJson) {

                fs.writeFileSync('phone.json', JSON.stringify(xformJson), 'utf-8');

                expect(xformJson).to.exist;
                expect(xformJson.title).to.exist;
                expect(xformJson.title).to.be.equal('Phone');

                done(error, xformJson);
            });
        });

        it('should be able to parse form id', function(done) {
            xform2json(phoneForm, function(error, xformJson) {

                expect(xformJson).to.exist;
                expect(xformJson.id).to.exist;
                expect(xformJson.id).to.be.equal('Phone_2011-02-04_00-09-18');

                done(error, xformJson);
            });
        });

        it('should be able to parse form version', function(done) {
            xform2json(phoneForm, function(error, xformJson) {

                expect(xformJson).to.exist;
                expect(xformJson.version).to.exist;
                expect(xformJson.version).to.be.equal('1.0.0');

                done(error, xformJson);
            });
        });

        it('should be able to parse primary instance name', function(done) {
            xform2json(phoneForm, function(error, xformJson) {

                expect(xformJson).to.exist;
                expect(xformJson.instanceName).to.exist;
                expect(xformJson.instanceName).to.be.equal('phone');

                done(error, xformJson);
            });
        });

    });


    describe('parse instance', function() {

        it('should be able to parse instance node form simple form', function(done) {
            xform2json(phoneForm, function(error, xformJson) {

                expect(xformJson.instance).to.exist;
                expect(_.keys(xformJson.instance))
                    .to.contain(
                        'visible_id',
                        'phone_number',
                        'status',
                        'age',
                        'note'
                    );

                done(error, xformJson);
            });
        });

        it('should be able to parse instance node form complex form', function(done) {
            xform2json(registrationForm, function(error, xformJson) {

                fs.writeFileSync('registration.json', JSON.stringify(xformJson), 'utf-8');

                expect(xformJson.instance).to.exist;
                expect(_.keys(xformJson.instance))
                    .to.contain(
                        'start',
                        'end',
                        'today',
                        'farmer_information',
                        'farm_business_operations'
                    );

                done(error, xformJson);
            });
        });

    });


    describe('parse translations', function() {

        it('should be able to parse translations', function(done) {
            xform2json(waterForm, function(error, xformJson) {

                fs.writeFileSync('water.json', JSON.stringify(xformJson), 'utf-8');

                expect(xformJson.translations).to.exist;

                done(error, xformJson);
            });
        });


        it('should be able to parse and normalize default language from translations', function(done) {
            xform2json(waterForm, function(error, xformJson) {

                expect(xformJson.translations).to.exist;
                expect(_.find(xformJson.translations, {
                    default: true
                }).lang).to.equal('eng');

                done(error, xformJson);
            });
        });


        it('should be able to parse question label from translations', function(done) {
            xform2json(waterForm, function(error, xformJson) {

                var label = _.find(xformJson.questions, {
                    name: 'name'
                }).label;

                expect(label.id).to.be.equal('/data/name:label');

                expect(label.long).to.exists;
                expect(label.long)
                    .to.be.equal('Water Point Name');

                expect(label.languages).to.exist;
                expect(_.map(label.languages, 'lang'))
                    .to.contain('eng', 'sw');

                done(error, xformJson);
            });
        });

        it('should be able to parse question hint from translations', function(done) {
            xform2json(waterForm, function(error, xformJson) {

                var hint = _.find(xformJson.questions, {
                    name: 'name'
                }).hint;

                expect(hint.id).to.be.equal('/data/name:hint');

                expect(hint.long).to.exists;
                expect(hint.long)
                    .to.be.equal('What is this point named?');

                expect(hint.languages).to.exist;
                expect(_.map(hint.languages, 'lang'))
                    .to.contain('eng', 'sw');

                done(error, xformJson);
            });
        });

    });

    describe('parse bindings', function() {

        it('should be able to parse bindings', function(done) {
            xform2json(phoneForm, function(error, xformJson) {

                expect(xformJson.questions).to.exist;
                expect(_.map(xformJson.questions, 'nodeset'))
                    .to.contain(
                        '/phone/visible_id',
                        '/phone/phone_number',
                        '/phone/status',
                        '/phone/age',
                        '/phone/note'
                    );

                done(error, xformJson);
            });
        });


        it('should be able to parse question variable name', function(done) {
            xform2json(phoneForm, function(error, xformJson) {

                expect(xformJson.questions).to.exist;
                expect(_.map(xformJson.questions, 'name'))
                    .to.contain(
                        'visible_id',
                        'phone_number',
                        'status',
                        'age',
                        'note'
                    );

                done(error, xformJson);
            });
        });

        it('should be able to parse question default value', function(done) {
            xform2json(phoneForm, function(error, xformJson) {

                expect(xformJson.questions).to.exist;
                expect(_.find(xformJson.questions, {
                    nodeset: '/phone/phone_number'
                }).defaultValue).to.be.equal('0000111111');

                done(error, xformJson);
            });
        });


        it('should be able to parse question default value and cast to appropriate type', function(done) {
            xform2json(phoneForm, function(error, xformJson) {

                expect(xformJson.questions).to.exist;
                expect(_.find(xformJson.questions, {
                    nodeset: '/phone/age'
                }).defaultValue).to.be.equal(18);

                done(error, xformJson);
            });
        });

        it('should be able to parse question constraint', function(done) {
            xform2json(phoneForm, function(error, xformJson) {

                var question = _.find(xformJson.questions, {
                    nodeset: '/phone/visible_id'
                });

                expect(question).to.exist;
                expect(question.constraint).to.be.equal('regex(., \'^\\d{3}$\')');
                expect(question.constraintMessage)
                    .to.be.equal('Please enter the three digit string from the back of the phone.');

                done(error, xformJson);
            });
        });

    });



    describe('parse questions', function() {

        it('should be able to parse questions', function(done) {
            xform2json(phoneForm, function(error, xformJson) {

                expect(xformJson.questions).to.exist;
                expect(_.map(xformJson.questions, 'ref'))
                    .to.contain(
                        '/phone/visible_id',
                        '/phone/phone_number',
                        '/phone/status',
                        '/phone/note',
                        '/phone/age'
                    );

                done(error, xformJson);
            });
        });


        it('should be able to parse question label with reference to instance value', function(done) {
            xform2json(registrationForm, function(error, xformJson) {

                var question = _.find(xformJson.questions, {
                    name: 'sex'
                });

                expect(question).to.exist;
                expect(question.label.long).to.contain('{{name}}');

                done(error, xformJson);
            });
        });



        describe('parse input form widgets', function() {

            it('should be able to parse string input widget', function(done) {
                xform2json(phoneForm, function(error, xformJson) {

                    var question = _.find(xformJson.questions, {
                        name: 'phone_number'
                    });

                    expect(question).to.exist;
                    expect(question.widget).to.be.equal('input');
                    expect(question.type).to.be.equal('string');

                    done(error, xformJson);
                });
            });


            it('should be able to parse integer input widget', function(done) {
                xform2json(phoneForm, function(error, xformJson) {

                    var question = _.find(xformJson.questions, {
                        name: 'age'
                    });

                    expect(question).to.exist;
                    expect(question.widget).to.be.equal('input');
                    expect(question.type).to.be.equal('integer');

                    done(error, xformJson);
                });
            });

            it('should be able to parse date input widget', function(done) {
                xform2json(registrationForm, function(error, xformJson) {

                    var question = _.find(xformJson.questions, {
                        name: 'birth_date'
                    });

                    expect(question).to.exist;
                    expect(question.widget).to.be.equal('input');
                    expect(question.type).to.be.equal('date');

                    done(error, xformJson);
                });
            });

        });


        describe('parse select1 form widgets', function() {

            it('should be able to parse select1 input widget', function(done) {
                xform2json(phoneForm, function(error, xformJson) {

                    var question = _.find(xformJson.questions, {
                        name: 'status'
                    });

                    expect(question).to.exist;
                    expect(question.widget).to.be.equal('select1');
                    expect(question.type).to.be.equal('select1');
                    expect(_.map(question.item, 'value'))
                        .to.contain(
                            'fuctional',
                            'broken'
                        );

                    done(error, xformJson);
                });
            });

        });



        describe('parse select form widgets', function() {

            it('should be able to parse select input widget', function(done) {
                xform2json(registrationForm, function(error, xformJson) {

                    var question = _.find(xformJson.questions, {
                        name: 'languages'
                    });

                    expect(question).to.exist;
                    expect(question.widget).to.be.equal('select');
                    expect(question.type).to.be.equal('select');
                    expect(_.map(question.item, 'value'))
                        .to.contain(
                            'Hausa',
                            'Igbo'
                        );

                    done(error, xformJson);
                });
            });

        });



        describe('parse upload form widgets', function() {

            it('should be able to parse image upload input widget', function(done) {
                xform2json(registrationForm, function(error, xformJson) {

                    var question = _.find(xformJson.questions, {
                        name: 'picture'
                    });

                    expect(question).to.exist;
                    expect(question.widget).to.be.equal('upload');
                    expect(question.type).to.be.equal('binary');
                    expect(question.mediatype).to.be.equal('image/*');

                    done(error, xformJson);
                });
            });

        });

    });


    describe('parse sectioned form', function() {
        it('dump farmer', function(done) {
            xform2json(farmerForm, function(error, xformJson) {
                fs.writeFileSync('farmer.json', JSON.stringify(xformJson), 'utf-8');
                done(error, xformJson);
            });
        });

        it('dump water complex', function(done) {
            xform2json(waterComplexForm, function(error, xformJson) {
                fs.writeFileSync('waterComplex.json', JSON.stringify(xformJson), 'utf-8');
                done(error, xformJson);
            });
        });
    });


});