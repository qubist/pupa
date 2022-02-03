import { PageURLsBasedOnValue } from './options'
import { Entry } from './entry'
import { unembellish } from './embellish'


// Make a title, filename, or date ready to be part of an entry URL
function slugify(value: string, form: PageURLsBasedOnValue): string {
  value = value.replace(/^\s+|\s+$/g, '') // remove trailing and leading whitespace
  .toLowerCase()
  .replace(/\s+|[/_;:,? '"*()[\]{}!]/g, '-') // replace invalid characters with dashes
  .replace(/-+/g, '-') // collapse dashes
  .replace(/^-|-$/g, '') // remove leading/trailing dashes

  if (value == '') {
    throw 'Slugification failed! An entry had the '.red + form.red + ` "${value}"`.reset + ', which produced an empty slug. Try changing this '.red + form.red + ' or choose a new option for the pageURLsBasedOn setting.'.red
  }

  return value
}

export function getSlug(entry: Entry, basedOn: PageURLsBasedOnValue): string {
  let slug: string
  switch (basedOn) {
    case 'title':
      slug = slugify(unembellish(entry.title), 'title')
      break
    case 'filename':
      slug = slugify(entry.filename, 'filename')
      break
    case 'date':
      slug = slugify(entry.datestring, 'date')
      break
    // Can't be anything else
  }
  return slug
}
