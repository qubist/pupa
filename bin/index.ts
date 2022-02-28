#!/usr/bin/env node

import * as fs from 'fs'
import * as path from 'path'

import { check, spawn, eclose } from '../lib/pupate'
import 'colors'

// print welcome
console.log('Welcome to Pupate!'.blue)

// check some permissions
try {
  fs.accessSync(path.resolve(__dirname), fs.constants.R_OK | fs.constants.W_OK);
  // FIXME: check that output location is writeable too?
} catch {
  console.warn('WARNING! Pupate creates and deletes files in the output location, and might not run correctly if it doesn\'t have with the proper permissions'.yellow)
}

let subcommand = process.argv.splice(2)[0]

switch (subcommand) {
  case 'check':
    // Check if directory is Pupate-shaped with param quiet = false
    check(false)
    break
  case 'spawn':
    spawn()
    break
  case undefined:
  case 'eclose':
    eclose()
    break
  default:
    console.error('Unrecognized subcommand:'.red, subcommand)
}
