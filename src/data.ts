import { RecordData } from './types/bookmarks';

export const BK_FIELDS: { [key: string]: string[] } = {
  articles: ['title', 'author', 'site', 'url', 'archive'],
  comics: ['title', 'creator', 'url', 'archive'],
  podcasts: ['title', 'creator', 'url', 'archive'],
  reddits: ['title', 'subreddit', 'url', 'archive'],
  tweets: ['tweet', 'user', 'url'],
  videos: ['title', 'creator', 'url', 'archive'],
};

export const bkKey = (table: string, data: RecordData): string => {
  const options: { [key: string]: string } = {
    articles: `${data.title} - ${data.site}`,
    comics: `${data.title} - ${data.creator}`,
    podcasts: `${data.title} - ${data.creator}`,
    reddits: `${data.title} - ${data.subreddit}`,
    tweets: `${data.tweet}`,
    videos: `${data.title} - ${data.creator}`,
  };

  return options[table];
};
