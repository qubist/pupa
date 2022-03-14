import * as fs from 'fs'
import 'colors'
import * as path from 'path'
import { logger } from './logger'

import { Entry } from './entry'
import { unembellish } from './embellish'
import { getSlug } from './slugs'
import { Options } from './options'

/*

The RSS feed file, (ending up in imago/rss.xml), is created from three default
"sections" which are XML-ish files with templates that get filled in with
site-specific information:
- rss_channel.xmlish: Opening XML tags and channel-wide information like the site title
  and homepage link.
- rss_item.xmlish: One item, with title, description, and publication date set from
  Pupate entry information. This section is re-templated and inserted for each
  entry.
- rss_footer.xmlish: Just a few closing XML tags. 

*/


// Render the channel section of the RSS XML file
function renderChannelSection(homepageEntry: Entry, options: Options): string {
    let title = unembellish(homepageEntry.title)
    let description = unembellish(homepageEntry.content.split('\n')[0])

    // Read default channel section of RSS XML from defaults folder
    let channelSection = fs.readFileSync(path.resolve(__dirname, '../../defaults/imago/rss_channel.xmlish')).toString()
    // Replace keywords in reverse order in the template so the replaced content
    // can't interfere with the process (only first occurence is replaced)
    channelSection = channelSection
        .replace(/SITEDESCRIPTION/, description)
        .replace(/SITEURL/, options.RSSBaseURL)
        .replace(/SITETITLE/, title)

    return channelSection
}

// Render an item of the RSS XML file
function renderItemSection(entry: Entry, options: Options): string {
    // Read default item section of RSS XML from defaults folder
    let section: string = fs.readFileSync(path.resolve(__dirname, '../../defaults/imago/rss_item.xmlish')).toString()

    section = section
        .replace(/DATE/, entry.datestring)
        .replace(/DESCRIPTION/, unembellish(entry.content))
        .replace(/SLUG/, getSlug(entry, options.pageURLsBasedOn))
        .replace(/SITEURL/, options.RSSBaseURL)
        .replace(/TITLE/, unembellish(entry.title))

    return section
}

export function createRSS(pageEntries: Entry[], homepageEntry: Entry, options: Options): void {
    let rss = ''

    rss += renderChannelSection(homepageEntry, options)

    // Add an <item> tag for each page, newest to oldest by datestring
    let sortFunction = (a: Entry, b: Entry): number => -1 * a.datestring.localeCompare(b.datestring)
    for (const entry of pageEntries.sort(sortFunction)) {
        rss += renderItemSection(entry, options)
    }

    // Add the footer section to close off the XML
    rss += fs.readFileSync(path.resolve(__dirname, '../../defaults/imago/rss_footer.xmlish').toString())

    // Create the file with this content in the output location
    let location = options.outputLocation
    logger.debug('Creating RSS file in '.white + path.resolve(location, 'rss.xml').reset)

    fs.writeFileSync(path.resolve(location, 'rss.xml'), rss)
}