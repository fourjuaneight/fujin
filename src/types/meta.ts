/* eslint-disable camelcase */
export type Types = 'Query' | 'Search' | 'Insert' | 'Update';

export type MetaTables = 'categories' | 'genres' | 'platforms' | 'tags';

export interface Meta {
  id?: string;
  name?: string;
  table: string;
  schema: string;
}

export interface RequestPayload {
  type: Types;
  table: MetaTables;
  data?: Meta;
  query?: string;
}
