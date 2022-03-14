import * as fs from 'fs'
import 'colors'
import * as path from 'path'
import { logger } from './logger'

import { OPTIONS_FILENAME, HOMEPAGE_FILENAME } from './consts'
import { createOptions } from './options'
import { createPages } from './pages'
import { createRSS } from './rss'
import { createHomepage } from './homepage'
import { createStylesheet } from './stylesheet'
import { Entry, makeEntry } from './entry'

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
    // Copy homepage file from defaults/ (where all Pupate default files are
    // stored) to the working directory
    fs.copyFileSync(path.resolve(__dirname, `../../defaults/larva/${HOMEPAGE_FILENAME}`), `./larva/${HOMEPAGE_FILENAME}`)
  }
  if (!fs.existsSync(OPTIONS_FILENAME)) {
    fs.copyFileSync(path.resolve(__dirname, `../../defaults/${OPTIONS_FILENAME}`), `./${OPTIONS_FILENAME}`)
  }

  logger.info('Spawning finished!'.green)
}

// Check if the current working directory is Pupate-shaped
// Default to quiet behavior:
//  - Do nothing if it is Pupate-shaped
//  - Throw an error if it isn't (letting caller decide whether
//    to terminate)
// Loud behavior:
//  - Also print a message if it is Pupate-shaped
export function check(loud=false): void {
  if (!isPupateDir()) {
    throw 'Not a Pupate-shaped directory'.red
  } else {
    if (loud) {
      logger.info('Current directory is Pupate-shaped!'.green)
    }
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
  check()

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

  // Create RSS XML file
  createRSS(pageEntries, homepageEntry, options)

  // Create stylesheet
  createStylesheet(outputLocation, options)
  logger.info(`Wrote ${pageEntries.length + 3} files`.cyan)

  logger.info(`Emerged! A tender new imago lives at: ${outputLocation.reset}`.green)
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
