# Pupa

[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

Simple static site generator for text-only blogs that invites code-injection as an editing tool

## Background

## Install

### Requirements

Pupa depends on

* something

Do stuff to install it.

Do something to run it and make sure it's working

## Usage

### Overview

two folders, `larva` and `imago`. text documents go in `larva`, along with some options. Running Pupa generates a site in `imago`

```
├── larva
│   ├── entries
│   │   └── soup.txt
│   ├── homepage.txt
│   └── options.txt
├── imago
    ├── index.html
    ├── soup
    │   └── index.html
    └── styles.css
```

### Editing entries

Each entry is a single text file in the `larva/entries` directory. The first line in the file is the title. The second line is the date. All lines after that are the body of the entry. Each entry becomes a page in the generated site.

```
How I make soup
2021/03/04
This is a post with my meta-soup-making recipe. First, make the soup.
```

### Ecdysis (Generating a site)

Run something to generate CSS and HTML in the `imago` directory based on the contents of the `larva` directory.

### Embellishments

A modified subset of Markdown is available in Pupa to allow embellishing text. Embellishments in Pupa are designed to make reading and writing un-rendered text both easy and unambiguous, something Markdown attempts but doesn't quite nail.

#### Bold
```
Chicken soup is *not* vegetarian.
```

```html
Chicken soup is <strong>not</strong> vegetarian.
```

Chicken soup is **not** vegetarian.

#### Italic
```
Potato soup is _usually_ cage-free.
```

```html
Potato soup is <i>usually</i> cage-free.
```

Potato soup is *usually* cage-free.

#### Color
```
First, add {red}(red) and {green}(#00ff00) apples.
```

```html
First, add <span class="color: red">red</span> and <span class="color: #00ff00">green</span> apples.
```

First, add red and green apples. (but imagine the text is colored)

#### Links
```
Check out my [soup recipe](https://example.com) for details.
```

```html
Check out my <a href="https://example.com/">soup recipe</a> for details.
```

Check out my [soup recipe](https://example.com) for details.

#### Nesting

Embellishments besides links are allowed to be nested.

### Options

`options.txt` defines options for the whole site. Each line contains a one-word option name followed by a space followed by the value for that option. Options, their description, and available values:

* `font`: font family for text on the site
  * arbitrary CSS
* `size`: font size for text
  * arbitrary CSS
* `textColor`: default color for all text
  * arbitrary CSS
* `linkColor`: default color for links
  * arbitrary CSS
* `backgroundColor`: background color for all pages
  * arbitrary CSS
* `index`: how or whether to display the index of site pages
  * `dates` (display each page's title with its date)
  * `noDates` (display each page's title only)
  * `none` (don't display an index of pages, useful if you'll make your own index)
* `sortBy`: order in which to sort pages
  * `newest` (sort lexicographically by date line, [note: this won't work with most human-readable dates](https://twitter.com/wormplaza/status/1295572138494234624))
  * `oldest`
  * `filename`
  * `title`
* `entryURLs`: how to derive the URLs for entry pages
  * `title`
  * `filename`
  * `date`
* `outputLocation`: path at which to generate the site
  * valid path string

## Contributing

PRs aren't currently accepted, as the project is too new. If you'd like to enter into closer collaboration with me on Pupa, feel free to send me an email. If you have an idea or problem, feel free to make an issue or PR, but be prepared for it to be moved past for now.

## License

[GPL](/LICENSE)
