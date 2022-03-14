import * as fs from 'fs'
import 'colors'
import * as path from 'path'

import { OPTIONS_FILENAME } from './consts'

type OptionsDict = Record<string, string>

// Inspects an options file and returns a dictionary of option-name:value pairs,
// as long as the file is formatted right. Dictionary won't have entries for
// options not listed in the file or without a value.
function getOptionsDict(filename: string): OptionsDict {
  // Get list of lines from file
  let optionsList: string[] = fs.readFileSync(filename).toString().split(/\r?\n/)

  // Check that the options file is formatted right
  if (!validOptionsFormat(optionsList)) {
    throw `Options file not formatted properly: ${filename.reset}`.red
  }

  let optionsDict: Record<string, string> = {}
  for (let o of optionsList) {
    // Ignore whitespace or empty lines and ignore standalone option names
    if (!/^\s*$/.test(o) && !/^[A-z]+$/.test(o.trim())) {
      let optionName: string = o.substr(0,o.indexOf(' '))
      let optionValue: string = o.substr(o.indexOf(' ')+1)
      optionsDict[optionName] = optionValue
    }
  }

  // Check that options have resonable values
  var { boolean, maybeDetails } = validOptionsValues(optionsDict)
  if (!boolean) {
      let details: string = maybeDetails as string
      throw 'The following options in '.red + filename.reset + ' were not valid: '.red + details.reset + " Check the documentation for each option's allowed values.".red
  }

  return optionsDict
}

type CSSValue = string
type ShowIndexWithValue = 'dates' | 'noDates' | 'dont'
type SortIndexByValue = 'newest' | 'oldest' | 'filename' | 'title'
export type PageURLsBasedOnValue = 'title' | 'filename' | 'date'
type URLValue = string

export interface Options {
    font: CSSValue,
    size: CSSValue,
    textColor: CSSValue,
    linkColor: CSSValue,
    backgroundColor: CSSValue,
    showIndexWith: ShowIndexWithValue,
    sortIndexBy: SortIndexByValue,
    pageURLsBasedOn: PageURLsBasedOnValue,
    outputLocation: string,
    RSSBaseURL: URLValue,
}

export function createOptions(optionsFile: string): Options {
  // We know user values are resonable at this point. Get them.
  let userOptionsDict = getOptionsDict(optionsFile)
  let defaultOptionsDict = getOptionsDict(path.resolve(__dirname, `../../defaults/${OPTIONS_FILENAME}`))

  // Fill out options with user defined values if they exist, or fall back on
  // defaults. userOptionsDict will return undefined if the key isn't found, in
  // which case the || chooses the defaultOptionsDict version.
  let options: Options = {
    font: userOptionsDict['fontIs'] || defaultOptionsDict['fontIs'],
    size: userOptionsDict['sizeIs'] || defaultOptionsDict['sizeIs'],
    textColor: userOptionsDict['textColorIs'] || defaultOptionsDict['textColorIs'],
    linkColor: userOptionsDict['linkColorIs'] || defaultOptionsDict['linkColorIs'],
    backgroundColor: userOptionsDict['backgroundColorIs'] || defaultOptionsDict['backgroundColorIs'],
    RSSBaseURL: userOptionsDict['RSSBaseURLIs'] || defaultOptionsDict['RSSBaseURLIs'],
    // these next strings are checked by validOptionsValues, so we can safely
    // use type assertion here
    showIndexWith: (userOptionsDict['showIndexWith'] || defaultOptionsDict['showIndexWith']) as ShowIndexWithValue,
    sortIndexBy: (userOptionsDict['sortIndexBy'] || defaultOptionsDict['sortIndexBy']) as SortIndexByValue,
    pageURLsBasedOn: (userOptionsDict['pageURLsBasedOn'] || defaultOptionsDict['pageURLsBasedOn']) as PageURLsBasedOnValue,
    outputLocation: (userOptionsDict['outputLocationIs'] || defaultOptionsDict['outputLocationIs']) as string
  }

  return options
}

function validOptionsFormat(optionsList: string[]): boolean {
  for (const o of optionsList) {
    // regex: each line must be either: an option name with any amount of
    // whitespace after, or an option name with a space and then anything after
    // that, or a blank line.
    if (!/^[A-z]+\s*$|^[A-z]+ .+$|^\s*$/.test(o)) {
      return false
    }
  }
  return true
}

interface BooleanWithDetails {
  boolean: boolean,
  maybeDetails: string | undefined
}

// Returns whether the option values were valid and possibly a string of the the
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

    // RSSBaseURL must end in slash
    if (('RSSBaseURLIs' in optionsDict) && (!/\/$/.test(optionsDict['RSSBaseURLIs']))) {
      valid = false
      invalidValues.push(`RSSBaseURLIs ${optionsDict['RSSBaseURLIs']}`)
    }

    let maybeDetails: string | undefined
    if (invalidValues.length == 0) {
      // If there are no invalid values, details is undefined
      maybeDetails = undefined
    } else {
      maybeDetails = invalidValues.join(', ')
    }

    return {
      boolean: valid,
      maybeDetails
    }
}
