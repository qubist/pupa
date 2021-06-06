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
        // copy homepage file from lib/defaults/ (where all pupate default files are
        // stored) to the working directory
        fs.copyFileSync(path.resolve(__dirname, "../../lib/defaults/larva/" + HOMEPAGE_FILENAME), "./larva/" + HOMEPAGE_FILENAME);
    }
    if (!fs.existsSync(OPTIONS_FILENAME)) {
        fs.copyFileSync(path.resolve(__dirname, "../../lib/defaults/" + OPTIONS_FILENAME), "./" + OPTIONS_FILENAME);
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
    // check that the options file is formatted right
    if (!validOptionsFormat(optionsList)) {
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
    // FIXME: apply default option values to any options that are undefined
    // check that the values of all the options are resonable
    var result = validOptionsValues(optionsDict);
    if (!result.boolean) {
        throw colors.red("The following values in " + OPTIONS_FILENAME + " were not valid: " + result.details);
    }
    return optionsDict;
}
function validOptionsFormat(optionsList) {
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
// Returns whether the option values were valid and possibly a string of the the
// options values that were invalid.
function validOptionsValues(_options) {
    // FIXME
    // e.g. "sortIndexBy" has to be 'newest' 'oldest' etc.
    // also accept undefined!
    return { boolean: true, details: undefined };
}
function ecdysis() {
    console.log(colors.green('Molting...'));
    // make sure current directory is Pupate-shaped
    check();
    // get user-defined options
    var options = getOptions();
    console.log(options);
    // make pageEntry objects from the text files in the entries directory
    var pageEntries = [];
    for (var _i = 0, _a = fs.readdirSync('./larva/entries').filter(isTxt); _i < _a.length; _i++) {
        var filepath = _a[_i];
        pageEntries.push(makeEntry("./larva/entries/" + filepath));
    }
    // set output location for the finished site
    var outputLocation;
    if (options['outputLocationIs'] == undefined) {
        // default output location is imago directory, level with larva
        outputLocation = './imago';
    }
    else {
        outputLocation = options['outputLocationIs'];
    }
    if (!fs.existsSync(outputLocation)) {
        fs.mkdirSync(outputLocation, { recursive: true });
    }
    // create pages
    for (var _b = 0, pageEntries_1 = pageEntries; _b < pageEntries_1.length; _b++) {
        var pageEntry = pageEntries_1[_b];
        createPage(pageEntry, outputLocation, options);
    }
    // create homepage
    var homepageEntry = makeEntry('./larva/homepage.txt');
    createHomepage(homepageEntry, outputLocation, pageEntries, options);
    // create stylesheet
    createStylesheet(outputLocation, options);
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
// Creates a page by rendering the page and writing it to a file inside the correct folder
function createPage(entry, outputLocation, _options) {
    var urlPart = entry.filename; // FIXME use option to decide
    fs.mkdirSync(outputLocation + "/" + urlPart, { recursive: true });
    fs.writeFileSync(outputLocation + "/" + urlPart + "/index.html", renderPage(entry));
}
// Renders an Entry into a Page (html string)
function renderPage(entry) {
    // read default page html from defaults folder
    var page = fs.readFileSync(path.resolve(__dirname, '../../lib/defaults/imago/page.html')).toString();
    // replace() documentation: If pattern is a string, only the first occurrence will be replaced.
    // replace keywords in reverse order in the template so the replaced content can't interfere with the process
    page = page.replace(/CONTENT/, entry.content);
    page = page.replace(/DATESTRING/, entry.datestring);
    page = page.replace(/TITLEBODY/, entry.title);
    page = page.replace(/TITLE/, entry.title);
    return page;
}
// Creates the homepage by rendering it and outputing the file to the right location
function createHomepage(entry, outputLocation, pageEntries, options) {
    fs.writeFileSync(outputLocation + "/index.html", renderHomepage(entry, pageEntries, options));
    // FIXME: BUG: doesn't overwrite old files. Delete contents of destination first? Find out how to overwrite?
}
// Renders an entry into the homepage (html string), ignoring datestring,
// and creating an index from the list of page entries
function renderHomepage(entry, pageEntries, options) {
    // bring in template homepage from defaults folder
    var homepage = fs.readFileSync(path.resolve(__dirname, '../../lib/defaults/imago/homepage.html')).toString();
    // create index from list of page entries
    var index = '';
    if (options['showIndexWith'] != 'dont') { // if we should actually make an index
        // decide from options how to sort the index
        var sortFunction = void 0;
        switch (options['sortIndexBy']) {
            case 'newest':
                sortFunction = function (a, b) { return a.datestring.localeCompare(b.datestring); };
                break;
            case 'oldest':
                sortFunction = function (a, b) { return -1 * a.datestring.localeCompare(b.datestring); };
                break;
            case 'filename':
                sortFunction = function (a, b) { return a.filename.localeCompare(b.filename); };
                break;
            case 'title':
                sortFunction = function (a, b) { return a.title.localeCompare(b.title); };
                break;
            // validOptionsValues should catch anything else, so no default needed
        }
        // decide from options how to display the index
        //  - with or without dates
        //  - with the proper links
        console.log(pageEntries);
        console.log(pageEntries.sort(sortFunction));
        for (var _i = 0, _a = pageEntries.sort(sortFunction); _i < _a.length; _i++) {
            var entry_1 = _a[_i];
            // get the link that will lead to the entry's page
            var entryLink = void 0;
            if (options['entryURLsBasedOn'] == 'title') {
                entryLink = entry_1.title;
            }
            else {
                entryLink = entry_1.filename;
            }
            if (options['showIndexWith'] == 'dates') {
                index += entry_1.datestring + " <a href=\"" + entryLink + "\">" + entry_1.title + "</a>\n";
            }
            else if (options['showIndexWith'] == 'noDates') {
                index += "<a href=\"" + entryLink + "\">" + entry_1.title + "</a>\n";
            }
            else {
                throw colors.red('Unknown value for showIndexWith option');
            }
        }
    }
    // replace keywords in homepage template, bottom to top
    homepage = homepage.replace(/INDEX/, index);
    homepage = homepage.replace(/CONTENT/, entry.content);
    homepage = homepage.replace(/TITLEBODY/, entry.title);
    homepage = homepage.replace(/TITLE/, entry.title);
    return homepage;
}
function createStylesheet(outputLocation, options) {
    fs.writeFileSync(outputLocation + "/styles.css", renderStylesheet(outputLocation, options));
}
function renderStylesheet(outputLocation, options) {
    // bring in template homepage from defaults folder
    var stylesheet = fs.readFileSync(path.resolve(__dirname, '../../lib/defaults/imago/styles.css')).toString();
    // replace keywords in styles template, bottom to top
    // FIXME: options should mabe be an interface? needs work
    stylesheet = stylesheet.replace(/LINKCOLOR/, options['linkColorIs']);
    stylesheet = stylesheet.replace(/BACKGROUNDCOLOR/, options['backgroundColorIs']);
    stylesheet = stylesheet.replace(/TEXTCOLOR/, options['textColorIs']);
    stylesheet = stylesheet.replace(/FONTSIZE/, options['sizeIs']);
    stylesheet = stylesheet.replace(/FONTFAMILY/, options['fontIs']);
    return stylesheet;
}
