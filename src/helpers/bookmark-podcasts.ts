import { addItem } from './hasura';
import { fmtValue } from '../utils/fmt';
import { BK_FIELDS } from '../data';

import {
  BookmarkingResponse,
  ParsingPatterns,
  ParsingService,
  BookmarkData,
} from '../types/bookmarks';

// list of regular expressions to find and replace
const parsing: ParsingPatterns = {
  castro: {
    title: new RegExp('<h1>(.*)</h1>', 'g'),
    creator: new RegExp('<h2><ashref=".*"salt=".*">(.*)</a></h2>', 'g'),
    url: new RegExp('<sourcessrc="(.*)"stype="audio/mp3">', 'g'),
  },
  overcast: {
    title: new RegExp(
      '<h2sclass="margintop0 marginbottom0"sclass="title">(.*)</h2>',
      'g'
    ),
    creator: new RegExp('<ashref="/itunesd+.*"s?>(.*)</a>', 'g'),
    url: new RegExp('<sourcessrc="(.*)"stype="audio/mp3"s?/>', 'g'),
  },
  title: [
    new RegExp('^Sd+s', 'g'),
    new RegExp('^Ep.d{1,3}s?', 'g'),
    new RegExp('^([a-zA-ZDs]+)?#d{1,3}:?s', 'g'),
    new RegExp('^Hasty Treats-s', 'g'),
    new RegExp('^(Bonus|BONUS):s?', 'g'),
    new RegExp('^Ep.s', 'g'),
    new RegExp('s—sOvercast', 'g'),
    new RegExp('s-sYouTube', 'g'),
    new RegExp('s+on Vimeo', 'g'),
    new RegExp('ThesAdventuresZone:', 'g'),
    new RegExp('s-sEp.?sd+$', 'g'),
    new RegExp(':sArticlessofsInterests#d+$', 'g'),
    new RegExp('sDs([0-9A-Za-z]+s)+Ds(Overcast)', 'g'),
    new RegExp(
      '(Dd{1,3}sDs)|(d{1,3}sDs)|(wdDwdsDs)|(w+sd{1,3}Ds)|(d{1,3}Ds)',
      'g'
    ),
    new RegExp('s(—)(s[A-Za-z]+)+', 'g'),
    new RegExp('s$', 'g'),
    new RegExp('^s', 'g'),
  ],
};

/**
 * Extract parameter from data source.
 * @function
 *
 * @param {string} data raw data source
 * @param {RegExp} pattern regular expression to replace for
 * @returns {string} extracted string
 */
const paramCleaner = (data: string, pattern: RegExp): string => {
  const match = data.match(pattern);

  if (match && match?.length > 0) {
    return match[0].replace(pattern, '$1');
  }

  const error = '(paramCleaner): Unable to find match.';

  console.error('Unable to find match.');
  throw error;
};

/**
 * Escape characters in string for fetch request transport.
 * @function
 *
 * @param {string} str text to escape
 * @returns {string} request ready text
 */
const escapedString = (str: string): string =>
  str
    .replace(/(["':]+)/g, '\\$1')
    .replace(/([,]+)/g, '\\$1')
    .replace(/"/g, '"');

/**
 * Clean title based on list of patterns.
 * @function
 *
 * @param {string} string data source
 * @param {RegExp[]} patterns list of regular expressions to replace for
 * @returns {string} cleaned string
 */
const titleCleaner = (string: string, patterns: RegExp[]): string => {
  let cleanTitle = string;

  patterns.forEach(regexp => {
    cleanTitle = cleanTitle.replace(regexp, '');
  });

  return escapedString(cleanTitle);
};

/**
 * Get podcast details from HTML via RegEx.
 * @function
 * @async
 *
 * @param {string} url episode url
 * @returns {Promise<BookmarkData >} episode title, podcast, and url
 */
const getPodcastDetails = async (url: string): Promise<BookmarkData> => {
  try {
    const source = url.includes('castro') ? 'castro' : 'overcast';
    const request = await fetch(url);

    if (request.status !== 200) {
      throw `(getPodcastDetails): ${request.status} - ${request.statusText}`;
    }

    const response = await request.text();
    // flatten doc; remove breakpoints and excessive spaces
    const post = response
      .replace(/\n\s+/g, '')
      .replace(/\n/g, '')
      .replace(/\s+/g, ' ');
    // extract details from doc
    const service = parsing[source] as ParsingService;
    const clnTitle = paramCleaner(post, service.title);
    const clnrTitle = titleCleaner(clnTitle, parsing.title);
    const fmtTitle = fmtValue(clnrTitle);
    const creator = paramCleaner(post, service.creator);
    const link = paramCleaner(post, service.url).replace(
      /^(.*)\.(mp3).*/g,
      '$1.$2'
    );

    return {
      title: fmtTitle,
      creator: fmtValue(creator),
      url: link,
    };
  } catch (error) {
    throw `(getPodcastDetails):\n ${error}`;
  }
};

/**
 * Get podcast details and upload to Airtable.
 * @function
 * @async
 *
 * @param {string} url podcast url
 * @param {string[]} tags record tags
 * @returns {Promise<BookmarkingResponse>} result of record upload
 */
export const bookmarkPodcasts = async (
  url: string,
  tags: string[]
): Promise<BookmarkingResponse> => {
  try {
    const podcastData = await getPodcastDetails(url);
    const record: BookmarkData = {
      ...podcastData,
      tags,
      dead: false,
    };
    const table = 'podcasts';
    const hasuraResp = await addItem<BookmarkData>(
      table,
      record,
      record.title,
      'title',
      `${BK_FIELDS[table].join('\n')}`
    );

    return { success: true, message: hasuraResp, source: 'bookmarkPodcasts' };
  } catch (error) {
    return { success: false, message: error, source: 'bookmarkPodcasts' };
  }
};
