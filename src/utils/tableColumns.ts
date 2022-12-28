import { BKTables, FeedTables, MediaTables } from '../types/feeds';

export const bkFields: { [key: BKTables]: string[] } = {
  articles: ['title', 'author', 'site', 'url', 'archive'],
  comics: ['title', 'creator', 'url', 'archive'],
  podcasts: ['title', 'creator', 'url', 'archive'],
  reddits: ['title', 'subreddit', 'url', 'archive'],
  tweets: ['tweet', 'user', 'url'],
  videos: ['title', 'creator', 'url', 'archive'],
};

export const feedFields: { [key: FeedTables]: string[] } = {
  podcasts: ['category', 'rss', 'title', 'url'],
  manga: ['title', 'author', 'mangadex_id'],
  reddit: ['name', 'description', 'url'],
  twitter: ['name', 'username', 'description', 'list', 'url'],
  websites: ['category', 'rss', 'title', 'url'],
  youtube: ['category', 'rss', 'title', 'url'],
};

export const mediaFields: { [key: MediaTables]: string[] } = {
  books: ['title', 'author', 'genre'],
  games: ['title', 'studio', 'platform', 'genre'],
  movies: ['title', 'director', 'genre'],
  shows: ['title', 'director', 'genre'],
};

export const metaFields = ['name', 'table', 'schema'];

export const mtgFields = [
  'name',
  'colors',
  'type',
  'set',
  'set_name',
  'oracle_text',
  'flavor_text',
  'rarity',
  'collector_number',
  'artist',
  'released_at',
  'image',
];

export const shelfFields = [
  'category',
  'comments',
  'completed',
  'cover',
  'creator',
  'genre',
  'name',
  'rating',
];
