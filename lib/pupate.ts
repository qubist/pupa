import * as fs from 'fs'
import 'colors'
import * as path from 'path'

import { logger } from '../bin/index'
import { OPTIONS_FILENAME, HOMEPAGE_FILENAME } from './consts'
import { createOptions, Options } from './options'
import { createStylesheet } from './stylesheet'
import { createHomepage } from './homepage'
import { Entry, makeEntry } from './entry'
import { embellish, unembellish } from './embellish'
import { getSlug } from './slugs'

// Spawns the contents of a valid Pupate directory, writing files and directories that don't exist.
export function spawn(): void {
  logger.info('Spawning...'.cyan)
  if (!fs.existsSync('larva')) {
    fs.mkdirSync('larva')
  }
  if (!fs.existsSync('larva/entries')) {
    fs.mkdirSync('larva/entries')
  }
  if (!fs.existsSync(`larva/${HOMEPAGE_FILENAME}`)) {
    // Copy homepage file from lib/defaults/ (where all pupate default files are
    // stored) to the working directory
    fs.copyFileSync(path.resolve(__dirname, `../../lib/defaults/larva/${HOMEPAGE_FILENAME}`), `./larva/${HOMEPAGE_FILENAME}`)
  }
  if (!fs.existsSync(OPTIONS_FILENAME)) {
    fs.copyFileSync(path.resolve(__dirname, `../../lib/defaults/${OPTIONS_FILENAME}`), `./${OPTIONS_FILENAME}`)
  }

  logger.info('Spawning finished!'.green)
}

// Check if the current working directory is Pupate-shaped
// Default to quiet behavior:
//  - Print nothing if it is Pupate-shaped
//  - Print an error and return false if it isn't (letting caller decide whether
//    to terminate)
// Loud behavior:
//  - Also print a message if it is Pupate-shaped
export function check(loud=false): boolean {
  if (!isPupateDir()) {
    logger.error('Not a Pupate-shaped directory'.red)
    return false
  } else {
    if (loud) {
      logger.info('Current directory is Pupate-shaped!'.green)
    }
    return true
  }
}

function isPupateDir(): boolean {
  let requiredPaths = ['larva', 'larva/entries', 'larva/homepage.txt', OPTIONS_FILENAME, ]
  let ok = true
  for (const path of requiredPaths) {
    if (!fs.existsSync(path)) {
      ok = false
      logger.warn(`WARNING! Missing path: ${path.reset}`.yellow)
    }
  }
  return ok
}

export function eclose(): void {
  logger.info('Emerging...'.cyan)

  // Make sure current directory is Pupate-shaped and exit if it isn't
  if (!check()) {
    process.exit(1)
  }

  // Get user-defined options
  const options = createOptions(`./${OPTIONS_FILENAME}`)

  // Set output location for the finished site, and make the directory if needed
  let outputLocation: string = options.outputLocation
  if (!fs.existsSync(outputLocation)) {
    fs.mkdirSync(outputLocation, {recursive: true})
  }

  // Clear output directory for a fresh rebuild
  clear(outputLocation)

  // Make pageEntry objects from the text files in the entries directory
  let pageEntries: Entry[] = []
  for (const filepath of fs.readdirSync('./larva/entries').filter(isTxt)) {
    pageEntries.push(makeEntry(`./larva/entries/${filepath}`))
  }

  // Create pages, careful not to reuse slugs
  createPages(pageEntries, options)

  // Create homepage
  let homepageEntry = makeEntry('./larva/homepage.txt')
  createHomepage(homepageEntry, outputLocation, pageEntries, options)

  // Create stylesheet
  createStylesheet(outputLocation, options)
  logger.info(`Wrote ${pageEntries.length + 2} files`.cyan)

  logger.info(`Emerged! New imago lives at: ${outputLocation.reset}`.green)
}

function isTxt(filepath: string): boolean {
  return filepath.endsWith('.txt')
}

// Clear a directory of all files and folders, and move everything into a hidden
// backup directory
function clear(location: string): void {
  logger.debug('Clearing the output directory '.white + location.reset + ' to ensure a fresh rebuild'.white)

  let backupLocation = path.resolve(__dirname, '../../.imagobackup')
  for (let file of fs.readdirSync(location)) {
    let origFilepath = path.resolve(location, file)
    let backupFilepath = path.resolve(backupLocation, file)
    // Remove any pre-existing file with the same name (so basicaclly overwrite)
    fs.rmSync(backupFilepath, {recursive: true, force: true})
    fs.renameSync(origFilepath, backupFilepath)
  }

  logger.debug(`(The cleared files were backed up to ${backupLocation.reset})`.white)
}

// Creates a page by rendering the page and writing it to a file inside the correct folder
function createPage(entry: Entry, outputLocation: string, options: Options): void {
  let slug = getSlug(entry, options.pageURLsBasedOn)

  logger.debug('Creating page '.white + entry.filename.reset + ' in '.white + path.resolve(outputLocation, slug).reset)

  fs.mkdirSync(path.resolve(outputLocation, slug), {recursive: true})
  fs.writeFileSync(path.resolve(outputLocation, slug, 'index.html'), renderPage(entry))
}

// Renders an Entry into a Page (html string)
function renderPage(entry: Entry): string {
  // Read default page html from defaults folder
  let page: string = fs.readFileSync(path.resolve(__dirname, '../../lib/defaults/imago/page.html')).toString()
  // Replace keywords in reverse order in the template so the replaced content
  // can't interfere with the process (only first occurence is replaced)
  page = page.replace(/CONTENT/, embellish(entry.content))
             .replace(/DATESTRING/, entry.datestring)
             .replace(/BODYTITLE/, embellish(entry.title))
             .replace(/TITLE/, unembellish(entry.title))

  return page
}

function createPages(pageEntries: Entry[], options: Options) {
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
