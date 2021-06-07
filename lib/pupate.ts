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

type OptionsDict = Record<string, string>

// Inspects an options file and returns a dictionary of option-name:value pairs,
// as long as the file is formatted right. Dictionary won't have entries for
// options not listed in the file or without a value.
function getOptionsDict(filename: Path): OptionsDict {
  // get list of lines from file
  let optionsList: string[] = fs.readFileSync(filename).toString().split(/\r?\n/)

  // check that the options file is formatted right
  if (!validOptionsFormat(optionsList)) {
    throw colors.red(`Options file "${filename}" not formatted properly`)
  }

  let optionsDict: Record<string, string> = {}
  for (let o of optionsList) {
    // ignore whitespace or empty lines and ignore standalone option names
    if (!/^\s*$/.test(o) && !/^[A-z]+$/.test(o.trim())) {
      let optionName: string = o.substr(0,o.indexOf(' '))
      let optionValue: string = o.substr(o.indexOf(' ')+1)
      optionsDict[optionName] = optionValue
    }
  }

  // check that options have resonable values
  var { boolean, details } = validOptionsValues(optionsDict)
  if (!boolean) {
      throw colors.red(`The following options in ${filename} were not valid: ${details}`);
  }

  return optionsDict
}

type CSSValue = string
type Path = string
type ShowIndexWithValue = 'dates' | 'noDates' | 'dont'
type SortIndexByValue = 'newest' | 'oldest' | 'filename' | 'title'
type PageURLsBasedOnValue = 'title' | 'filename' | 'date'

interface Options {
    font: CSSValue,
    size: CSSValue,
    textColor: CSSValue,
    linkColor: CSSValue,
    backgroundColor: CSSValue,
    showIndexWith: ShowIndexWithValue,
    sortIndexBy: SortIndexByValue,
    pageURLsBasedOn: PageURLsBasedOnValue,
    outputLocation: Path
}

function createOptions(optionsFile: Path): Options {
  // we know user values are resonable at this point. Get them.
  let userOptionsDict = getOptionsDict(optionsFile)
  let defaultOptionsDict = getOptionsDict(path.resolve(__dirname, `../../lib/defaults/${OPTIONS_FILENAME}`))

  // fill out options with user defined values if they exist, or fall back on
  // defaults. userOptionsDict will return undefined if the key isn't found, in
  // which case the || chooses the defaultOptionsDict version.
  let options: Options = {
    font: userOptionsDict['fontIs'] || defaultOptionsDict['fontIs'],
    size: userOptionsDict['sizeIs'] || defaultOptionsDict['sizeIs'],
    textColor: userOptionsDict['textColorIs'] || defaultOptionsDict['textColorIs'],
    linkColor: userOptionsDict['linkColorIs'] || defaultOptionsDict['linkColorIs'],
    backgroundColor: userOptionsDict['backgroundColorIs'] || defaultOptionsDict['backgroundColorIs'],
    // these next strings get checked so we can assert them into values here
    showIndexWith: (userOptionsDict['showIndexWith'] || defaultOptionsDict['showIndexWith']) as ShowIndexWithValue,
    sortIndexBy: (userOptionsDict['sortIndexBy'] || defaultOptionsDict['sortIndexBy']) as SortIndexByValue,
    pageURLsBasedOn: (userOptionsDict['pageURLsBasedOn'] || defaultOptionsDict['pageURLsBasedOn']) as PageURLsBasedOnValue,
    outputLocation: (userOptionsDict['outputLocationIs'] || defaultOptionsDict['outputLocationIs']) as Path
  }

  return options
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

// returns whether the option values were valid and possibly a string of the the
// options values that were invalid.
function validOptionsValues(optionsDict: OptionsDict): BooleanWithDetails  {
    let valid: boolean = true
    let invalidValues: string[] = []

    // showIndexWith
    // If the option key is in the dict AND the value isn't in the list of good values
    let okVals = ['dates', 'noDates', 'dont']
    if (('showIndexWith' in optionsDict) && (!okVals.includes(optionsDict['showIndexWith']))) {
      valid = false
      invalidValues.push(`showIndexWith ${optionsDict['showIndexWith']}`)
    }

    // sortIndexBy
    okVals = ['newest', 'oldest', 'filename', 'title']
    if (('sortIndexBy' in optionsDict) && (!okVals.includes(optionsDict['sortIndexBy']))) {
      valid = false
      invalidValues.push(`sortIndexBy ${optionsDict['sortIndexBy']}`)
    }

    // pageURLsBasedOn
    okVals = ['title', 'filename', 'date']
    if (('pageURLsBasedOn' in optionsDict) && (!okVals.includes(optionsDict['pageURLsBasedOn']))) {
      valid = false
      invalidValues.push(`pageURLsBasedOn ${optionsDict['pageURLsBasedOn']}`)
    }

    let details: string | undefined
    if (invalidValues.length == 0) {
      // if there are no invalid values, details is undefined
      details = undefined
    } else {
      details = invalidValues.join(', ')
    }

    return {
      boolean: valid,
      details
    }
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
  const options = createOptions(`./${OPTIONS_FILENAME}`)

  // make pageEntry objects from the text files in the entries directory
  let pageEntries: Entry[] = []
  for (const filepath of fs.readdirSync('./larva/entries').filter(isTxt)) {
    pageEntries.push(makeEntry(`./larva/entries/${filepath}`))
  }

  // set output location for the finished site, and make the directory if needed
  let outputLocation: Path = options.outputLocation
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
function createPage(entry: Entry, outputLocation: Path, _options: Options): void {
  let urlPart: string = entry.filename // FIXME use option to decide

  fs.mkdirSync(`${outputLocation}/${urlPart}`, {recursive: true})
  fs.writeFileSync(`${outputLocation}/${urlPart}/index.html`, renderPage(entry))
}

// Renders an Entry into a Page (html string)
function renderPage(entry: Entry): string {
  // read default page html from defaults folder
  let page: string = fs.readFileSync(path.resolve(__dirname, '../../lib/defaults/imago/page.html')).toString()

  // From replace() documentation: If pattern is a string, only the first occurrence will be replaced.
  // replace keywords in reverse order in the template so the replaced content can't interfere with the process
  page = page.replace(/CONTENT/, entry.content)
  page = page.replace(/DATESTRING/, entry.datestring)
  page = page.replace(/TITLEBODY/, entry.title)
  page = page.replace(/TITLE/, entry.title)

  return page
}

// Creates the homepage by rendering it and outputing the file to the right location
function createHomepage(entry: Entry, outputLocation: Path, pageEntries: Entry[], options: Options): void {
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
      // checks should catch anything else, so no default needed
    }

    // decide from options how to display the index
    //  - with or without dates
    //  - with the proper links
    console.log(pageEntries)
    console.log(pageEntries.sort(sortFunction))
    // FIXME sorting broken
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

function createStylesheet(outputLocation: Path, options: Options) {
  fs.writeFileSync(`${outputLocation}/styles.css`, renderStylesheet(options))
}

function renderStylesheet(options: Options): string {
  // bring in template homepage from defaults folder
  let stylesheet: string = fs.readFileSync(path.resolve(__dirname, '../../lib/defaults/imago/styles.css')).toString()

  // replace keywords in styles template, bottom to top
  // FIXME: options should mabe be an interface? needs work
  stylesheet = stylesheet.replace(/LINKCOLOR/, options.linkColor)
  stylesheet = stylesheet.replace(/BACKGROUNDCOLOR/, options.backgroundColor)
  stylesheet = stylesheet.replace(/TEXTCOLOR/, options.textColor)
  stylesheet = stylesheet.replace(/FONTSIZE/, options.size)
  stylesheet = stylesheet.replace(/FONTFAMILY/, options.font)

  return stylesheet
}
