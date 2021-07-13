import * as fs from 'fs'
import 'colors'
import * as path from 'path'

import { OPTIONS_FILENAME, HOMEPAGE_FILENAME } from './consts'
import { createOptions, Options } from './options'
import { createStylesheet } from './stylesheet'
import { createHomepage } from './homepage'
import { Entry, makeEntry } from './entry'
import { embellish } from './embellish'

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

export function check(): void {
  if (!isPupateDir()) {
    throw 'Not a Pupate-shaped directory'.red
  }
}

function isPupateDir(): boolean {
  let requiredPaths = ['larva', 'larva/entries', 'larva/homepage.txt', OPTIONS_FILENAME, ]
  let ok = true
  for (const path of requiredPaths) {
    if (!fs.existsSync(path)) {
      ok = false
      console.warn(`Missing path: ${path.reset}`.yellow)
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

  // make pageEntry objects from the text files in the entries directory
  let pageEntries: Entry[] = []
  for (const filepath of fs.readdirSync('./larva/entries').filter(isTxt)) {
    pageEntries.push(makeEntry(`./larva/entries/${filepath}`))
  }

  // set output location for the finished site, and make the directory if needed
  let outputLocation: string = options.outputLocation
  if (!fs.existsSync(outputLocation)) {
    fs.mkdirSync(outputLocation, {recursive: true})
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

// Creates a page by rendering the page and writing it to a file inside the correct folder
function createPage(entry: Entry, outputLocation: string, _options: Options): void {
  console.debug(`Creating page: ${entry.filename.reset}`.white)

  let urlPart: string = entry.filename // FIXME use option to decide

  fs.mkdirSync(`${outputLocation}/${urlPart}`, {recursive: true})
  fs.writeFileSync(`${outputLocation}/${urlPart}/index.html`, renderPage(entry))
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
             .replace(/TITLE/, entry.title)

  return page
}
