/* eslint-disable camelcase */
export interface Book {
  author: string;
  genre: string;
  id?: string;
  title: string;
}

export interface Game {
  genre: string;
  id?: string;
  platform: string;
  studio: string;
  title: string;
}

export interface Video {
  director: string;
  genre: string;
  id?: string;
  title: string;
}

export type MediaItem = Book | Game | Video;

export type CountColumn =
  | 'author'
  | 'director'
  | 'genre'
  | 'platform'
  | 'studio';

export type Tables = 'books' | 'games' | 'movies' | 'shows';

export interface RecordColumnAggregateCount {
  [key: string]: number;
}

export type Types = 'Tags' | 'Count' | 'Query' | 'Search' | 'Insert' | 'Update';

export interface RequestPayload {
  type: Types;
  table: string;
  tagList?: string;
  data?: MediaItem;
  query?: string;
  countColumn?: CountColumn;
}
