import * as path from 'path'
import * as fs from 'fs'
import 'colors'

import { logger } from './logger'
import { Options } from './options'
import { Entry } from './entry'
import { embellish, unembellish } from './embellish'
import { getSlug } from './slugs'

// Creates the homepage by rendering it and outputing the file to the right location
export function createHomepage(entry: Entry, outputLocation: string, pageEntries: Entry[], options: Options): void {
  logger.debug('Creating homepage'.white)

  fs.writeFileSync(`${outputLocation}/index.html`, renderHomepage(entry, pageEntries, options))
}

// Renders an entry into the homepage (html string), ignoring datestring,
// and creating an index from the list of page entries
function renderHomepage(entry: Entry, pageEntries: Entry[], options: Options): string {
  // Bring in template homepage from defaults folder
  let homepage: string = fs.readFileSync(path.resolve(__dirname, '../../defaults/imago/homepage.html')).toString()

  // Create index from list of page entries
  let index: string = ''
  if (options.showIndexWith != 'dont') { // If we should actually make an index...
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
      // Checks should catch anything else, so no default needed
    }

    // Decide from options how to display the index
    //  - with or without dates
    //  - with the proper links
    for (const entry of pageEntries.sort(sortFunction)) {
      // Get the link that will lead to the entry's page
      let slug = getSlug(entry, options.pageURLsBasedOn)

      // NOTE: Potentially change embellish below to unembellish if unembellished index is better?
      //       or add an option for this
      if (options['showIndexWith'] == 'dates') {
        index += `${entry.datestring} <a href="${slug}">${embellish(entry.title)}</a>\n`
      } else if (options['showIndexWith'] == 'noDates') {
        index += `<a href="${slug}">${embellish(entry.title)}</a>\n`
      } else {
        throw 'Unknown value for showIndexWith option'.red
      }
    }
  }

  // Replace keywords in homepage template, bottom to top
  homepage = homepage.replace(/INDEX/, index)
                     .replace(/CONTENT/, embellish(entry.content))
                     .replace(/BODYTITLE/, embellish(entry.title))
                     .replace(/TITLE/, unembellish(entry.title))

  return homepage
}
