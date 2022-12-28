/* eslint-disable camelcase */
export interface ShelfItem {
  category: string;
  comments: string;
  completed: boolean;
  cover: string;
  creator: string;
  genre: string;
  id?: string;
  name: string;
  rating: number;
}

export type ShelfCountColumn =
  | 'category'
  | 'completed'
  | 'creator'
  | 'genre'
  | 'rating';

export interface RecordColumnAggregateCount {
  [key: string]: number;
}

export type Types = 'Tags' | 'Count' | 'Query' | 'Search' | 'Insert' | 'Update';

export interface RequestPayload {
  type: Types;
  tagList?: string;
  data?: ShelfItem;
  query?: string;
  countColumn?: ShelfCountColumn;
}
