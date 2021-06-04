#!/usr/bin/env node

import * as pupate from '../lib/pupate'
import * as colors from 'colors'

// print welcome
console.log(
  colors.green(
    // returns the random greeting text
    pupate.welcome()
  )
)

let subcommand = process.argv.splice(2)[0]

switch (subcommand) {
  case 'check':
    pupate.check()
    break
  case 'spawn':
    pupate.spawn()
    break
  case undefined:
    pupate.ecdysis()
    break
  default:
    console.log(colors.red(`Unrecognized subcommand "${subcommand}"`))
}
