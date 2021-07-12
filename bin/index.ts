#!/usr/bin/env node

import { check, spawn, ecdysis } from '../lib/pupate'
import 'colors'

// print welcome
console.log('Welcome to Pupate!'.blue)

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
    console.error('Unrecognized subcommand:'.red, subcommand)
}
