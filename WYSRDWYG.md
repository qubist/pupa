WYSRDWYG
========

**W**hat **Y**ou **S**ee **R**epresents **D**irectly **W**hat **Y**ou **G**et

History: Markdown's fall from readable glory
--------

According to [its creator John Gruber][1], "the overriding design goal for
Markdown’s formatting syntax is to make it as readable as possible". Which, when
it was created in 2004 was a goal it was suceeding at. But it's now 202n, and
Markdown is no longer the uber-readable syntax it was introduced as.

  [1]: https://daringfireball.net/projects/markdown/

Which is OK, because Markdown has changed. John Gruber introduced Markdown to
the world as a "text-to-HTML conversion tool for web writers", with "the format
of plaintext email" being "the single biggest source of inspiration for
Markdown’s syntax". This was a tool for writers, not necessarily coders, so they
could use a format they were already familiar with (with perhaps a few
formalizations thrown in) to write text which could be converted to HTML and
rendered on a website with whatever style their website already used to render
pages.

So Markdown _needed_ to be readable. And it was.

Look at John Gruber's use of Markdown from back then (unrendered)

```
Download
--------

[Markdown 1.0.1][dl] (18 KB) -- 17 Dec 2004

[dl]: http://daringfireball.net/projects/downloads/Markdown_1.0.1.zip

Introduction
------------

Markdown is a text-to-HTML conversion tool for web writers.

See the [Syntax][] page for details pertaining to
Markdown's formatting syntax. You can try it out, right now, using the
online [Dingus][].

  [syntax]: /projects/markdown/syntax
  [dingus]: /projects/markdown/dingus

The overriding design goal for Markdown's formatting syntax is to make
it as readable as possible.

Installation and Requirements <a id="install" />
-----------------------------

### Movable Type ###

Markdown works with Movable Type version 2.6 or later (including
Movable Type 3.0).

1.  Copy the "Markdown.pl" file into your Movable Type "plugins"
	directory.

2.  Once installed, Markdown will appear as an option in Movable Type's
	Text Formatting pop-up menu.
```
(abridged by me, [source][2])

  [2]: https://daringfireball.net/projects/markdown/index.text

Text is hard-wrapped after ~70 columns (and unwrapped during rendering).
Headings are underlined with a row of hyphens. Subheadings are surrounded on
both sides with `#`s. Links are created with references, and the URLs come after
the paragraph of text has finished. These are all features that Markdown still
supports—They haven't gone anywhere. But much more common now is to let ones
text editor soft-wrap lines, to create headings with just a single group of `#`s
at the start of the line, and to create links which include the URL inline using
`[]()`: all pratices that reduce readability and take unrendered markdown steps
further from that original vision of plaintext email format. Here's what that
same text might look like nowdays:

```
## Download

[Markdown 1.0.1](http://daringfireball.net/projects/downloads/Markdown_1.0.1.zip) (18 KB) -- 17 Dec 2004

## Introduction

Markdown is a text-to-HTML conversion tool for web writers.

See the [Syntax](/projects/markdown/syntax) page for details pertaining to Markdown's formatting syntax. You can try it out, right now, using the online [Dingus](/projects/markdown/dingus).

The overriding design goal for Markdown's formatting syntax is to make it as readable as possible.

## Installation and Requirements <a id="install" />

### Movable Type

Markdown works with Movable Type version 2.6 or later (including Movable Type 3.0).

1. Copy the "Markdown.pl" file into your Movable Type "plugins" directory.

1. Once installed, Markdown will appear as an option in Movable Type's Text Formatting pop-up menu.
```

I'm not shouting "Bring back the old ways!!", because Markdown has changed.
Now I see it used not by "web writers" but by programmers already capable of
handling abstractions and keeping a mental model of the result of their typing.
And Markdown does not so often need to be read unrendered, since we now have
good, sometimes live, Markdown previewing built into editors. Also, the style
that Markdown is rendered into seems to have settled comfortably into a
pseudo-standard: black text on a white background, code in a monospace font in a
box, headings getting larger and bolder. The standardization of rendering in
modern Markdown is a reversal of the memory of a standard Markdown Syntax which
was then converted to HTML to be rendered every-which-way.

Because of a shifting use-case and userbase, a shrinking need to read plaintext
versions of writings, and a more standard rendering style, Markdown's decreasing
readability isn't such a problem for coders writing Readmes or docs.

But what about if you _are_ a web writer?

Fixing the Markdown problem for the Web Writer
--------

Markdown has other use-cases than by programmers for software-related writing.
Think about the Reddit user writing a comment with Markdown, or the Jekyll user
writing a new page for their site. For these people, Markdown's slip from
readability is a real problem that affects their experience writing, too. So
what are the important aspects of an HTML-renderable plaintext writing
experience for regular people?

### But first, a proverb ###

> To write successfully, writers need to constantly mentally compile What They
> See into What They'll Get. The easier the Syntax makes this task, the less
> friction for the writer.

### Readability ###

Writing is reading.

A writer needs to see their written thoughts clearly while writing, especially
when it comes time to refine them. Interrupting the writing with URLs fills the
writer's mind with details and with the task of mentally generating What They'll
Get. A writer whose mind is filled and busy won't be able to read what they've
written as clearly. A writer needs to see their written thoughts clearly to
write.

Readability is writability.

### Only one way to do things ###

We are trying to streamline the writer's mental conversion between the Syntax
and the rendered output.

When there is one markup that produces a certain output format the user only has
to remember that one markup when reading. When writing it's even better: they
only have to recall that one markup _and_ they don't have to choose. More
options mean more work for the writer to maintain that all-important vision of
What They'll Get while they write.

There are lots of options in Markdown which makes it hard to read and hard to
write. Italic can be created with either `*` or `_` (either doubled creates
bold). Headings use different amounts of `#`s at the start of their lines, but
headings 1 and 2 can also be "underlined" with a line of `=====` or `-----`
respectively. Links URLs can follow the link text in parentheses, or be
referenced later either by an ID or by the link text itself. The number in
numbered lists doesn't actually matter so people often just use `1. 1. 1. 1.`
because it's easier. Code blocks can be fenced by `` ``` `` or indented with
four spaces.

This collection of reverse ambiguities means Markdown is hard to mentally parse
and compile. Unless there's a really good reason, our writer should be able to
keep a one-to-one map of plaintext markup and output styles in their head.


Directives for a New Readable Markup Syntax
--------

1. Prioritize unrendered readability (and therefore writability)
2. Each output style should have exactly one plaintext markup

Pupate and the WYSRDWYG syntax
--------

So we now approach the WYSRD. What You See should **Represent Directly** What
You Get. The representation should be one-to-one. And the representation should
be readable, meaning either the plaintext looks like the rendered output, or
it's easy to mentally convert it to the rendered output on-the-fly.

With Pupate, we're not providing the user with all the options of Markdown, and
that's on purpose. It's cool to stay in a terminal-like, one-font-size-only type
of space, and users are encouraged to break out of that with HTML injection if
necessary. But in exchange for the features of Markdown, Pupate provides users
with (what is hopefully) a true WYSRDWYG editing experience where pieces of
writing can grow smoothly and safely and then emerge, leaping free of their
cocoons to bask in the warm light of the public view.
