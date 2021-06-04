#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var pupate = require("../lib/pupate");
var colors = require("colors");
// print welcome
console.log(colors.green(
// returns the random greeting text
pupate.welcome()));
var subcommand = process.argv.splice(2)[0];
switch (subcommand) {
    case 'check':
        pupate.check();
        break;
    case 'spawn':
        pupate.spawn();
        break;
    case undefined:
        pupate.ecdysis();
        break;
    default:
        console.log(colors.red("Unrecognized subcommand \"" + subcommand + "\""));
}
