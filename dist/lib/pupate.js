"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ecdysis = exports.check = exports.spawn = exports.welcome = void 0;
var fs = require("fs");
var colors = require("colors");
var path = require("path");
var OPTIONS_FILENAME = 'options.txt';
var HOMEPAGE_FILENAME = 'homepage.txt';
// Return a welcome message
function welcome() {
    return 'Welcome to Pupate!';
}
exports.welcome = welcome;
// Spawns the contents of a valid Pupate directory, writing files and directories that don't exist.
function spawn() {
    console.log(colors.green('Spawning...'));
    if (!fs.existsSync('larva')) {
        fs.mkdirSync('larva');
    }
    if (!fs.existsSync('larva/entries')) {
        fs.mkdirSync('larva/entries');
    }
    if (!fs.existsSync("larva/" + HOMEPAGE_FILENAME)) {
        fs.copyFileSync(path.resolve(__dirname, "./defaults/larva/" + HOMEPAGE_FILENAME), "./larva/" + HOMEPAGE_FILENAME);
    }
    if (!fs.existsSync(OPTIONS_FILENAME)) {
        fs.copyFileSync(path.resolve(__dirname, "./defaults/" + OPTIONS_FILENAME), "./" + OPTIONS_FILENAME);
    }
    console.log(colors.green('Spawning finished!'));
}
exports.spawn = spawn;
function check() {
    if (!isPupateDir()) {
        throw colors.red('Not a Pupate-shaped directory');
    }
}
exports.check = check;
function isPupateDir() {
    var requiredPaths = ['larva', 'larva/entries', 'larva/homepage.txt', OPTIONS_FILENAME,];
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
    var optionsList = fs.readFileSync(OPTIONS_FILENAME).toString().split(/\r?\n/);
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
        if (/^[A-z]+$/.test(o.trim())) {
            optionsDict[o.trim()] = undefined;
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
function ecdysis() {
    console.log(colors.green('Molting...'));
    // make sure current directory is Pupate-shaped
    check();
    // get user-defined options
    var options = getOptions();
    console.log(options);
    // make entry objects from the text files in the entries directory
    var entries = [];
    for (var _i = 0, _a = fs.readdirSync('./larva/entries').filter(isTxt); _i < _a.length; _i++) {
        var filepath = _a[_i];
        entries.push(makeEntry("./larva/entries/" + filepath));
    }
    var outputLocation;
    // default output location is imago directory, level with larva
    if (options['outputLocationIs'] == undefined) {
        outputLocation = './imago';
    }
    else {
        outputLocation = options['outputLocationIs'];
    }
    if (!fs.existsSync(outputLocation)) {
        fs.mkdirSync(outputLocation, { recursive: true });
    }
    // create homepage
    fs.writeFileSync(outputLocation + "/index.html", renderEntry(makeEntry('./larva/homepage.txt')));
    // create pages
    for (var _b = 0, entries_1 = entries; _b < entries_1.length; _b++) {
        var entry = entries_1[_b];
        createPage(entry, outputLocation);
    }
}
exports.ecdysis = ecdysis;
function isTxt(filepath) {
    return filepath.endsWith('.txt');
}
function makeEntry(path) {
    var file = fs.readFileSync(path);
    var lines = file.toString().split(/\r?\n/);
    // final filename in path, without extension
    var filename = path.split('/').slice(-1)[0].split('.').slice(0, 1)[0];
    return {
        filename: filename,
        title: lines[0],
        datestring: lines[1],
        content: lines.slice(2).join('\n') // all lines after that are content
    };
}
function createPage(entry, path) {
    var urlPart = entry.filename;
    fs.mkdirSync(path + "/" + urlPart, { recursive: true });
    fs.writeFileSync(path + "/" + urlPart + "/index.html", renderEntry(entry));
}
function renderEntry(entry) {
    console.log(entry.content);
    return "Rendered entry: " + entry.title + ", date: " + entry.datestring + "\r\ncontent: " + entry.content + " !! :) :)";
    // FIXME
}
