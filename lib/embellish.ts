
// Modifies text, adding HTML in place of Pupate embellishment markup
export function embellish(text: string): string {
  return text
    .replace(/\*(\S([^*]*?\S)?)\*/ig, "<b>$1</b>")
    .replace(/\_(\S([^_]*?\S)?)\_/isg, "<i>$1</i>")
    .replace(/{([^{]*?)}\(([^()]*?|var\(--[_a-zA-Z0-9-]*\))\)/isg, '<span style="color: $2">$1</span>')
    .replace(/\[([^\[]+)\]\(([^\)]+)\)/isg, '<a href="$2">$1</a>')
}

// Paralel function to embellish above, but removing Pupate embellishment markup
// so the text can be used as plain text, e.g. the document title
export function unembellish(text: string): string {
  return text
    .replace(/\*(\S([^*]*?\S)?)\*/isg, "$1")
    .replace(/\_(\S([^_]*?\S)?)\_/isg, "$1")
    .replace(/{([^{]*?)}\(([^()]*?|var\(--[_a-zA-Z0-9-]*\))\)/isg, '$1')
    .replace(/\[([^\[]+)\]\(([^\)]+)\)/isg, '$1')
}
