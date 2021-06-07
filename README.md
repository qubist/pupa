# Pupate

[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

Simple static site generator for text-only blogs that invites code-injection as an editing tool

## Background

## Install

### Requirements

Pupate depends on

* something

Do stuff to install it.

Do something to run Pupate and make sure it's working

## Usage

### Overview

two folders, `larva` and `imago`. text documents go in `larva`, along with some options. Running Pupate generates a site in `imago`

```
pupate
├── larva
│   ├── entries
│   │   └── soup.txt
│   ├── homepage.txt
│   └── options.txt
└── imago
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

A modified subset of Markdown is available in Pupate to allow embellishing text. Embellishments in Pupate are designed to make reading and writing un-rendered text both easy and unambiguous, something Markdown attempts but doesn't quite nail. Luckily, we have a lot less to deal with here.

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

All embellishments besides links are allowed to be nested.

### Options

`larva/options.txt` defines options for the whole site. Each line contains a one-word option name followed by a space followed by the value for that option. Here are all the options, their description, and available values:

* `fontIs`: font family for text on the site
  * arbitrary CSS
* `sizeIs`: font size for text
  * arbitrary CSS
* `textColorIs`: default color for all text
  * arbitrary CSS
* `linkColorIs`: default color for links
  * arbitrary CSS
* `backgroundColorIs`: background color for all pages
  * arbitrary CSS
* `showIndexWith`: how or whether to display the index of site pages
  * `dates` (display each page's title with its date)
  * `noDates` (display each page's title only)
  * `dont` (don't display an index of pages, useful if you'll make your own index)
* `sortIndexBy`: order in which to sort pages in the index
  * `newest` (sort lexicographically by date line, [note: this won't work with most human-readable dates](https://twitter.com/wormplaza/status/1295572138494234624))
  * `oldest`
  * `filename`
  * `title`
* `pageURLsBasedOn`: how to derive the URLs for entry pages
  * `title`
  * `filename`
  * `date`
* `outputLocationIs`: path at which to generate the site. Defaults to `./imago`.
  * valid path string

You can also check out an [example options.txt in the example blog](example blog/options.txt).

## Contributing

PRs aren't currently accepted, as the project is too new. If you'd like to enter into closer collaboration with me on Pupate, feel free to send me an email. If you have an idea or problem, feel free to make an issue or PR, but be prepared for it to be moved past for now.

## License

[GPL](/LICENSE)
