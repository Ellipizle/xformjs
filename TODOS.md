# Form Parsing

## General
- [ ] Parallelize algorithms whenever possible
- [ ] Parallel parsing of bindings and questions
- [ ] Allow additional parser to be added/plugged in
- [ ] Accept options to specify missing values and default values per question type
- [ ] Parse form description
- [ ] Parse form version

## Function, Calculation & Formulas
- [ ] Implement and evaluate expressions
- [ ] Implement and evaluate formulas
- [ ] Implement and evaluate functions
- [ ] Evaluate calculations
- [ ] Implement formula to fill required metadata

## Validation & Constraints
- [ ] Implement and evaluate constraints
- [ ] Validate xForm before parsing

## Bindings
- [x] Parse question *variable name* from `nodeset` or `ref`
- [x] Parse, cast and set default values
    + [x] for `required` set to `false`
    + [x] for `readonly` set to `false`
    + [x] for `saveIncomplete` set to `false`
- [ ] Parse question relevant
- [x] Parse question readonly
- [x] Parse question type, default to *string* if none present

## Translation
- [x] parse default language
- [x] normalize default language
- [ ] parse translation text
- [ ] parse short and long attributes
- [ ] parse node with no attributes
- [ ] add translation per question
- [ ] parse media translation

## Instance
- [x] Parse primary instance name
- [x] Parse and obtain node default values and set them to `default` or `defaultValue` on bindings
- [ ] Parse common instance id, version and preloads
- [ ] Parse meta and add formula to evaluate them
- [ ] Parse geopoint data

## Body
- [ ] Parse question index/number
- [ ] Parse question page/face
- [ ] Parse question nodes attributes
- [x] Parse both nodeset and ref
- [ ] Process complex body structure
- [ ] Pre-code well known question types
- [x] Parse form input widget to be used in a given question
- [ ] Normalize input widgets to be used for html forms
- [ ] 

## Label
- [ ] Allow references to be binded on the label using angular style
- [ ] 

'use strict';

//dependencies
var fs = require('fs');
var path = require('path');
var expect = require('chai').expect;
var xform2json = require(path.join(__dirname, '..')).xform2json;

describe('xform2json complex', function() {

    describe('title', function() {
        var form =
            fs.readFileSync(path.join(__dirname, 'forms', 'farmer', 'forms', 'Farmer.xml'), 'utf-8');

        it('should be able to parse xForm title', function(done) {
            xform2json(form, function(error, xformJson) {

                expect(xformJson).to.exist;
                expect(xformJson.title).to.exist;
                expect(xformJson.title).to.be.equal('Farmer');

                done(error, xformJson);
            });
        });

    });

});
