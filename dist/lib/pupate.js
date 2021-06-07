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
// Inspects an options file and returns a dictionary of option-name:value pairs,
// as long as the file is formatted right. Dictionary won't have entries for
// options not listed in the file or without a value.
function getOptionsDict(filename) {
    // get list of lines from file
    var optionsList = fs.readFileSync(filename).toString().split(/\r?\n/);
    // check that the options file is formatted right
    if (!validOptionsFormat(optionsList)) {
        throw colors.red("Options file \"" + filename + "\" not formatted properly");
    }
    var optionsDict = {};
    for (var _i = 0, optionsList_1 = optionsList; _i < optionsList_1.length; _i++) {
        var o = optionsList_1[_i];
        // ignore whitespace or empty lines and ignore standalone option names
        if (!/^\s*$/.test(o) && !/^[A-z]+$/.test(o.trim())) {
            var optionName = o.substr(0, o.indexOf(' '));
            var optionValue = o.substr(o.indexOf(' ') + 1);
            optionsDict[optionName] = optionValue;
        }
    }
    // check that options have resonable values
    var _a = validOptionsValues(optionsDict), boolean = _a.boolean, details = _a.details;
    if (!boolean) {
        throw colors.red("The following options in " + filename + " were not valid: " + details);
    }
    return optionsDict;
}
function createOptions(optionsFile) {
    // we know user values are resonable at this point. Get them.
    var userOptionsDict = getOptionsDict(optionsFile);
    var defaultOptionsDict = getOptionsDict(path.resolve(__dirname, "../../lib/defaults/" + OPTIONS_FILENAME));
    // fill out options with user defined values if they exist, or fall back on
    // defaults. userOptionsDict will return undefined if the key isn't found, in
    // which case the || chooses the defaultOptionsDict version.
    var options = {
        font: userOptionsDict['fontIs'] || defaultOptionsDict['fontIs'],
        size: userOptionsDict['sizeIs'] || defaultOptionsDict['sizeIs'],
        textColor: userOptionsDict['textColorIs'] || defaultOptionsDict['textColorIs'],
        linkColor: userOptionsDict['linkColorIs'] || defaultOptionsDict['linkColorIs'],
        backgroundColor: userOptionsDict['backgroundColorIs'] || defaultOptionsDict['backgroundColorIs'],
        // these next strings get checked so we can assert them into values here
        showIndexWith: (userOptionsDict['showIndexWith'] || defaultOptionsDict['showIndexWith']),
        sortIndexBy: (userOptionsDict['sortIndexBy'] || defaultOptionsDict['sortIndexBy']),
        pageURLsBasedOn: (userOptionsDict['pageURLsBasedOn'] || defaultOptionsDict['pageURLsBasedOn']),
        outputLocation: (userOptionsDict['outputLocationIs'] || defaultOptionsDict['outputLocationIs'])
    };
    return options;
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
// returns whether the option values were valid and possibly a string of the the
// options values that were invalid.
function validOptionsValues(optionsDict) {
    var valid = true;
    var invalidValues = [];
    // showIndexWith
    // If the option key is in the dict AND the value isn't in the list of good values
    var okVals = ['dates', 'noDates', 'dont'];
    if (('showIndexWith' in optionsDict) && (!okVals.includes(optionsDict['showIndexWith']))) {
        valid = false;
        invalidValues.push("showIndexWith " + optionsDict['showIndexWith']);
    }
    // sortIndexBy
    okVals = ['newest', 'oldest', 'filename', 'title'];
    if (('sortIndexBy' in optionsDict) && (!okVals.includes(optionsDict['sortIndexBy']))) {
        valid = false;
        invalidValues.push("sortIndexBy " + optionsDict['sortIndexBy']);
    }
    // pageURLsBasedOn
    okVals = ['title', 'filename', 'date'];
    if (('pageURLsBasedOn' in optionsDict) && (!okVals.includes(optionsDict['pageURLsBasedOn']))) {
        valid = false;
        invalidValues.push("pageURLsBasedOn " + optionsDict['pageURLsBasedOn']);
    }
    var details;
    if (invalidValues.length == 0) {
        // if there are no invalid values, details is undefined
        details = undefined;
    }
    else {
        details = invalidValues.join(', ');
    }
    return {
        boolean: valid,
        details: details
    };
}
function ecdysis() {
    console.log(colors.green('Molting...'));
    // make sure current directory is Pupate-shaped
    check();
    // get user-defined options
    var options = createOptions("./" + OPTIONS_FILENAME);
    // make pageEntry objects from the text files in the entries directory
    var pageEntries = [];
    for (var _i = 0, _a = fs.readdirSync('./larva/entries').filter(isTxt); _i < _a.length; _i++) {
        var filepath = _a[_i];
        pageEntries.push(makeEntry("./larva/entries/" + filepath));
    }
    // set output location for the finished site, and make the directory if needed
    var outputLocation = options.outputLocation;
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
    // From replace() documentation: If pattern is a string, only the first occurrence will be replaced.
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
}
// Renders an entry into the homepage (html string), ignoring datestring,
// and creating an index from the list of page entries
function renderHomepage(entry, pageEntries, options) {
    // bring in template homepage from defaults folder
    var homepage = fs.readFileSync(path.resolve(__dirname, '../../lib/defaults/imago/homepage.html')).toString();
    // create index from list of page entries
    var index = '';
    if (options.showIndexWith != 'dont') { // if we should actually make an index
        // decide from options how to sort the index
        var sortFunction = void 0;
        switch (options.sortIndexBy) {
            case 'newest':
                sortFunction = function (a, b) { return a.datestring.localeCompare(b.datestring); };
                break;
            case 'oldest':
                sortFunction = function (a, b) { return -1 * a.datestring.localeCompare(b.datestring); }; // FIXME
                break;
            case 'filename':
                sortFunction = function (a, b) { return a.filename.localeCompare(b.filename); };
                break;
            case 'title':
                sortFunction = function (a, b) { return a.title.localeCompare(b.title); };
                break;
            // checks should catch anything else, so no default needed
        }
        // decide from options how to display the index
        //  - with or without dates
        //  - with the proper links
        console.log(pageEntries);
        console.log(pageEntries.sort(sortFunction));
        // FIXME sorting broken
        for (var _i = 0, _a = pageEntries.sort(sortFunction); _i < _a.length; _i++) {
            var entry_1 = _a[_i];
            // get the link that will lead to the entry's page
            var entryLink = void 0;
            switch (options.pageURLsBasedOn) {
                case 'title':
                    entryLink = entry_1.title;
                    break;
                case 'filename':
                    entryLink = entry_1.filename;
                    break;
                case 'date':
                    entryLink = entry_1.datestring;
                    break;
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
    fs.writeFileSync(outputLocation + "/styles.css", renderStylesheet(options));
}
function renderStylesheet(options) {
    // bring in template homepage from defaults folder
    var stylesheet = fs.readFileSync(path.resolve(__dirname, '../../lib/defaults/imago/styles.css')).toString();
    // replace keywords in styles template, bottom to top
    // FIXME: options should mabe be an interface? needs work
    stylesheet = stylesheet.replace(/LINKCOLOR/, options.linkColor);
    stylesheet = stylesheet.replace(/BACKGROUNDCOLOR/, options.backgroundColor);
    stylesheet = stylesheet.replace(/TEXTCOLOR/, options.textColor);
    stylesheet = stylesheet.replace(/FONTSIZE/, options.size);
    stylesheet = stylesheet.replace(/FONTFAMILY/, options.font);
    return stylesheet;
}
