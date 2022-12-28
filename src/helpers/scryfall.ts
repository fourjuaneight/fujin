/* eslint-disable id-length,  camelcase */
import {
  MTGItem,
  RequestQuery,
  ScryfallCardSelection,
  ScryfallError,
  ScryfallSearch,
} from '../types/mtg';

const magicColors: { [key: string]: string } = {
  W: 'White',
  U: 'Blue',
  B: 'Black',
  R: 'Red',
  G: 'Green',
};

const escapeText = (text: string): string => text.replace(/\n/g, '\\n');

/**
 * Search Scryfall database for cards matching the given search pattern.
 * DOCS: https://scryfall.com/docs/api/cards/search
 * REF: https://scryfall.com/docs/syntax
 * @function
 * @async
 *
 * @param {RequestQuery} queryTerm search data
 * @returns {Promise<ScryfallCardSelection>}
 */
export const searchCard = async (
  queryTerm: RequestQuery
): Promise<ScryfallCardSelection> => {
  try {
    const encodedName = encodeURIComponent(queryTerm.name);
    const request = await fetch(
      `https://api.scryfall.com/cards/search?order=set&q=${encodedName}s:${queryTerm.set}+cn:${queryTerm.number}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (request.status !== 200) {
      throw `(searchCard): ${request.status} - ${request.statusText} | ${queryTerm.set}/${queryTerm.number}`;
    }

    const response: ScryfallSearch | ScryfallError = await request.json();

    if (response.object === 'error') {
      const { details, warnings } = response as ScryfallError;
      const errMsg = warnings ? warnings.join('\n') : details;

      throw `(searchCard): \n ${errMsg}`;
    }

    const cards = (response as ScryfallSearch).data.map(
      ({
        artist,
        card_faces,
        collector_number,
        colors,
        flavor_text,
        image_uris,
        name,
        oracle_text,
        rarity,
        released_at,
        set_name,
        set,
        type_line,
      }) => {
        const oText = oracle_text
          ? escapeText(oracle_text)
          : card_faces?.[0]?.oracle_text
          ? escapeText(card_faces?.[0]?.oracle_text)
          : null;
        const fText = flavor_text
          ? escapeText(flavor_text)
          : card_faces?.[0]?.flavor_text
          ? escapeText(card_faces?.[0]?.flavor_text)
          : null;
        const item: MTGItem = {
          name,
          colors:
            colors.length !== 0
              ? colors.map(color => magicColors[color])
              : null,
          type: type_line,
          set: set.toUpperCase(),
          set_name,
          oracle_text: oText,
          flavor_text: fText,
          rarity,
          collector_number: parseInt(collector_number, 10),
          artist,
          released_at,
          image: image_uris?.png || card_faces?.[0]?.image_uris?.png || '',
          back: card_faces?.[1]?.image_uris?.png || null,
        };

        return item;
      }
    );
    // cards keyed by name, set, and collector number
    const selection: ScryfallCardSelection = cards.reduce((acc, card) => {
      const { name, set, collector_number } = card;
      const key = `${name} - (${set}) #${collector_number}`;

      if (!acc[key]) {
        acc[key] = {
          [key]: card,
        };
      }

      return acc;
    }, {} as ScryfallCardSelection);

    return selection;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
