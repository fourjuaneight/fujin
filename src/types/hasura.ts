export interface HasuraInsertResp {
  data: {
    [key: string]: {
      id: string;
    };
  };
}

export interface HasuraMutationResp {
  [key: string]: {
    returning: {
      id: string;
    }[];
  };
}

export interface HasuraQueryResp<Data> {
  data: {
    [key: string]: Data[];
  };
}

export interface HasuraQueryAggregateResp {
  data: {
    [key: string]: {
      [key: string]: string | string[];
    }[];
  };
}

export interface HasuraQueryCategoriesResp {
  data: {
    meta_categories: { name: string }[];
  };
}

export interface HasuraQueryTagsResp {
  data: {
    meta_tags: { name: string }[];
  };
}

export interface HasuraErrors {
  errors: {
    extensions: {
      path: string;
      code: string;
    };
    message: string;
  }[];
}
