'use strict';
var expect = require('chai').expect

var embellish = require('../dist/lib/embellish.js')


describe('embellish function', () => {
    describe('sanity', () => {
        it('should not mess with normal text', () => {
            expect(embellish.embellish('Boy')).to.equal('Boy')
        })
    })

    describe('links', () => {
        it('should render link embellishments', () => {
            var result = embellish.embellish('[Wikipedia](https://wikipedia.org)')
            expect(result).to.equal('<a href="https://wikipedia.org">Wikipedia</a>')
        })
    })

    describe('colors', () => {
        it('should render color embellishments', () => {
            var result = embellish.embellish('{red text is red}(red)')
            expect(result).to.equal('<span style="color: red">red text is red</span>')
        })
    })

    describe('bold and italic', () => {
        it('should render bold embellishments', () => {
            var result = embellish.embellish('*bold* word * non bold * \\*non-bold phrase\\*')
            expect(result).to.equal('<b>bold</b> word * non bold * *non-bold phrase*')
        })
        it('should render italic embellishments', () => {
            var result = embellish.embellish('_italic_ word _ non italic _ \\_non-italic phrase\\_')
            expect(result).to.equal('<i>italic</i> word _ non italic _ _non-italic phrase_')
        })
    })

    describe('escape characters', () => {
        it('should remove single escape characters', () => {
            var result = embellish.embellish('this is not a link: \\[test\\]\\(www.example.com\\)')
            expect(result).to.equal('this is not a link: [test](www.example.com)')
        })
        it('should leave any escape characters that are escaped themselves', () => {
            var result = embellish.embellish('this is a backslash: \\\\')
            expect(result).to.equal('this is a backslash: \\')
        })
    })
})


describe('unembellish function', () => {
    describe('sanity', () => {
        it('should not mess with normal text', () => {
            var result = embellish.unembellish('Boy')
            expect(result).to.equal('Boy')
        })
    })

    describe('links', () => {
        it('should remove link embellishments', () => {
            var result = embellish.unembellish('[Wikipedia](https://wikipedia.org)')
            expect(result).to.equal('Wikipedia')
        })
    })

    describe('colors', () => {
        it('should remove color embellishments', () => {
            var result = embellish.unembellish('{red text is red}(red)')
            expect(result).to.equal('red text is red')
        })
    })

    describe('bold and italic', () => {
        it('should remove bold embellishments', () => {
            var result = embellish.unembellish('*bold* word * non bold * \\*non-bold phrase\\*')
            expect(result).to.equal('bold word * non bold * *non-bold phrase*')
        })
        it('should remove italic embellishments', () => {
            var result = embellish.unembellish('_italic_ word _ non italic _ \\_non-italic phrase\\_')
            expect(result).to.equal('italic word _ non italic _ _non-italic phrase_')
        })
    })

    describe('escape characters', () => {
        it('should remove single escape characters', () => {
            var result = embellish.unembellish('this is not a link: \\[test\\]\\(www.example.com\\)')
            expect(result).to.equal('this is not a link: [test](www.example.com)')
        })
        it('should leave any escape characters that are escaped themselves', () => {
            var result = embellish.unembellish('this is a backslash: \\\\')
            expect(result).to.equal('this is a backslash: \\')
        })
    })
})

// More tests for each regex live at regex101.com (links next to regexes in embellish.ts)