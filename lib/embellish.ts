
// Modifies text, adding HTML in place of Pupate embellishment markup
export function embellish(text: string): string {
  return text
    .replace(/\*(\S(.*?\S)?)\*/isg, "<b>$1</b>")
    .replace(/\_(\S(.*?\S)?)\_/isg, "<i>$1</i>")
    .replace(/{([^{]*?)}\(([^()]*?|var\(--[_a-zA-Z0-9-]*\))\)/isg, '<span style="color: $2">$1</span>')
    .replace(/\[([^\[]+)\]\(([^\)]+)\)/isg, '<a href="$2">$1</a>')
}
