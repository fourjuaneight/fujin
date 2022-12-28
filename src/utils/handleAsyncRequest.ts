interface SettledPromise<RespBody> {
  data?: RespBody;
  error?: string;
}

/**
 * Handle async fetch response and return data or error.
 * @function
 * @async
 *
 * @param {Promise} promise response from fetch
 * @returns {Promise} object with data or error properties
 */
export const handleAsyncRequest = async <Data>(
  promise: Promise<Response>
): Promise<SettledPromise<Data>> =>
  Promise.allSettled([promise]).then(async ([{ value, reason }]) => {
    let valueStatus: Data;

    if (value) {
      valueStatus = (await value.json()) as Data;
    }

    return {
      data: valueStatus,
      error: reason as string | undefined,
    };
  });
