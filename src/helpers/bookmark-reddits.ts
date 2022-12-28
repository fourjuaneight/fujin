import { addItem } from './hasura';
import { fmtValue } from '../utils/fmt';
import { BK_FIELDS } from '../data';

import { BookmarkingResponse, RedditData } from '../types/bookmarks';

/**
 * Get post details via Reddit API.
 * @function
 * @async
 *
 * @param {string} url post url
 * @returns {Promise<RedditData>} reddit title, content, subreddit, and url
 */
const getRedditDetails = async (url: string): Promise<RedditData> => {
  try {
    const request = await fetch(`${url}.json`);

    if (request.status !== 200) {
      throw `(getRedditDetails): ${request.status} - ${request.statusText}`;
    }

    const response = await request.json();
    const post = response[0].data.children[0].data;

    return {
      title: fmtValue(post.title),
      content:
        post.selftext ||
        post.media?.reddit_video?.fallback_url?.replace(
          '?source=fallback',
          ''
        ) ||
        post.secure_media?.oembed?.thumbnail_url?.replace(
          'size_restricted.gif',
          'mobile.mp4'
        ) ||
        post.url_overridden_by_dest,
      subreddit: post.subreddit_name_prefixed,
      url,
    };
  } catch (error) {
    throw `(getRedditDetails): \n ${error}`;
  }
};

/**
 * Get reddit details and upload to Airtable.
 * @function
 * @async
 *
 * @param {string} url reddit post url
 * @param {string[]} tags record tags
 * @returns {Promise<BookmarkingResponse>} result of record upload
 */
export const bookmarkReddits = async (
  url: string,
  tags: string[]
): Promise<BookmarkingResponse> => {
  try {
    const redditData = await getRedditDetails(url);
    const record: RedditData = {
      ...redditData,
      tags,
      dead: false,
    };
    const table = 'reddits';
    const hasuraResp = await addItem<RedditData>(
      table,
      record,
      record.url,
      'url',
      `${BK_FIELDS[table].join('\n')}`
    );

    return { success: true, message: hasuraResp, source: 'bookmarkReddits' };
  } catch (error) {
    return { success: false, message: error, source: 'bookmarkReddits' };
  }
};
