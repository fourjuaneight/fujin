/* eslint-disable camelcase */
// METHODS

export interface Feed {
  category: string;
  id?: string;
  rss: string;
  title: string;
  url: string;
}

export interface MangaFeed {
  author: string;
  id?: string;
  mangadex_id: string;
  title: string;
}

export interface SocialFeed {
  description: string;
  id?: string;
  list?: string;
  name: string;
  username?: string;
  url: string;
}

// MANGADEX

export interface Attributes {
  name: string;
  altNames: {
    en: string;
  }[];
  locked: boolean;
  website: string;
  ircServer: null;
  ircChannel: null;
  discord: null;
  contactEmail: null;
  description: string;
  twitter: null;
  mangaUpdates: null;
  focusedLanguages: string[];
  official: boolean;
  verified: boolean;
  inactive: boolean;
  publishDelay: null;
  createdAt: string;
  updatedAt: string;
  version: number;
  username: string;
  roles: string[];
}

export interface RelationshipsEntity {
  id: string;
  type: string;
  attributes?: Attributes;
}

export interface MangadexData {
  id: string;
  type: string;
  attributes: {
    volume: null;
    chapter: string;
    title: string;
    translatedLanguage: string;
    externalUrl: string;
    publishAt: string;
    readableAt: string;
    createdAt: string;
    updatedAt: string;
    pages: number;
    version: number;
  };
  relationships: RelationshipsEntity[];
}

export type MangadexResults = 'ok' | 'error';

export interface MangadexFeed {
  result: MangadexResults;
  response: string;
  data: MangadexData[];
  limit: number;
  offset: number;
  total: number;
}

export interface MangadexError {
  result: MangadexResults;
  errors: {
    id: string;
    status: number;
    title: string;
    detail: string;
  }[];
}

export interface MangadexChapter {
  title: string;
  chapter: string;
  url: string;
  date: string;
}

// FUNCTION

export type TableAggregate = 'podcasts' | 'websites' | 'youtube';

export type Types =
  | 'Chapters'
  | 'Count'
  | 'Insert'
  | 'Query'
  | 'Search'
  | 'Tags'
  | 'Update';

export type FeedTables =
  | 'manga'
  | 'podcasts'
  | 'reddit'
  | 'twitter'
  | 'websites'
  | 'youtube';

export interface RequestPayload {
  type: Types;
  table: FeedTables;
  tagList?: string;
  data?: Feed;
  query?: string;
  countColumn?: string;
}
