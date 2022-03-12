import * as fs from 'fs'
import 'colors'
import * as path from 'path'
import { logger } from './logger'

import { Entry } from './entry'
import { embellish, unembellish } from './embellish'
import { getSlug } from './slugs'
import { Options } from './options'

// Creates a page by rendering the page and writing it to a file inside the correct folder
function createPage(entry: Entry, outputLocation: string, options: Options): void {
    let slug = getSlug(entry, options.pageURLsBasedOn)

    logger.debug('Creating page '.white + entry.filename.reset + ' in '.white + path.resolve(outputLocation, slug).reset)

    fs.mkdirSync(path.resolve(outputLocation, slug), { recursive: true })
    fs.writeFileSync(path.resolve(outputLocation, slug, 'index.html'), renderPage(entry))
}

// Renders an Entry into a Page (HTML string)
function renderPage(entry: Entry): string {
  // Read default page HTML from defaults folder
  let page: string = fs.readFileSync(path.resolve(__dirname, '../../defaults/imago/page.html')).toString()
  // Replace keywords in reverse order in the template so the replaced content
  // can't interfere with the process (only first occurence is replaced)
  page = page.replace(/CONTENT/, embellish(entry.content))
             .replace(/DATESTRING/, entry.datestring)
             .replace(/BODYTITLE/, embellish(entry.title))
             .replace(/TITLE/, unembellish(entry.title))

  return page
}

export function createPages(pageEntries: Entry[], options: Options): void {
  let usedSlugs: string[] = []

  // Iterate through all entries backwards so we can remove while iterating
  pageEntries.reverse() // but reverse it first to preserve order
  for (let i = pageEntries.length - 1; i >= 0; i--) {
    const pageEntry = pageEntries[i]

    let currentSlug = getSlug(pageEntry, options.pageURLsBasedOn)
    if (usedSlugs.includes(currentSlug)) {
      logger.warn('WARNING! The page for entry '.yellow + unembellish(pageEntry.title).reset + ' would have generated with the same URL (ending in '.yellow + currentSlug.reset + ') as an already-generated page. Skipping creation of this page! Disambiguate the '.yellow + options.pageURLsBasedOn.yellow + ' of the entry so Pupate can create this page.'.yellow)
      pageEntries.splice(i, 1); // Remove current entry so it's skipped later
    } else {
      createPage(pageEntry, options.outputLocation, options)
      usedSlugs.push(currentSlug)
    }
  }
  pageEntries.reverse() // Put the order back to normal
}
