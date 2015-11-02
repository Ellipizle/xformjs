'use strict';

//dependencies
var _ = require('lodash');


/**
 * @module meta
 * @description parse form metadata questions
 * @type {Object}
 * @public
 */
var meta = {};

//reference to form bindings
meta.bindings;


/**
 * @description check if the given node is meta
 * @param  {String}  node valid bindings node
 * @return {Boolean} whether node is a meta or not
 * @public
 */
meta.isMeta = function(node) {
    //check if input is widget
    var isMeta = _.has(node, 'preload');

    return isMeta;
};


meta.parse = function() {
    var _meta = [];

    //collect meta
    _.forEach(meta.bindings, function(binding) {
        if (meta.isMeta(binding)) {
            _meta.push(binding);
        }
    });

    //compact meta
    _meta = _.compact(_meta);

    return _meta;

};

//export meta parser
module.exports = exports = meta;