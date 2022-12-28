import {
  HasuraErrors,
  HasuraInsertResp,
  HasuraQueryAggregateResp,
  HasuraQueryResp,
  HasuraQueryTagsResp,
  RecordColumnAggregateCount,
} from '../types/hasura';

const objToQueryString = (obj: { [key: string]: any }) =>
  Object.keys(obj).map(key => {
    const value = obj[key];
    const fmtValue =
      typeof value === 'string'
        ? `"${value
            .replace(/\\/g, '')
            .replace(/"/g, '\\"')
            .replace(/\n/g, '\\n')}"`
        : Array.isArray(value)
        ? `"{${value.join(',')}}"`
        : value;

    return `${key}: ${fmtValue}`;
  });

const countUnique = (iterable: string[]) =>
  iterable.reduce((acc: RecordColumnAggregateCount, item) => {
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {});

const countUniqueSorted = (iterable: string[]) =>
  // sort descending by count
  Object.entries(countUnique(iterable))
    .sort((a, b) => b[1] - a[1])
    .reduce(
      (acc: RecordColumnAggregateCount, [key, val]) =>
        ({ ...acc, [key]: val } as RecordColumnAggregateCount),
      {}
    );

/**
 * Get table tags from Hasura.
 * @function
 * @async
 *
 * @param {string} table
 * @returns {Promise<string[]>}
 */
export const queryTags = async (
  schema: string,
  table: string
): Promise<string[]> => {
  const query = `
    {
      meta_tags(
        order_by: {name: asc},
        where: {schema: {_eq: "${schema}"}, table: {_eq: "${table}"}}
      ) {
        name
      }
    }
  `;

  try {
    const request = await fetch(`${HASURA_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hasura-Admin-Secret': `${HASURA_ADMIN_SECRET}`,
      },
      body: JSON.stringify({ query }),
    });

    if (request.status !== 200) {
      throw `(queryTags): ${request.status} - ${request.statusText}`;
    }

    const response: HasuraQueryTagsResp | HasuraErrors = await request.json();

    if (response.errors) {
      const { errors } = response as HasuraErrors;

      throw `(queryTags) - ${table}: \n ${errors
        .map(err => `${err.extensions.path}: ${err.message}`)
        .join('\n')} \n ${query}`;
    }

    const tags = (response as HasuraQueryTagsResp).data.meta_tags.map(
      tag => tag.name
    );

    return tags;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

/**
 * Get table entries from Hasura.
 * @function
 * @async
 *
 * @param {string} table
 * @param {string} column
 * @param {string} queryCols
 * @returns {Promise<object>}
 */
export const queryItems = async <QueryData>(
  table: string,
  column: string,
  queryCols: string
): Promise<QueryData[]> => {
  const query = `
    {
      ${table}(order_by: {
        ${column}: asc
      }) {
        ${queryCols}
        id
      }
    }
  `;

  try {
    const request = await fetch(`${HASURA_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hasura-Admin-Secret': `${HASURA_ADMIN_SECRET}`,
      },
      body: JSON.stringify({ query }),
    });

    if (request.status !== 200) {
      throw `(queryItems): ${request.status} - ${request.statusText}`;
    }

    const response: HasuraQueryResp<QueryData> | HasuraErrors =
      await request.json();

    if (response.errors) {
      const { errors } = response as HasuraErrors;

      throw `(queryItems) - ${table}: \n ${errors
        .map(err => `${err.extensions.path}: ${err.message}`)
        .join('\n')} \n ${query}`;
    }

    return (response as HasuraQueryResp<QueryData>).data[table];
  } catch (error) {
    console.log(error);
    throw error;
  }
};

/**
 * Get aggregated count of table column from Hasura.
 * @function
 * @async
 *
 * @param {string} table
 * @param {object} column
 * @returns {Promise<object>}
 */
export const queryTableAggregateCount = async <CountColumn>(
  table: string,
  column: CountColumn
): Promise<RecordColumnAggregateCount> => {
  const sort = column === 'tags' ? 'title' : column;
  const query = `
    {
      ${table}(order_by: {${sort}: asc}) {
        ${column}
      }
    }
  `;

  try {
    const request = await fetch(`${HASURA_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hasura-Admin-Secret': `${HASURA_ADMIN_SECRET}`,
      },
      body: JSON.stringify({ query }),
    });

    if (request.status !== 200) {
      throw `(queryTableAggregateCount): ${request.status} - ${request.statusText}`;
    }

    const response: any = await request.json();

    if (response.errors) {
      const { errors } = response as HasuraErrors;

      throw `(queryTableAggregateCount) - ${table}: \n ${errors
        .map(err => `${err.extensions.path}: ${err.message}`)
        .join('\n')} \n ${query}`;
    }

    const data = (response as HasuraQueryAggregateResp).data[`${table}`];
    let collection: string[];

    if (column === 'tags') {
      collection = data.map(item => item[column] as string[]).flat();
    } else {
      collection = data.map(item => item[column] as string);
    }

    return countUniqueSorted(collection);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

/**
 * Search table entries from Hasura.
 * @function
 * @async
 *
 * @param {string} table
 * @param {string} pattern
 * @param {string} column
 * @param {string} queryCols
 * @returns {Promise<object>}
 */
export const searchItems = async <SearchData>(
  table: string,
  pattern: string,
  column: string,
  queryCols: string
): Promise<SearchData[]> => {
  const cleanPattern = pattern.replace(/([:;!?-_()[\]]+)/g, '');
  const query = `
    {
      ${table}(
        order_by: {${column}: asc},
        where: {${column}: {_iregex: ".*${cleanPattern}.*"}}
      ) {
        ${queryCols}
        id
      }
    }
  `;

  try {
    const request = await fetch(`${HASURA_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hasura-Admin-Secret': `${HASURA_ADMIN_SECRET}`,
      },
      body: JSON.stringify({ query }),
    });

    if (request.status !== 200) {
      throw `(searchItems): ${request.status} - ${request.statusText}`;
    }

    const response: HasuraQueryResp<SearchData> | HasuraErrors =
      await request.json();

    if (response.errors) {
      const { errors } = response as HasuraErrors;

      throw `(searchItems) - ${table}: \n ${errors
        .map(err => `${err.extensions.path}: ${err.message}`)
        .join('\n')} \n ${query}`;
    }

    return (response as HasuraQueryResp<SearchData>).data[table];
  } catch (error) {
    console.log(error);
    throw error;
  }
};

/**
 * Upload record object to Hasura.
 * @function
 * @async
 *
 * @param {string} table
 * @param {object} record
 * @param {string} searchTitle
 * @param {string} searchCol
 * @param {string} queryCols
 * @returns {Promise<string>}
 */
export const addItem = async <AddData>(
  table: string,
  record: AddData,
  searchTitle: string,
  searchCol: string,
  queryCols: string
): Promise<string> => {
  const query = `
    mutation {
      insert_${table}_one(object: { ${objToQueryString(record)} }) {
        id
      }
    }
  `;

  try {
    const existing = await searchItems<AddData>(
      table,
      searchTitle,
      searchCol,
      queryCols
    );

    if (Object.keys(existing).length !== 0) {
      throw `(addItem): Item already exists.\n${JSON.stringify(
        {
          table,
          record,
          existing,
        },
        null,
        2
      )}`;
    }

    const request = await fetch(`${HASURA_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hasura-Admin-Secret': `${HASURA_ADMIN_SECRET}`,
      },
      body: JSON.stringify({ query }),
    });

    if (request.status !== 200) {
      throw `(addItem): ${request.status} - ${request.statusText}`;
    }

    const response: HasuraInsertResp | HasuraErrors = await request.json();

    if (response.errors) {
      const { errors } = response as HasuraErrors;

      throw `(addItem) - ${table}: \n ${errors
        .map(err => `${err.extensions.path}: ${err.message}`)
        .join('\n')} \n ${query}`;
    }

    return (response as HasuraInsertResp).data[`insert_${table}_one`].id;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

/**
 * Update item in Hasura.
 * @function
 * @async
 *
 * @param {string} table
 * @param {string} id
 * @param {object} item
 * @param {string} queryCol
 * @returns {Promise<string>}
 */
export const updateItem = async <UpdateData>(
  table: string,
  id: string,
  item: UpdateData,
  queryCol: string
): Promise<string> => {
  const query = `
    mutation {
      update_feeds_${table}(
        where: {id: {_eq: "${id}"}},
        _set: { ${objToQueryString(item)} }
      ) {
        returning {
          ${queryCol}
        }
      }
    }
  `;

  try {
    const request = await fetch(`${HASURA_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hasura-Admin-Secret': `${HASURA_ADMIN_SECRET}`,
      },
      body: JSON.stringify({ query }),
    });
    const response: HasuraUpdateResp | HasuraErrors = await request.json();

    if (response.errors) {
      const { errors } = response as HasuraErrors;

      throw `(updateItem) - ${table}: \n ${errors
        .map(err => `${err.extensions.path}: ${err.message}`)
        .join('\n')} \n ${query}`;
    }

    return (response as HasuraUpdateResp)[`update_${table}`].returning[0][
      queryCol
    ];
  } catch (error) {
    console.log(error);
    throw error;
  }
};
