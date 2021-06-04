import * as fs from 'fs'
import * as colors from 'colors'
import * as path from 'path'

// Return a welcome message
export function welcome() {
  return 'Welcome to Pupa!'
}

// Spawns a new valid Pupa directory, writing files and directories that don't exist.
export function spawn() {
  console.log(colors.green('Spawning...'))
  if (!fs.existsSync('larva')) {
    fs.mkdirSync('larva')
  }
  if (!fs.existsSync('larva/entries')) {
    fs.mkdirSync('larva/entries')
  }
  if (!fs.existsSync('larva/homepage.txt')) {
    fs.copyFileSync(path.resolve(__dirname, './defaults/larva/homepage.txt'), './larva/homepage.txt')
  }
  if (!fs.existsSync('options.txt')) {
    fs.copyFileSync(path.resolve(__dirname, './defaults/options.txt'), './options.txt')
  }

  console.log(colors.green('Spawning finished!'))
}

export function check() {
  if (!isPupaDir()) {
    throw colors.red('Not a Pupa-shaped directory')
  }
}

export function ecdysis() {
  console.log(colors.green('Molting...'))
  check()
  const options = getOptions()
  console.log(options)
}

function isPupaDir(): boolean {
  let requiredPaths = ['larva', 'larva/entries', 'larva/homepage.txt', 'options.txt', ]
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
  let optionsList: string[] = fs.readFileSync('options.txt').toString().split(/\r?\n/)
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
    if (/^[A-z]+$/.test(o)) {
      optionsDict[o] = undefined
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
