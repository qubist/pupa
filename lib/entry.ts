import * as fs from 'fs'

export interface Entry {
  filename: string, // Filename without extension
  title: string,
  datestring: string,
  content: string
}

export function makeEntry(path: string): Entry {
  let file = fs.readFileSync(path)
  let lines = file.toString().split(/\r?\n/)

  // Filename is the last item in path, without extension
  let filename = path.split('/').slice(-1)[0].split('.').slice(0,-1).join('.')

  // All lines after first two are content
  let content = lines.slice(3).join('\n')

  return {
    filename,
    title: lines[0], // First line is title
    datestring: lines[1], // Second is datestring
    content
  }
}
