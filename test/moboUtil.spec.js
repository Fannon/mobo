/*global describe,it*/
'use strict';

var expect = require('chai').expect;

var moboUtil = require('../lib/util/moboUtil.js');

describe('mobo utilities ', function() {

    it('pad numbers', function() {
        expect(moboUtil.pad(7, 1)).to.equal('7');
        expect(moboUtil.pad(7, 2)).to.equal('07');
        expect(moboUtil.pad(7, 3)).to.equal('007');
    });

    it('strip trailing slashes from URLs', function() {
        expect(moboUtil.stripTrailingSlash('http://fannon.de/')).to.equal('http://fannon.de');
    });

});
