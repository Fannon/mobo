/*global describe,it*/
'use strict';
var assert = require('assert'),
  mobo = require('../lib/mobo.js');

describe('mobo node module.', function() {
  it('must be awesome', function() {
    assert( mobo.awesome(), 'awesome');
  });
});
