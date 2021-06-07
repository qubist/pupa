#!/usr/bin/env node

import { check, spawn, ecdysis } from '../lib/pupate'
import * as colors from 'colors'

// print welcome
console.log(colors.green('Welcome to Pupate!'))

let subcommand = process.argv.splice(2)[0]

switch (subcommand) {
  case 'check':
    check()
    break
  case 'spawn':
    spawn()
    break
  case undefined:
  case 'ecdysis':
    ecdysis()
    break
  default:
    console.log(colors.red(`Unrecognized subcommand "${subcommand}"`))
}
