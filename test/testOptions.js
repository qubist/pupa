'use strict';
var expect = require('chai').expect
var rewire = require("rewire");

var options = rewire('../dist/lib/options.js')


describe('validOptionsFormat function', () => {
    var validOptionsFormat = options.__get__('validOptionsFormat')

    it('returns true for normal looking options', () => {
        let optionsList = [ 'fontIs monospace', 'sizeIs 16px', 'textColorIs initial', 'linkColorIs revert', 'backgroundColorIs initial', 'showIndexWith dates', 'sortIndexBy newest', 'pageURLsBasedOn filename', 'outputLocationIs ./imago/', 'RSSBaseURLIs https://www.example.com/']
        expect(validOptionsFormat(optionsList)).to.be.true
    })

    it('returns true for an option name with whitespace after', () => {
        let optionsList = [ 'grabbaGoop      ' ]
        expect(validOptionsFormat(optionsList)).to.be.true
    })
    
    it('returns true for an option name with no whitespace after', () => {
        let optionsList = [ 'thrumbTumple' ]
        expect(validOptionsFormat(optionsList)).to.be.true
    })

    it('returns true for an option name with a space and then something after', () => {
        expect(validOptionsFormat([ 'grabbaGoop 6' ])).to.be.true
        // multiple spaces counts as a spaces plus something (the something starts with space though)
        expect(validOptionsFormat([ 'shontondleCrantoondee  6' ])).to.be.true
        expect(validOptionsFormat([ 'shontondleCrantoondee   6' ])).to.be.true
        expect(validOptionsFormat([ 'snoodle apple(got) anub. 54 rockteen' ])).to.be.true
    })

    it('returns true for a blank line', () => {
        expect(validOptionsFormat([ '' ])).to.be.true
        expect(validOptionsFormat([ ' ' ])).to.be.true
        expect(validOptionsFormat([ '    ' ])).to.be.true
        expect(validOptionsFormat([ '\t' ])).to.be.true
    })

    it("returns true if list is emtpy", () => {
        expect(validOptionsFormat([ ])).to.be.true
    })

    it("returns false if there's weird symbols in the option", () => {
        expect(validOptionsFormat([ 'Ar*& test-value' ])).to.be.false
        expect(validOptionsFormat([ 'Fs828 test-value' ])).to.be.false
    })

    it("returns false if even only one option is invalid", () => {
        expect(validOptionsFormat([ 'heightOfThing 10px', 'blargIs true', '', '098340r87' ])).to.be.false
    })

})

