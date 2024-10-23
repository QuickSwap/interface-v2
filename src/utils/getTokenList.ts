import { TokenList } from '@uniswap/token-lists';
import schema from '@uniswap/token-lists/src/tokenlist.schema.json';
import Ajv from 'ajv';
import contenthashToUri from './contenthashToUri';
import { parseENSAddress } from './parseENSAddress';
import uriToHttp from './uriToHttp';

const tokenListValidator = new Ajv({ allErrors: true }).compile(schema);

/**
 * Contains the logic for resolving a list URL to a validated token list
 * @param listUrl list url
 * @param resolveENSContentHash resolves an ens name to a contenthash
 */
export default async function getTokenList(
  listUrl: string,
  resolveENSContentHash: (ensName: string) => Promise<string>,
  skipValidation?: boolean,
): Promise<TokenList> {
  const parsedENS = parseENSAddress(listUrl);
  let urls: string[];
  if (parsedENS) {
    let contentHashUri;
    try {
      contentHashUri = await resolveENSContentHash(parsedENS.ensName);
    } catch (error) {
      console.debug(`Failed to resolve ENS name: ${parsedENS.ensName}`, error);
      throw new Error(`Failed to resolve ENS name: ${parsedENS.ensName}`);
    }
    let translatedUri;
    try {
      translatedUri = contenthashToUri(contentHashUri);
    } catch (error) {
      console.debug('Failed to translate contenthash to URI', contentHashUri);
      throw new Error(
        `Failed to translate contenthash to URI: ${contentHashUri}`,
      );
    }
    urls = uriToHttp(`${translatedUri}${parsedENS.ensPath ?? ''}`);
  } else {
    urls = uriToHttp(listUrl);
  }
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const isLast = i === urls.length - 1;
    let response;
    try {
      response = await fetch(url);
    } catch (error) {
      console.debug('Failed to fetch list', listUrl, error);
      if (isLast) throw new Error(`Failed to download list ${listUrl}`);
      continue;
    }

    if (!response.ok) {
      if (isLast) throw new Error(`Failed to download list ${listUrl}`);
      continue;
    }

    try {
      // The content of the result is sometimes invalid even with a 200 status code.
      // A response can be invalid if it's not a valid JSON or if it doesn't match the TokenList schema.
      const json = await response.json();
      const list = skipValidation ? json : tokenListValidator(json);

      if (!list) {
        console.log(tokenListValidator.errors);
        const validationErrors: string =
          tokenListValidator.errors?.reduce<string>((memo, error) => {
            const add = `${error.dataPath} ${error.message ?? ''}`;
            return memo.length > 0 ? `${memo}; ${add}` : `${add}`;
          }, '') ?? 'unknown error';
        throw new Error(`Token list failed validation: ${validationErrors}`);
      }
      return list;
    } catch (error) {
      console.debug(
        `failed to parse and validate list response: ${listUrl} (${url})`,
        error,
      );
      continue;
    }
  }
  throw new Error('Unrecognized list URL protocol.');
}
