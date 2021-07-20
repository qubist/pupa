#!/usr/bin/env node

import * as fs from 'fs'
import * as path from 'path'

import { check, spawn, ecdysis } from '../lib/pupate'
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
