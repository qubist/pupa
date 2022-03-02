#!/usr/bin/env node

import * as fs from 'fs'
import * as path from 'path'

import yargs = require('yargs')

import { check, spawn, eclose } from '../lib/pupate'
import 'colors'

// Print welcome
console.log('Welcome to Pupate!'.blue)

// Check read and write permissions for the pupate Directory
try {
  fs.accessSync(path.resolve(__dirname), fs.constants.R_OK | fs.constants.W_OK);
  // FIXME: check that output location is writeable too?
} catch {
  console.warn("WARNING! Pupate creates and deletes files in the output location, and might not run correctly if it doesn't have with the proper permissions".yellow)
}

// Handle arguments and options
yargs
  .command(
    'check',
    'check that the current working directory is a valid Pupate-shaped directory',
    {},
    function(argv) {
      // Check if directory is Pupate-shaped with param quiet = false
      check(false)
    })
  .command(
    'spawn',
    'create necessary pupate files in the current working directory',
    {},
    function(argv) {
      spawn()
    })
  .command(
    ['eclose'], 
    'build the site in the output directory based on the content of the larva directory',
    {},
    function(argv) {
      eclose()
    })
  .command(
    '*',
    false,
    {},
    function(argv) {
      // No subcommand defaults to eclose
      if (argv._[0] == undefined) {
        eclose()
      } else {
        console.error('Unrecognized subcommand:'.red, argv._[0])
        process.exit(1)
      }
    })
  .help()
  .argv
