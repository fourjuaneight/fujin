/* eslint-disable camelcase */
export type Types = 'Query' | 'Search' | 'Insert' | 'Update';

export type Tables = 'categories' | 'genres' | 'platforms' | 'tags';

export interface Meta {
  id?: string;
  name?: string;
  table: string;
  schema: string;
}

export interface RequestPayload {
  type: Types;
  table: Tables;
  data?: Meta;
  query?: string;
}
