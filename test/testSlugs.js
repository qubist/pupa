'use strict';
var expect = require('chai').expect
var rewire = require("rewire");
require('colors')

var slugs = rewire('../dist/lib/slugs.js')


describe('slugify function', () => {
    var slugify = slugs.__get__('slugify')
    let form = 'filename'

    it('should make text lowercase', () => {
        expect(slugify('HELLo', form)).to.equal('hello')
    })

    it('removes trailing and leading whitespace', () => {
        expect(slugify('   test', form)).to.equal('test')
        expect(slugify('test    ', form)).to.equal('test')
        expect(slugify('   test    ', form)).to.equal('test')
    })

    it('replaces invalid characters with dashes', () => {
        expect(slugify('/', form)).to.equal('-')
        expect(slugify('?', form)).to.equal('-')
        expect(slugify(' ', form)).to.equal('-')
        expect(slugify('\t', form)).to.equal('-')
        expect(slugify('\'', form)).to.equal('-')
        expect(slugify('/_;:,? \'"*()[]{}!', form)).to.equal('-') // dashes get collapsed later
        expect(slugify('omg! This is  the title/description of an article :)', form)).to.equal('omg-this-is-the-title-description-of-an-article') // trailing dash is removed later
    })

    it('collapses dashes', () => {
        expect(slugify('---', form)).to.equal('-')
        expect(slugify('anti---virus', form)).to.equal('anti-virus')
    })

    it('removes leading and trailing dashes', () => {
        expect(slugify('---broccoli', form)).to.equal('broccoli')
        expect(slugify('spagetti---', form)).to.equal('spagetti')
    })

    it('throws an error if slugification produces an empty string', () => {
        expect(() => slugify('', form)).to.throw()
    })

    it('produces a meaningful error message', () => {
        expect(() => slugify('', 'filename')).to.throw('Slugification failed! An entry had the '.red + 'filename'.red + ' ""'.reset + ', which produced an empty slug. Try changing this '.red + 'filename'.red + ' or choose a new option for the pageURLsBasedOn setting.'.red)
        expect(() => slugify('', 'date')).to.throw('Slugification failed! An entry had the '.red + 'date'.red + ' ""'.reset + ', which produced an empty slug. Try changing this '.red + 'date'.red + ' or choose a new option for the pageURLsBasedOn setting.'.red)
        expect(() => slugify('', 'title')).to.throw('Slugification failed! An entry had the '.red + 'title'.red + ' ""'.reset + ', which produced an empty slug. Try changing this '.red + 'title'.red + ' or choose a new option for the pageURLsBasedOn setting.'.red)
    })
})

