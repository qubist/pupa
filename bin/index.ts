#!/usr/bin/env node

import * as fs from 'fs'
import * as path from 'path'

import yargs = require('yargs')
import winston = require('winston')
const { combine, timestamp, printf } = winston.format;

import { check, spawn, eclose } from '../lib/pupate'
import 'colors'

// Create logger
export const logger = winston.createLogger({
  transports: [ new winston.transports.Console() ],
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    printf(({ level, message, timestamp }) => {
      // return `[${timestamp}] ${level}: ${message}`
      return message
    })
  ),
  level: 'info',
  silent: false
})

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
    ['check', 'c'],
    'check that the current working directory is a valid Pupate-shaped directory'
  )
  .command(
    ['spawn', 's'],
    'create necessary pupate files in the current working directory'
  )
  .command(
    ['eclose', 'emerge', 'e'], 
    'build the site in the output directory based on the content of the larva directory'
  )
  .command(
    '*',
    false
  )
  .option('o', {
    alias: ['output', 'out', 'loglevel'],
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
  logger.warn("WARNING! Pupate creates and deletes files in the output location, and might not run correctly if it doesn't have with the proper permissions".yellow)
}

let subcommand = argv._[0]
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
    logger.error('Unrecognized subcommand:'.red, subcommand)
    process.exit(1)
}