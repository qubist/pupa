import * as path from 'path'
import * as fs from 'fs'

import { logger } from './logger'
import { Options } from './options'

export function createStylesheet(outputLocation: string, options: Options) {
  logger.debug('Creating stylesheet'.white)
  
  fs.writeFileSync(`${outputLocation}/styles.css`, renderStylesheet(options))
}

function renderStylesheet(options: Options): string {
  // Bring in template homepage from defaults folder
  let stylesheet: string = fs.readFileSync(path.resolve(__dirname, '../../defaults/imago/styles.css')).toString()

  // Replace keywords in styles template, bottom to top
  stylesheet = stylesheet.replace(/LINKCOLOR/, options.linkColor)
                         .replace(/BACKGROUNDCOLOR/, options.backgroundColor)
                         .replace(/TEXTCOLOR/, options.textColor)
                         .replace(/FONTSIZE/, options.size)
                         .replace(/FONTFAMILY/, options.font)

  return stylesheet
}
