import { addItem } from '../hasura';
import { bkFields } from '../../utils/tableColumns';
import { fmtValue } from '../../utils/fmt';

import {
  BookmarkData,
  BookmarkingResponse,
  VimeoResponse,
} from '../../types/bookmarks';

/**
 * Convert video url to API ready endpoint. Extracts video ID.
 * @function
 *
 * @param {string} url video url
 * @returns {string} API endpoint to fetch video data
 */
const cleanUrl = (url: string): string => {
  const updatedStr = url.replace(
    /(https:\/\/vimeo\.com\/)(.*)/g,
    'https://api.vimeo.com/videos/$2'
  );

  return updatedStr;
};

/**
 * Get video details via Vimeo API.
 * Docs: https://developer.vimeo.com/api/reference/videos#get_video
 * @function
 * @async
 *
 * @param {string} url video url
 * @returns {Promise<BookmarkData>} video title, creator, and url
 */
const getVimeoDetails = async (url: string): Promise<BookmarkData> => {
  try {
    const endpoint = cleanUrl(url);
    const request = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${VIMEO_KEY}`,
      },
    });

    if (request.status !== 200) {
      throw `(getVimeoDetails): ${request.status} - ${request.statusText}`;
    }

    const response: VimeoResponse = await request.json();

    return {
      title: fmtValue(response.name),
      creator: fmtValue(response.user.name),
      url,
    };
  } catch (error) {
    throw `(getVimeoDetails):\n${error}`;
  }
};

/**
 * Get Vimeo video details and upload to Airtable.
 * @function
 * @async
 *
 * @param {string} url video url
 * @param {string[]} tags record tags
 * @returns {Promise<BookmarkingResponse>} result of record upload
 */
export const bookmarkVimeo = async (
  url: string,
  tags: string[]
): Promise<BookmarkingResponse> => {
  try {
    const vimeoData = await getVimeoDetails(url);
    const record: BookmarkData = {
      ...vimeoData,
      tags,
      dead: false,
    };
    const table = 'videos';
    const hasuraResp = await addItem<BookmarkData>(
      table,
      record,
      record.title,
      'title',
      `${bkFields[table].join('\n')}`
    );

    return { success: true, message: hasuraResp, source: 'bookmarkVimeo' };
  } catch (error) {
    return { success: false, message: error, source: 'bookmarkVimeo' };
  }
};
