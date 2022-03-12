'use strict';
var expect = require('chai').expect
var rewire = require("rewire")

var slugs = rewire('../dist/lib/slugs.js')


describe('slugify function', () => {
    var slugify = slugs.__get__('slugify')

    it('should make text lowercase', () => {
        expect(slugify('HELLo')).to.equal('hello')
    })
})