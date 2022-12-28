import { addItem } from '../hasura';
import { bkFields } from '../../utils/tableColumns';
import { fmtValue } from '../../utils/fmt';

import {
  BookmarkingResponse,
  PageData,
  RecordData,
  BKTables,
} from '../../types/bookmarks';

/**
 * Upload article|comic to Airtable.
 * @function
 * @async
 *
 * @param {BKTables} table airtable table name
 * @param {PageData} data page data
 * @returns {Promise<BookmarkingResponse>} result of record upload
 */
export const bookmarkPage = async (
  table: BKTables,
  data: PageData
): Promise<BookmarkingResponse> => {
  const isArticle = table === 'articles';
  const source = isArticle ? 'bookmarkPage:articles' : 'bookmarkPage:comics';
  const cleanURL = data.url
    .replace(/\?ref=.*/g, '')
    .replace(/\?utm_source/g, '');
  const baseData = {
    title: fmtValue(data.title),
    url: cleanURL,
    tags: data.tags,
    dead: false,
  };
  const record = isArticle
    ? ({
        ...baseData,
        author: fmtValue(data.author),
        site: fmtValue(data.site),
      } as RecordData)
    : ({ ...baseData, creator: fmtValue(data.creator) } as RecordData);

  try {
    const hasuraResp = await addItem<RecordData>(
      table,
      record,
      record.title,
      'title',
      `${bkFields[table].join('\n')}`
    );

    return { success: true, message: hasuraResp, source };
  } catch (error) {
    return { success: false, message: error, source };
  }
};
