'use strict';
var expect = require('chai').expect

const { writeFileSync, rmSync } = require('fs');
var entry = require('../dist/lib/entry.js')


describe('makeEntry function', () => {

    describe('basic', () => {

        let basicEntry
        let path = './test/basicEntry.txt'

        before(() => {

            writeFileSync(path,
`Happy birthday, Sammy!
2022/03/14

OMG it's sammy's birthday! That's so exciting :) Wow. I can't believe it. Oh boy.

`)
            basicEntry = entry.makeEntry(path)
        }) 

        it('creates an entry', () => {
            expect(basicEntry).to.exist
        })

        it('uses the right filename', () => {
            expect(basicEntry.filename).to.equal('basicEntry')
        })

        it('uses the first line as the title', () => {
            expect(basicEntry.title).to.equal('Happy birthday, Sammy!') 
        })
        
        it('uses the second line as the datestring', () => {
            expect(basicEntry.datestring).to.equal('2022/03/14') 
        })

        it('uses the correct content', () => {
            expect(basicEntry.content).to.equal(`OMG it's sammy's birthday! That's so exciting :) Wow. I can't believe it. Oh boy.\n\n`)
        })

        after(() => {
            rmSync(path)
        })

    })

    describe('filename', () => {

        let filenameEntry
        let path = './test/filenameWith\.aDot.txt'

        before(() => {

            writeFileSync(path, '')
            filenameEntry = entry.makeEntry(path)
        }) 

        it('only removes the extension', () => {
            expect(filenameEntry.filename).to.equal('filenameWith.aDot')
        })

        after(() => {
            rmSync(path)
        })

    })

})
