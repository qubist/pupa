"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ecdysis = exports.check = exports.spawn = exports.welcome = void 0;
var fs = require("fs");
var colors = require("colors");
var path = require("path");
// Return a welcome message
function welcome() {
    return 'Welcome to Pupa!';
}
exports.welcome = welcome;
// Spawns a new valid Pupa directory, writing files and directories that don't exist.
function spawn() {
    console.log(colors.green('Spawning...'));
    if (!fs.existsSync('larva')) {
        fs.mkdirSync('larva');
    }
    if (!fs.existsSync('larva/entries')) {
        fs.mkdirSync('larva/entries');
    }
    if (!fs.existsSync('larva/homepage.txt')) {
        fs.copyFileSync(path.resolve(__dirname, './defaults/larva/homepage.txt'), './larva/homepage.txt');
    }
    if (!fs.existsSync('options.txt')) {
        fs.copyFileSync(path.resolve(__dirname, './defaults/options.txt'), './options.txt');
    }
    console.log(colors.green('Spawning finished!'));
}
exports.spawn = spawn;
function check() {
    if (!isPupaDir()) {
        throw colors.red('Not a Pupa-shaped directory');
    }
}
exports.check = check;
function ecdysis() {
    console.log(colors.green('Molting...'));
    check();
    var options = getOptions();
    console.log(options);
}
exports.ecdysis = ecdysis;
function isPupaDir() {
    var requiredPaths = ['larva', 'larva/entries', 'larva/homepage.txt', 'options.txt',];
    var ok = true;
    for (var _i = 0, requiredPaths_1 = requiredPaths; _i < requiredPaths_1.length; _i++) {
        var path_1 = requiredPaths_1[_i];
        if (!fs.existsSync(path_1)) {
            ok = false;
            console.warn(colors.yellow('Missing path:'), path_1);
        }
    }
    return ok;
}
// Returns a dictionary of option-name: value pairs.
function getOptions() {
    var optionsList = fs.readFileSync('options.txt').toString().split(/\r?\n/);
    if (!validOptions(optionsList)) {
        throw colors.red('Options file not formatted properly');
    }
    var optionsDict = {};
    for (var _i = 0, optionsList_1 = optionsList; _i < optionsList_1.length; _i++) {
        var o = optionsList_1[_i];
        // Ignore whitespace or empty lines
        if (/^\s*$/.test(o)) {
            continue;
        }
        // no value for standalone option names
        if (/^[A-z]+$/.test(o)) {
            optionsDict[o] = undefined;
            continue;
        }
        optionsDict[o.substr(0, o.indexOf(' '))] = o.substr(o.indexOf(' ') + 1);
    }
    return optionsDict;
}
function validOptions(optionsList) {
    for (var _i = 0, optionsList_2 = optionsList; _i < optionsList_2.length; _i++) {
        var o = optionsList_2[_i];
        // regex: each line must be either: an option name with any amount of
        // whitespace after, or an option name with a space and then anything after
        // that, or a blank line.
        if (!/^[A-z]+\W*$|^[A-z]+ .+$|^\s*$/.test(o)) {
            return false;
        }
    }
    return true;
}
