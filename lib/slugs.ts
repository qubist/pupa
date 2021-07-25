import { PageURLsBasedOnValue } from './options'
import { Entry } from './entry'


// Make a title, filename, or date ready to be part of an entry URL
function slugify(value: string, form: PageURLsBasedOnValue): string {
  value = value.replace(/^\s+|\s+$/g, '')
  .toLowerCase()
  .replace(/\s+|[/_;:,? '"]/g, '-') // remove invalid characters
  .replace(/-+/g, '-') // collapse dashes

  if (value == '') {
    throw 'Slugification failed! Value '.red + value.reset + ' produced an empty slug. Try changing the '.red + form.red + ' that matches this value or choose a new option for the pageURLsBasedOn setting.'.red
  }

  return value
}

export function getSlug(entry: Entry, basedOn: PageURLsBasedOnValue): string {
  let slug: string
  switch (basedOn) {
    case 'title':
      slug = slugify(entry.title, basedOn)
    case 'filename':
      slug = slugify(entry.filename, basedOn)
    case 'date':
      slug = slugify(entry.datestring, basedOn)
    // Can't be anything else
  }
  return slug
}
