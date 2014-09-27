/*global describe,it*/
'use strict';
var assert = require('assert');
var fs = require('fs');
var mobo = require('../lib/mobo.js');

describe('mobo node module.', function() {
  it('has a version number', function() {
    assert(mobo.getVersion(), fs.readFileSync(__dirname + '/../cli.md').toString());
  });
});
