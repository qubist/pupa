import * as fs from 'fs'
import * as colors from 'colors'
import * as path from 'path'

const OPTIONS_FILENAME = 'options.txt'
const HOMEPAGE_FILENAME = 'homepage.txt'

// Return a welcome message
export function welcome(): string {
  return 'Welcome to Pupate!'
}

// Spawns the contents of a valid Pupate directory, writing files and directories that don't exist.
export function spawn(): void {
  console.log(colors.green('Spawning...'))
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

  console.log(colors.green('Spawning finished!'))
}

export function check(): void {
  if (!isPupateDir()) {
    throw colors.red('Not a Pupate-shaped directory')
  }
}

function isPupateDir(): boolean {
  let requiredPaths = ['larva', 'larva/entries', 'larva/homepage.txt', OPTIONS_FILENAME, ]
  let ok = true
  for (const path of requiredPaths) {
    if (!fs.existsSync(path)) {
      ok = false
      console.warn(colors.yellow('Missing path:'), path)
    }
  }
  return ok
}

type Options = Record<string, string | undefined>

// Returns a dictionary of option-name: value pairs.
function getOptions(): Options {
  let optionsList: string[] = fs.readFileSync(OPTIONS_FILENAME).toString().split(/\r?\n/)

  // check that the options file is formatted right
  if (!validOptionsFormat(optionsList)) {
    throw colors.red('Options file not formatted properly')
  }
  let optionsDict: Options = {}
  for (let o of optionsList) {
    // Ignore whitespace or empty lines
    if (/^\s*$/.test(o)) {
      continue
    }
    // no value for standalone option names
    if (/^[A-z]+$/.test(o.trim())) {
      optionsDict[o.trim()] = undefined
      continue
    }
    optionsDict[o.substr(0,o.indexOf(' '))] = o.substr(o.indexOf(' ')+1)
  }

  // FIXME: apply default option values to any options that are undefined

  // check that the values of all the options are resonable
  let result: BooleanWithDetails = validOptionsValues(optionsDict)
  if (!result.boolean) {
    throw colors.red(`The following values in ${OPTIONS_FILENAME} were not valid: ${result.details}`)
  }

  return optionsDict
}

function validOptionsFormat(optionsList: string[]): boolean {
  for (const o of optionsList) {
    // regex: each line must be either: an option name with any amount of
    // whitespace after, or an option name with a space and then anything after
    // that, or a blank line.
    if (!/^[A-z]+\W*$|^[A-z]+ .+$|^\s*$/.test(o)) {
      return false
    }
  }
  return true
}

interface BooleanWithDetails {
  boolean: boolean,
  details: string | undefined
}

// Returns whether the option values were valid and possibly a string of the the
// options values that were invalid.
function validOptionsValues(_options: Options): BooleanWithDetails {
  // FIXME
  // e.g. "sortIndexBy" has to be 'newest' 'oldest' etc.
  // also accept undefined!
  return {boolean: true, details: undefined}
}

interface Entry {
  filename: string, // filename without extension
  title: string,
  datestring: string,
  content: string
}

export function ecdysis(): void {
  console.log(colors.green('Molting...'))

  // make sure current directory is Pupate-shaped
  check()

  // get user-defined options
  const options = getOptions()
  console.log(options)

  // make pageEntry objects from the text files in the entries directory
  let pageEntries: Entry[] = []
  for (const filepath of fs.readdirSync('./larva/entries').filter(isTxt)) {
    pageEntries.push(makeEntry(`./larva/entries/${filepath}`))
  }

  // set output location for the finished site
  let outputLocation: string
  if (options['outputLocationIs'] == undefined) {
    // default output location is imago directory, level with larva
    outputLocation = './imago'
  } else {
    outputLocation = options['outputLocationIs']
  }

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
}

function isTxt(filepath: string): boolean {
  return filepath.endsWith('.txt')
}

function makeEntry(path: string): Entry {
  let file = fs.readFileSync(path)
  let lines = file.toString().split(/\r?\n/)
  // final filename in path, without extension
  let filename = path.split('/').slice(-1)[0].split('.').slice(0,1)[0]

  return {
    filename,
    title: lines[0], // first line is title
    datestring: lines[1], // second is datestring
    content: lines.slice(2).join('\n') // all lines after that are content
  }
}

// Creates a page by rendering the page and writing it to a file inside the correct folder
function createPage(entry: Entry, outputLocation: string, _options: Options): void {
  let urlPart: string = entry.filename // FIXME use option to decide

  fs.mkdirSync(`${outputLocation}/${urlPart}`, {recursive: true})
  fs.writeFileSync(`${outputLocation}/${urlPart}/index.html`, renderPage(entry))
}

// Renders an Entry into a Page (html string)
function renderPage(entry: Entry): string {
  // read default page html from defaults folder
  let page: string = fs.readFileSync(path.resolve(__dirname, '../../lib/defaults/imago/page.html')).toString()

  // replace() documentation: If pattern is a string, only the first occurrence will be replaced.
  // replace keywords in reverse order in the template so the replaced content can't interfere with the process
  page = page.replace(/CONTENT/, entry.content)
  page = page.replace(/DATESTRING/, entry.datestring)
  page = page.replace(/TITLEBODY/, entry.title)
  page = page.replace(/TITLE/, entry.title)

  return page
}

// Creates the homepage by rendering it and outputing the file to the right location
function createHomepage(entry: Entry, outputLocation: string, pageEntries: Entry[], options: Options): void {
  fs.writeFileSync(`${outputLocation}/index.html`, renderHomepage(entry, pageEntries, options))
}

// Renders an entry into the homepage (html string), ignoring datestring,
// and creating an index from the list of page entries
function renderHomepage(entry: Entry, pageEntries: Entry[], options: Options): string {
  // bring in template homepage from defaults folder
  let homepage: string = fs.readFileSync(path.resolve(__dirname, '../../lib/defaults/imago/homepage.html')).toString()

  // create index from list of page entries
  let index: string = ''
  if (options['showIndexWith'] != 'dont') { // if we should actually make an index
    // decide from options how to sort the index
    let sortFunction
    switch (options['sortIndexBy']) {
      case 'newest':
        sortFunction = (a: Entry, b: Entry): number => a.datestring.localeCompare(b.datestring)
        break
      case 'oldest':
        sortFunction = (a: Entry, b: Entry): number => -1 * a.datestring.localeCompare(b.datestring)
        break
      case 'filename':
        sortFunction = (a: Entry, b: Entry): number => a.filename.localeCompare(b.filename)
        break
      case 'title':
        sortFunction = (a: Entry, b: Entry): number => a.title.localeCompare(b.title)
        break
      // validOptionsValues should catch anything else, so no default needed
    }

    // decide from options how to display the index
    //  - with or without dates
    //  - with the proper links
    console.log(pageEntries)
    console.log(pageEntries.sort(sortFunction))
    for (const entry of pageEntries.sort(sortFunction)) {
      // get the link that will lead to the entry's page
      let entryLink
      if (options['entryURLsBasedOn'] == 'title') {
        entryLink = entry.title
      } else {
        entryLink = entry.filename
      }

      if (options['showIndexWith'] == 'dates') {
        index += `${entry.datestring} <a href="${entryLink}">${entry.title}</a>\n`
      } else if (options['showIndexWith'] == 'noDates') {
        index += `<a href="${entryLink}">${entry.title}</a>\n`
      } else {
        throw colors.red('Unknown value for showIndexWith option')
      }
    }
  }

  // replace keywords in homepage template, bottom to top
  homepage = homepage.replace(/INDEX/, index)
  homepage = homepage.replace(/CONTENT/, entry.content)
  homepage = homepage.replace(/TITLEBODY/, entry.title)
  homepage = homepage.replace(/TITLE/, entry.title)

  return homepage
}

function createStylesheet(outputLocation: string, options: Options) {
  fs.writeFileSync(`${outputLocation}/styles.css`, renderStylesheet(outputLocation, options))
}

function renderStylesheet(outputLocation: string, options: Options): string {
  // bring in template homepage from defaults folder
  let stylesheet: string = fs.readFileSync(path.resolve(__dirname, '../../lib/defaults/imago/styles.css')).toString()

  // replace keywords in styles template, bottom to top
  // FIXME: options should mabe be an interface? needs work
  stylesheet = stylesheet.replace(/LINKCOLOR/, options['linkColorIs'])
  stylesheet = stylesheet.replace(/BACKGROUNDCOLOR/, options['backgroundColorIs'])
  stylesheet = stylesheet.replace(/TEXTCOLOR/, options['textColorIs'])
  stylesheet = stylesheet.replace(/FONTSIZE/, options['sizeIs'])
  stylesheet = stylesheet.replace(/FONTFAMILY/, options['fontIs'])

  return stylesheet
}
