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
    fs.copyFileSync(path.resolve(__dirname, `./defaults/larva/${HOMEPAGE_FILENAME}`), `./larva/${HOMEPAGE_FILENAME}`)
  }
  if (!fs.existsSync(OPTIONS_FILENAME)) {
    fs.copyFileSync(path.resolve(__dirname, `./defaults/${OPTIONS_FILENAME}`), `./${OPTIONS_FILENAME}`)
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
  if (!validOptions(optionsList)) {
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
  return optionsDict
}

function validOptions(optionsList: string[]): boolean {
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

  // make entry objects from the text files in the entries directory
  let entries: Entry[] = []
  for (const filepath of fs.readdirSync('./larva/entries').filter(isTxt)) {
    entries.push(makeEntry(`./larva/entries/${filepath}`))
  }

  let outputLocation: string

  // default output location is imago directory, level with larva
  if (options['outputLocationIs'] == undefined) {
    outputLocation = './imago'
  } else {
    outputLocation = options['outputLocationIs']
  }

  if (!fs.existsSync(outputLocation)) {
    fs.mkdirSync(outputLocation, {recursive: true})
  }

  // create homepage
  fs.writeFileSync(`${outputLocation}/index.html`, renderEntry(makeEntry('./larva/homepage.txt')))

  // create pages
  for (const entry of entries) {
    createPage(entry, outputLocation)
  }
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

function createPage(entry: Entry, path: string): void {
  let urlPart: string = entry.filename
  fs.mkdirSync(`${path}/${urlPart}`, {recursive: true})
  fs.writeFileSync(`${path}/${urlPart}/index.html`, renderEntry(entry))
}

function renderEntry(entry: Entry): string {
  console.log(entry.content)
  return `Rendered entry: ${entry.title}, date: ${entry.datestring}\r\ncontent: ${entry.content} !! :) :)`
  // FIXME
}
