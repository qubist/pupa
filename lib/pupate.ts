import * as fs from 'fs'
import 'colors'
import * as path from 'path'

import { OPTIONS_FILENAME, HOMEPAGE_FILENAME } from './consts'
import { createOptions, Options } from './options'
import { createStylesheet } from './stylesheet'
import { createHomepage } from './homepage'
import { Entry, makeEntry } from './entry'
import { embellish, unembellish } from './embellish'
import { getSlug } from './slugs'

// Spawns the contents of a valid Pupate directory, writing files and directories that don't exist.
export function spawn(): void {
  console.info('Spawning...'.cyan)
  if (!fs.existsSync('larva')) {
    fs.mkdirSync('larva')
  }
  if (!fs.existsSync('larva/entries')) {
    fs.mkdirSync('larva/entries')
  }
  if (!fs.existsSync(`larva/${HOMEPAGE_FILENAME}`)) {
    // copy homepage file from lib/defaults/ (where all pupate default files are
    // stored) to the working directory
    fs.copyFileSync(path.resolve(__dirname, `../../lib/defaults/larva/${HOMEPAGE_FILENAME}`), `./larva/${HOMEPAGE_FILENAME}`)
  }
  if (!fs.existsSync(OPTIONS_FILENAME)) {
    fs.copyFileSync(path.resolve(__dirname, `../../lib/defaults/${OPTIONS_FILENAME}`), `./${OPTIONS_FILENAME}`)
  }

  console.info('Spawning finished!'.green)
}

export function check(quiet = true): void {
  if (!isPupateDir()) {
    throw 'Not a Pupate-shaped directory'.red
  }
  if (!quiet) {
    console.info('Current directory is Pupate-shaped!'.green)
  }
}

function isPupateDir(): boolean {
  let requiredPaths = ['larva', 'larva/entries', 'larva/homepage.txt', OPTIONS_FILENAME, ]
  let ok = true
  for (const path of requiredPaths) {
    if (!fs.existsSync(path)) {
      ok = false
      console.warn(`WARNING! Missing path: ${path.reset}`.yellow)
    }
  }
  return ok
}

export function ecdysis(): void {
  console.info('Molting...'.cyan)

  // make sure current directory is Pupate-shaped
  check()

  // get user-defined options
  const options = createOptions(`./${OPTIONS_FILENAME}`)

  // set output location for the finished site, and make the directory if needed
  let outputLocation: string = options.outputLocation
  if (!fs.existsSync(outputLocation)) {
    fs.mkdirSync(outputLocation, {recursive: true})
  }

  // clear output directory for a fresh rebuild
  clear(outputLocation)

  // make pageEntry objects from the text files in the entries directory
  let pageEntries: Entry[] = []
  for (const filepath of fs.readdirSync('./larva/entries').filter(isTxt)) {
    pageEntries.push(makeEntry(`./larva/entries/${filepath}`))
  }

  // create pages
  for (const pageEntry of pageEntries) {
    createPage(pageEntry, outputLocation, options)
  }

  // create homepage
  let homepageEntry = makeEntry('./larva/homepage.txt')
  createHomepage(homepageEntry, outputLocation, pageEntries, options)

  // create stylesheet
  createStylesheet(outputLocation, options)
  console.info(`Wrote ${pageEntries.length + 2} files`.cyan)

  console.info(`Molted! New imago lives at: ${outputLocation.reset}`.green)
}

function isTxt(filepath: string): boolean {
  return filepath.endsWith('.txt')
}

// Clear a directory of all files and folders, and move everything into a hidden
// backup directory
function clear(location: string): void {
  console.debug('Clearing the output directory ('.white + location.reset + ') to ensure a fresh rebuild'.white)

  let backupLocation = path.resolve(__dirname, '../../.imagobackup')
  for (let file of fs.readdirSync(location)) {
    let origFilepath = path.resolve(location, file)
    let backupFilepath = path.resolve(backupLocation, file)
    // remove any pre-existing file with the same name (so basicaclly overwrite)
    fs.rmSync(backupFilepath, {recursive: true, force: true})
    fs.renameSync(origFilepath, backupFilepath)
  }

  console.debug(`Deleted files backed up to ${backupLocation.reset}`.white)
}

// Creates a page by rendering the page and writing it to a file inside the correct folder
function createPage(entry: Entry, outputLocation: string, options: Options): void {
  let slug = getSlug(entry, options.pageURLsBasedOn)

  console.debug('Creating page '.white + entry.filename.reset + ' in '.white + path.resolve(outputLocation, slug).reset)

  fs.mkdirSync(path.resolve(outputLocation, slug), {recursive: true})
  fs.writeFileSync(path.resolve(outputLocation, slug, 'index.html'), renderPage(entry))
}

// Renders an Entry into a Page (html string)
function renderPage(entry: Entry): string {
  // read default page html from defaults folder
  let page: string = fs.readFileSync(path.resolve(__dirname, '../../lib/defaults/imago/page.html')).toString()
  // Replace keywords in reverse order in the template so the replaced content
  // can't interfere with the process (only first occurence is replaced)
  page = page.replace(/CONTENT/, embellish(entry.content))
             .replace(/DATESTRING/, entry.datestring)
             .replace(/BODYTITLE/, embellish(entry.title))
             .replace(/TITLE/, unembellish(entry.title))

  return page
}
