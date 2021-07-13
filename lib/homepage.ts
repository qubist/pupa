import * as path from 'path'
import * as fs from 'fs'
import 'colors'

import { Options } from './options'
import { Entry } from './entry'
import { embellish, unembellish } from './embellish'

// Creates the homepage by rendering it and outputing the file to the right location
export function createHomepage(entry: Entry, outputLocation: string, pageEntries: Entry[], options: Options): void {
  console.debug('Creating homepage'.white)

  fs.writeFileSync(`${outputLocation}/index.html`, renderHomepage(entry, pageEntries, options))
}

// Renders an entry into the homepage (html string), ignoring datestring,
// and creating an index from the list of page entries
function renderHomepage(entry: Entry, pageEntries: Entry[], options: Options): string {
  // bring in template homepage from defaults folder
  let homepage: string = fs.readFileSync(path.resolve(__dirname, '../../lib/defaults/imago/homepage.html')).toString()

  // create index from list of page entries
  let index: string = ''
  if (options.showIndexWith != 'dont') { // if we should actually make an index
    // decide from options how to sort the index
    let sortFunction
    switch (options.sortIndexBy) {
      case 'newest':
        sortFunction = (a: Entry, b: Entry): number => -1 * a.datestring.localeCompare(b.datestring)
        break
      case 'oldest':
        sortFunction = (a: Entry, b: Entry): number => a.datestring.localeCompare(b.datestring)
        break
      case 'filename':
        sortFunction = (a: Entry, b: Entry): number => a.filename.localeCompare(b.filename)
        break
      case 'title':
        sortFunction = (a: Entry, b: Entry): number => a.title.localeCompare(b.title)
        break
      // checks should catch anything else, so no default needed
    }

    // decide from options how to display the index
    //  - with or without dates
    //  - with the proper links
    for (const entry of pageEntries.sort(sortFunction)) {
      // get the link that will lead to the entry's page
      let entryLink
      switch (options.pageURLsBasedOn) {
        case 'title':
          entryLink = entry.title
          break
        case 'filename':
          entryLink = entry.filename
          break
        case 'date':
          entryLink = entry.datestring
          break
      }

      // NOTE: Potentially change embellish below to unembellish if unembellished index is better?
      //       or add an option for this
      if (options['showIndexWith'] == 'dates') {
        index += `${entry.datestring} <a href="${entryLink}">${embellish(entry.title)}</a>\n`
      } else if (options['showIndexWith'] == 'noDates') {
        index += `<a href="${entryLink}">${embellish(entry.title)}</a>\n`
      } else {
        throw 'Unknown value for showIndexWith option'.red
      }
    }
  }

  // replace keywords in homepage template, bottom to top
  homepage = homepage.replace(/INDEX/, index)
                     .replace(/CONTENT/, embellish(entry.content))
                     .replace(/BODYTITLE/, embellish(entry.title))
                     .replace(/TITLE/, unembellish(entry.title))

  return homepage
}
