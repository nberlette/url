/**
 * @module @nick/url
 */
import { URL } from "./src/url.ts";
import { URLSearchParams } from "./src/url_search_params.ts";

export * from "./src/url.ts";
export * from "./src/url_search_params.ts";

export default { URL, URLSearchParams } as const;
