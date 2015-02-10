/*global describe,it*/
'use strict';

var expect = require('chai').expect;

var moboUtil = require('../../lib/util/moboUtil.js');

describe('mobo utilities ', function() {

    it('pad numbers', function() {
        expect(moboUtil.pad(7, 1)).to.equal('7');
        expect(moboUtil.pad(7, 2)).to.equal('07');
        expect(moboUtil.pad(7, 3)).to.equal('007');
    });

    it('strip trailing slashes from URLs', function() {
        expect(moboUtil.stripTrailingSlash('http://fannon.de/')).to.equal('http://fannon.de');
    });

    it('creates date arrays', function() {
        expect(moboUtil.getDateArray().length).to.equal(7);
        expect(moboUtil.getDateArray()[0]).to.equal(new Date().getFullYear());
    });

    it('return human readable date-times', function() {
        expect(moboUtil.humanDate().length).to.equal(19);
    });

    it('return machine optimized date-times', function() {
        expect(moboUtil.roboDate().length).to.equal(19);
    });

    it('clears global log object', function() {
        expect(moboUtil.clearLogHistory()).to.be.instanceof(Array);
    });

    it('logs a string message to the console', function() {
        moboUtil.log(new Error('error log entry'));
        moboUtil.log({"title": "Object log entry"});
        moboUtil.log(' [i] info log entry ');
        moboUtil.log(' [W] warning log entry');
        moboUtil.log(' [E] error log entry');
        moboUtil.log(' [S] success log entry');
        moboUtil.log(' [D] debug log entry');
        moboUtil.log(' [+] added log entry');
        moboUtil.log(' [-] removed log entry');
        moboUtil.log(' [C] changed log entry');
        moboUtil.log(' [TODO] todo log entry');
    });

    it('returns the log history as an array', function() {
        var logArchive = moboUtil.getLogHistory();
        expect(logArchive).to.be.instanceof(Array);
        expect(logArchive.length).to.be.least(1);
    });

    it('writes the log history to a file', function() {
        // TODO: Test history log file
        //moboUtil.writeLogHistory('');
    });

});
