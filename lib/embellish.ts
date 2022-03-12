// Modifies text, adding HTML in place of Pupate embellishment markup
export function embellish(text: string): string {
  return text
    // italic and bold: https://regex101.com/r/3jF69L/latest
    .replace(/(?<!\\)\*((?:[^\s\\]|\\\*)(?:(?:[^*]|\\\*)*?(?:[^\s\\]|\\\*))?)\*/isg, '<b>$1</b>')
    .replace(/(?<!\\)\_((?:[^\s\\]|\\\_)(?:(?:[^_]|\\\_)*?(?:[^\s\\]|\\\_))?)\_/isg, '<i>$1</i>')
    // colors: https://regex101.com/r/KfmkYJ/latest
    .replace(/(?<!\\){((?:[^{\\]|\\.)*?)}\(([^()]*?|var\(--[_a-zA-Z0-9\-]*\))\)/isg, '<span style="color: $2">$1</span>')
    // links: https://regex101.com/r/gWRJfY/latest
    .replace(/(?<!\\)\[((?:[^[\\]|\\.)*?)]\(([^\)]+)\)/isg, '<a href="$2">$1</a>')
    // remove escape characters: https://regex101.com/r/CxSH5n/latest
    .replace(/(\\)(\\*)/gm, '$2')
}

// Removing Pupate embellishment markup from text so the text can be used as
// plain text, e.g. in the document title
export function unembellish(text: string): string {
  return text
    // remove italic and bold markup
    .replace(/(?<!\\)\*((?:[^\s\\]|\\\*)(?:(?:[^*]|\\\*)*?(?:[^\s\\]|\\\*))?)\*/isg, '$1')
    .replace(/(?<!\\)\_((?:[^\s\\]|\\\_)(?:(?:[^_]|\\\_)*?(?:[^\s\\]|\\\_))?)\_/isg, '$1')
    // remove color markup
    .replace(/(?<!\\){((?:[^{\\]|\\.)*?)}\(([^()]*?|var\(--[_a-zA-Z0-9\-]*\))\)/isg, '$1')
    // remove link markup
    .replace(/(?<!\\)\[((?:[^[\\]|\\.)*?)]\(([^\)]+)\)/isg, '$1')
    // remove escape characters
    .replace(/(\\)(\\*)/gm, '$2')

}
