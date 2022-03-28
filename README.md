# Pupate

[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?)](https://github.com/RichardLitt/standard-readme)

Simple static site generator for text-only blogs that invites code-injection as
an editing tool

## Background

Pupate creates websites with absolutely no frills and barely any features.
Pupate prioritizes your experience writing entries, giving you just enough
control to express yourself through text. If you need more, inject it yourself
by writing some HTML.

1. Write plaintext entries in a simplified, Markdown-like [WYSRDWYG](WYSRDWYG.md
   "What You See Represents Directly What You Get") format
2. Specify display options in a human-readable text file
3. Pupate compiles your text files into a website with an index and a page for
   each entry

Pupate is rock-simple but allows you a lot of creativity when you really need
it. Just write, then watch your ideas emerge fully formed and beautiful.

## Install

```shell
sudo npm install -g pupate
```

Run `puate help` to make sure pupate was installed correctly.

### Updating

```shell
sudo npm update -g pupate
```

## Usage

```
pupate

Commands:
  pupate check   check that the current working directory is a valid
                 Pupate-shaped directory
  pupate spawn   create necessary pupate files in the current working directory
  pupate eclose  build the site in the output directory based on the content of
                 the larva directory

Options:
      --version  Show version number                                   [boolean]
  -o, --output   minimum importance-level of messages to display
          [string] [choices: "ERROR", "WARN", "INFO", "DEBUG"] [default: "INFO"]
  -q, --quiet    run without any output               [boolean] [default: false]
      --help     Show help                                             [boolean]      
```

### Overview

Pupate needs to run in a Pupate-shaped directory. Here is the tree of one such directory:

```
pupate-site
├── larva
│   ├── entries
│   │   └── soup.txt
│   │   └── salad.txt
│   └── homepage.txt
├── options.txt
└── imago
    ├── index.html
    ├── soup
    │   └── index.html
    └── styles.css
```

Inside, there are two directories, `larva/` and `imago/` and an options file. Text files for entries,
plus a homepage file live in `larva/`. Running Pupate
generates a site in `imago/`. (The location where the site is generated can also
be customized.)

### Editing entries

Each entry is a single text file in the `larva/entries/` directory. The first
line in the file is the title. The second line is the date. Then there's a
blank line. All lines after that are the body of the entry. Each entry becomes a
page in the generated site.

```
How I make soup
2021/03/04

This is a post with my soup-making recipe.
First, make the soup.
```

### [Eclosion](https://en.wikipedia.org/wiki/Pupa#Emergence) (Generating a site)

In a Pupate-shaped directory, run `pupate eclose` (or just `pupate`) to generate
css and html in the output directory based on the contents of the `larva/`
directory. Eclosion also generates an RSS file `rss.xml`.

Eclosion deletes all files in the output directory and re-creates them. So don't
store stuff in there. A backup is made to `pupate/.imagobackup/` in case you
did.

### Embellishments

A modified subset of Markdown is available in Pupate to allow embellishing text.
Embellishments in Pupate are designed to make reading and writing un-rendered
text both easy and unambiguous, something Markdown attempts but doesn't quite
nail. Luckily, we have a lot less to deal with here.

(Further reading: [WYSRDWYG][])

  [WYSRDWYG]: /WYSRDWYG.md

Available embellishments are hyperlinks, bold, italic, and text-color. Special characters can be escaped with `\`.

<details><summary>Embellishment details</summary>




<!-- EMBELLISHMENTS TABLE -->

<table><thead><tr>
    <th>Embellishment</th>
    <th>Pupate plaintext</th>
    <th>Generated HTML</th>
    <th>Rendered</th>
  </tr></thead><tbody>
<tr><td>Bold</td><td>
        
```
Chicken soup is
*not* vegetarian.
```

</td><td>
        
```html
Chicken soup is
<b>not</b> vegetarian.
```

</td><td>

Chicken soup is  
**not** vegetarian.
    
</td></tr><tr><td>Italic</td><td>
        
```
Potato soup is
_usually_ cage-free.
```

</td><td>
        
```html
Potato soup is
<i>usually</i> cage-free.
```

</td><td>
        
Potato soup is  
*usually* cage-free.
         
</td></tr><tr><td>Color</td><td>
        
```
First, add
{red}(red)
and
{green}(#00ff00)
peppers.
```

</td><td>
        
```html
First, add
<span style="color: red">red</span>
and
<span style="color: #00ff00">green</span>
peppers.
```

</td><td>

First, add  
red  
and  
green  
peppers.  
(but imagine the text is colored)

</td></tr><tr><td>Links</td><td>
    
```
Check out my
[recipe](https://e.com)
for details.
```

</td><td>

```html
Check out my
<a href="https://e.com/">recipe</a>
for details.
```

</td><td>

Check out my  
[recipe](https://e.com)  
for details.

</td></tr></tbody></table>

<!-- END EMBELLISHMENTS TABLE -->




#### Nesting

All embellishments besides links are allowed to be nested.

</details>

### Options

The `larva/options.txt` file defines options for the whole site. Each line
contains a camel-case option name followed by a space followed by the value for
that option. If an available option is not specified, its default is used.

If you ran `pupate spawn`, an options file comes pre-populated with all
available options set to their defaults.




<!-- OPTIONS TABLE -->

<table><thead><tr>
    <th>Option name</th>
    <th>Description</th>
    <th>Allowed values</th>
    <th>Default value</th>
  </tr></thead><tbody><tr><td>
    
`fontIs`

   </td>
    <td>Font family for all text on the site</td>
    <td>Arbitrary CSS value (only web-safe fonts work I think?)</td>
    <td>
    
`monospace`

</td></tr><tr><td>
    
`sizeIs`

   </td>
    <td>Font size for all text</td>
    <td>Arbitrary CSS value</td>
    <td>
    
`16px`

</td></tr><tr><td>
    
`textColorIs`

   </td>
    <td>Default color for all text</td>
    <td>Arbitrary CSS value</td>
    <td>
    
`initial`

</td></tr><tr><td>
    
`linkColorIs`

   </td>
    <td>Default text color for links</td>
    <td>Arbitrary CSS value</td>
    <td>
    
`revert`

</td></tr><tr><td>
    
`backgroundColorIs`

   </td>
    <td>Background color for all pages</td>
    <td>Arbitrary CSS value</td>
    <td>
    
`initial`

</td></tr><tr><td>
    
`showIndexWith`

   </td><td>How or whether to display the index of pages on the homepage</td><td>
    
* `dates` (display each page's title with its date)
* `noDates` (display each page's title only)
* `dont` (don't display an index of pages. Useful if you'll make your own index)

</td><td>

`dates`

</td></tr><tr><td>
    
`sortIndexBy`

   </td>
    <td>Order in which to sort pages in the index</td>
    <td>
    
* `newest` (sort lexicographically by date, [note: this won't work with most human-readable dates](https://twitter.com/wormplaza/status/1295572138494234624))
* `oldest`
* `filename`
* `title`

</td><td>
    
`newest`

</td></tr><tr><td>
    
`pageURLsBasedOn`

   </td>
    <td>How to derive the URLs for entry pages. (All values are unembellished and sanitized before use in a URL.)</td>
    <td>
    
* `title`
* `filename`
* `date`
    
</td><td>

`filename`

</td></tr><tr><td>

`outputLocationIs`

</td><td>Path at which to generate the site</td>
<td>Valid path string</td><td>

`./imago/`

</td></tr><tr><td>

`RSSBaseURLIs`

</td><td>

The base URL of your site, used by the RSS feed to link to your site and its pages. **Must end in a slash!** For example, if a certain page on your site has the address `https://jerbix.com/crumble-university`, this option should be set to `https://jerbix.com/`. If you don't use the RSS feature you can ignore or delete this option.

</td><td>
    
Valid URL ending in `/`

</td><td>

`https://www.example.com/`

</td></tr></tbody></table>

<!-- END OPTIONS TABLE -->




You can also see an [example options.txt in the example blog](/exampleBlog/options.txt).

## Contributing

PRs accepted! Fixes for existing issues appreciated. Small improvements and tweaks will be considered. New features should probably happen in a fork, unless you convince me ;)

### Developing

1. Clone this repo

2. Install TypeScript stuff if you need it

   ```shell
   sudo apt install node-typescript
   ```

3. Install types

   ```shell
   npm i @types/node
   ```

4. Complile the TypeScript to JavaScript for the first time

   ```shell
   npm run build
   ```

5. Install so you can use the command globally

   ```shell
   sudo npm install -g ./
   ```

6. Run the build script after making changes to any `.ts` file
   
   ```shell
   npm run build
   ```

   This will compile TypeScript files in the `lib/` directory into JavaScript in
   the `dist/` directory. The build script also automatically regenerates the
   example blog to keep it updated with the current source code.

7. Run the tests

   ```shell
   npm run test
   ```

### Publishing a new version to npm

1. `npm run build` to compile TypeScript and build the example blog
2. `npm run test` to make sure tests are passing
3. `npm version (major|minor|patch)` to bump the version number depending on the
   changes
4. `npm publish`
5. `git push --tags`

## See also

* [Markdown](https://daringfireball.net/projects/markdown/)
* [Bloggen](http://www.davisr.me/projects/bloggen/) 

## License

[GPL](/LICENSE)
