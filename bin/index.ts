#!/usr/bin/env node

import * as fs from 'fs'
import * as path from 'path'

import yargs = require('yargs')

import { check, spawn, eclose } from '../lib/pupate'
import { logger } from '../lib/logger'
import 'colors'


// Handle arguments and options

interface Arguments {
  [x: string]: unknown,
  o: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG',
  q: boolean,
  _: (string | number)[],
  $0: string
}

let argv : Arguments = yargs
 .command(
    ['check'],
    'check that the current working directory is a valid Pupate-shaped directory'
  )
  .command(
    ['spawn'],
    'create necessary pupate files in the current working directory'
  )
  .command(
    ['eclose'], 
    'build the site in the output directory based on the content of the larva directory'
  )
  .command(
    '*',
    false
  )
  .option('o', {
    alias: ['output'],
    choices: ['ERROR', 'WARN', 'INFO', 'DEBUG'] as const,
    coerce: value => { return value.toUpperCase() },
    default: 'INFO',
    describe: 'minimum importance-level of messages to display',
    type: 'string'
  })
  .option('q', {
    alias: ['quiet'],
    describe: 'run without any output',
    default: false,
    type: 'boolean'
  })
  .help()
  .parseSync()

// Set the logging level to the desired option
logger.transports[0].level = argv.o.toLowerCase()
logger.silent = argv.q

// Print welcome
logger.info('Welcome to Pupate!'.blue)

// Check read and write permissions for the pupate Directory
try {
  fs.accessSync(path.resolve(__dirname), fs.constants.R_OK | fs.constants.W_OK);
  // FIXME: check that output location is writeable too?
} catch {
  logger.warn("WARNING! Pupate lacks read and write access to the current working directory. It might not run correctly if it doesn't have the proper permissions.".yellow)
}

let subcommand = argv._[0]

try {

  switch (subcommand) {
    case 'check':
      // Check if directory is pupate-shaped with param loud = true
      check(true)
      break
    case 'spawn':
      spawn()
      break
    case undefined:
    case 'eclose':
      eclose()
      break
    default:
      throw 'Unrecognized subcommand: '.red + `${subcommand}`
  }

} catch (err) {
  // If any error is thrown, log it and exit
  logger.error(err)
  process.exit(1)
}