/**
 * This module provides a ponyfill for the WHATWG URL API.
 *
 * ### Compatibility
 *
 * It is fully compatible with the native URL API found in all modern browsers,
 * as well as those found in server-side runtimes like Node, Deno, and Bun.
 * Compatibility in serverless runtimes is confirmed on both Cloudflare Workers
 * and Deno Deploy, but cannot be guaranteed for other providers at this time.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/URL - MDN Reference
 * @see https://jsr.io/@nick/url/doc/~/URL - API documentation
 * @module url
 */
import { URLSearchParams } from "./url_search_params.ts";
import {
  $Object,
  type InspectOptions,
  type InspectOptionsStylized,
  internal,
  kDenoInspect,
  kNodeInspect,
  type ParsedURL,
  parseURL,
  resolveURL,
} from "./_internal.ts";

/**
 * URL ponyfill that mirrors the standard WHATWG URL API.
 *
 * @example Parsing an absolute URL
 * ```ts
 * import { URL } from "@nick/url";
 *
 * const url = new URL(
 *   "https://user:pass@example.com:8080/path?foo=bar#baz"
 * );
 * console.assert(url.username === "user");
 * console.assert(url.port === "8080");
 * console.assert(url.hash === "#baz");
 * ```
 * @example Relative URL resolution
 * ```ts
 * import { URL } from "@nick/url";
 *
 * const base = new URL("https://example.com/dir/page");
 * const url = new URL("../newpage?x=1", base);
 * console.assert(url.href === "https://example.com/newpage?x=1");
 * ```
 * @category URL Components
 */
export class URL {
  /**
   * Checks if a given URL string or URL instance can be parsed into a valid
   * URL instance, optionally with a base URL for relative URLs. If the URL is
   * valid (meaning it can be used to construct a new URL via `new URL`), this
   * will return `true`. If the URL is invalid (meaning it would throw an error
   * when passed to `new URL`), this will return `false`.
   *
   * @param url The URL string or existing URL instance to check.
   * @param [base] Optional base URL (string or instance) for relative URLs.
   * @returns `true` if the URL is valid, `false` otherwise.
   */
  static canParse(url: string | URL, base?: string | URL): boolean {
    if (typeof url !== "string") return false;
    try {
      new URL(url, base);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Parses a URL string or existing URL instance into a new URL object,
   * optionally resolving it against a base URL. If the URL is invalid, it
   * returns `null`.
   *
   * @param url The URL string or existing URL instance to parse.
   * @param [base] Optional base URL (string or instance) for relative URLs.
   * @returns A new URL instance or `null` if the URL is invalid.
   */
  static parse(url: string | URL, base?: string | URL): URL | null {
    try {
      return new URL(url, base);
    } catch {
      return null;
    }
  }

  /**
   * Creates a new Blob URL from the provided Blob object. This URL can be used
   * to reference the Blob in a way that is safe and secure.
   *
   * **Note**: This is a stub implementation, as it is not possible to create a
   * true Blob URL solely from userland code.
   *
   * @param blob The Blob object to create a URL for.
   * @returns A string representing the Blob URL.
   */
  static createObjectURL(blob: Blob): string {
    let uuid = "";
    if (typeof crypto === "object" && crypto?.randomUUID) {
      uuid = crypto.randomUUID();
    } else {
      uuid = [8, 4, 4, 4, 12].map((length) =>
        Array.from(
          { length },
          () => Math.floor(Math.random() * 16).toString(16),
        ).join("")
      ).join("-");
    }
    return void blob, `blob:${uuid}`;
  }

  /**
   * Releases a Blob URL created with `createObjectURL`.
   *
   * **Note**: This is a stub implementation, as it is not possible to create
   * or release a true Blob URL solely from userland code.
   *
   * @param url The Blob URL to revoke.
   */
  static revokeObjectURL(url: string | URL): void {
    void url;
  }

  // Internal storage of URL components.
  #protocol: string;
  #username: string;
  #password: string;
  #hostname: string;
  #port: string;
  #pathname: string;
  #search: string;
  #hash: string;
  #searchParams = new URLSearchParams();
  #serialization = "";

  /**
   * Creates a new URL instance, either from a serialized URL string or from an
   * existing URL object. If a base URL is provided, the input URL is resolved
   * relative to that base.
   *
   * @param input The URL string or object to create the URL from.
   * @param [base] Optional base URL (string or instance) for relative URLs.
   * @example
   * ```ts
   * import { URL } from "@nick/url";
   *
   * const url = new URL("https://example.com/path");
   *
   * const relUrl = new URL("subpage", "https://example.com/dir/");
   * ```
   */
  constructor(url: string | URL, base?: string | URL) {
    let parsed = parseURL(url.toString());

    if (base) {
      let baseParsed: ParsedURL;
      if (typeof base === "string") {
        baseParsed = parseURL(base) as ParsedURL;
        if (!baseParsed.protocol) {
          throw new TypeError("Invalid base URL");
        }
      } else {
        baseParsed = {
          protocol: base.protocol,
          username: base.username,
          password: base.password,
          hostname: base.hostname,
          port: base.port,
          pathname: base.pathname,
          search: base.search,
          hash: base.hash,
        };
      }
      // For a relative URL (or protocol-relative), resolve against the base.
      if (!parsed.protocol && !parsed.hostname) {
        parsed = resolveURL(baseParsed, parsed);
      } else if (!parsed.protocol) {
        // Protocol-relative URL: inherit base's scheme.
        parsed.protocol = baseParsed.protocol;
      }
    } else {
      if (!parsed.protocol) {
        throw new TypeError(
          "Invalid URL: relative URL without a base",
        );
      }
    }

    this.#protocol = parsed.protocol || "";
    this.#username = parsed.username || "";
    this.#password = parsed.password || "";
    this.#hostname = parsed.hostname || "";
    this.#port = parsed.port || "";
    this.#pathname = parsed.pathname || "/";
    this.#search = parsed.search || "";
    this.#hash = parsed.hash || "";
    if (this.#search && !this.#search.startsWith("?")) {
      this.#search = "?" + this.#search;
    }

    // Initialize URLSearchParams with a live update callback.
    this.#searchParams = new URLSearchParams(this.#search);
    internal.setUpdateCallback(this.#searchParams, this.#update);
  }

  #update = (search: string) => {
    this.#search = search;
    this.#serialization = this.#serialize();
  };

  #serialize(): string {
    let protocol = this.#protocol;
    if (protocol && !protocol.endsWith(":")) protocol += ":";
    let auth = "", authority = "";
    if (this.#hostname) {
      authority += "//";
      if (this.#username || this.#password) {
        auth += this.#username;
        if (this.#password) auth += ":" + this.#password;
        auth += "@";
      }
      authority += auth;
      authority += this.#hostname;
      if (this.#port) authority += ":" + this.#port;
      if (this.#port) auth += ":" + this.#port;
    }
    let pathname = this.#pathname;
    if (pathname && pathname.startsWith("//")) pathname = pathname.slice(2);
    if (pathname && !pathname.startsWith("/")) pathname = "/" + pathname;
    let search = this.#search, hash = this.#hash;
    if (search && !search.startsWith("?")) search = "?" + search;
    if (hash && !hash.startsWith("#")) hash = "#" + hash;
    return protocol + authority + pathname + search + hash;
  }

  /**
   * Gets or sets the entire URL.
   *
   * @example
   * ```ts
   * import { URL } from "@nick/url";
   *
   * const url = new URL("https://example.com");
   *
   * url.href = "https://example.org/path";
   * console.log(url.href);
   * ```
   */
  get href(): string {
    return this.toString();
  }

  /**
   * Sets the entire URL, including the scheme, host, path, query string, and
   * fragment.
   *
   * @example
   * ```ts
   * import { URL } from "@nick/url";
   *
   * const url = new URL("https://example.com");
   *
   * url.href = "https://example.org/path";
   * console.log(url.href);
   * ```
   */
  set href(value: string) {
    const newUrl = new URL((value ?? "") + "", this.origin);
    this.#protocol = newUrl.#protocol;
    this.#username = newUrl.#username;
    this.#password = newUrl.#password;
    this.#hostname = newUrl.#hostname;
    this.#port = newUrl.#port;
    this.#pathname = newUrl.#pathname;
    this.#search = newUrl.#search;
    this.#hash = newUrl.#hash;
    internal.update(this.#searchParams, this.#search.slice(1));
    this.#serialization = newUrl.#serialization;
  }

  /**
   * The origin of the URL (scheme, hostname, and port).
   *
   * @example
   * ```ts
   * import { URL } from "@nick/url";
   *
   * const url = new URL("https://example.com:8080/path");
   *
   * console.log(url.origin); // "https://example.com:8080"
   * ```
   */
  get origin(): string {
    if (!this.#protocol || !this.#hostname) return "null";
    return this.#protocol + "//" + this.host;
  }

  /**
   * The scheme of the URL, including the final ":".
   *
   * @example
   * ```ts
   * import { URL } from "@nick/url";
   *
   * const url = new URL("https://example.com");
   *
   * console.log(url.protocol); // "https:"
   * ```
   */
  get protocol(): string {
    return this.#protocol;
  }

  /**
   * Sets the scheme of the URL, including the final ":".
   *
   * @example
   * ```ts
   * import { URL } from "@nick/url";
   *
   * const url = new URL("https://example.com");
   *
   * url.protocol = "http";
   * console.log(url.protocol); // "http:"
   * ```
   */
  set protocol(value: string) {
    this.#protocol = value.endsWith(":") ? value : value + ":";
    this.#serialization = this.#serialize();
  }

  /**
   * The username specified before the host.
   *
   * @example
   * ```ts
   * import { URL } from "@nick/url";
   *
   * const url = new URL("https://user:pass@example.com");
   *
   * console.log(url.username); // "user"
   * ```
   */
  get username(): string {
    return this.#username;
  }

  /**
   * Sets the username of the URL.
   *
   * @example
   * ```ts
   * import { URL } from "@nick/url";
   *
   * const url = new URL("https://example.com");
   *
   * url.username = "user";
   * console.log(url.username); // "user"
   * ```
   */
  set username(value: string) {
    this.#username = value;
    this.#serialization = this.#serialize();
  }

  /**
   * The password specified before the host.
   *
   * @example
   * ```ts
   * import { URL } from "@nick/url";
   *
   * const url = new URL("https://user:pass@example.com");
   *
   * console.log(url.password); // "pass"
   * ```
   */
  get password(): string {
    return this.#password;
  }

  /**
   * Sets the password of the URL.
   *
   * @example
   * ```ts
   * import { URL } from "@nick/url";
   *
   * const url = new URL("https://example.com");
   *
   * url.password = "pass";
   * console.log(url.password); // "pass"
   * ```
   */
  set password(value: string) {
    this.#password = value;
    this.#serialization = this.#serialize();
  }

  /**
   * The host (hostname and port).
   *
   * @example
   * ```ts
   * import { URL } from "@nick/url";
   *
   * const url = new URL("https://example.com:8080");
   *
   * console.log(url.host); // "example.com:8080"
   * ```
   */
  get host(): string {
    return this.#hostname + (this.#port ? ":" + this.#port : "");
  }

  /**
   * Sets the host (hostname and port) of the URL.
   *
   * @example
   * ```ts
   * import { URL } from "@nick/url";
   *
   * const url = new URL("https://example.com");
   *
   * url.host = "example.org:8080";
   * console.log(url.host); // "example.org:8080"
   * ```
   */
  set host(value: string) {
    const idx = value.indexOf(":");
    if (idx !== -1) {
      this.#hostname = value.slice(0, idx);
      this.#port = value.slice(idx + 1);
    } else {
      this.#hostname = value;
      this.#port = "";
    }
    this.#serialization = this.#serialize();
  }

  /**
   * The hostname of the URL.
   *
   * @example
   * ```ts
   * import { URL } from "@nick/url";
   *
   * const url = new URL("https://example.com");
   *
   * console.log(url.hostname); // "example.com"
   * ```
   */
  get hostname(): string {
    return this.#hostname;
  }

  /**
   * Sets the hostname of the URL.
   *
   * @example
   * ```ts
   * import { URL } from "@nick/url";
   *
   * const url = new URL("https://example.com");
   *
   * url.hostname = "example.org";
   * console.log(url.hostname); // "example.org"
   * ```
   */
  set hostname(value: string) {
    this.#hostname = value;
    this.#serialization = this.#serialize();
  }

  /**
   * The port number of the URL.
   *
   * @example
   * ```ts
   * import { URL } from "@nick/url";
   *
   * const url = new URL("https://example.com:8080");
   *
   * console.log(url.port); // "8080"
   * ```
   */
  get port(): string {
    return this.#port;
  }

  /**
   * Sets the port number of the URL.
   *
   * @example
   * ```ts
   * import { URL } from "@nick/url";
   *
   * const url = new URL("https://example.com");
   *
   * url.port = "8080";
   * console.log(url.port); // "8080"
   * ```
   */
  set port(value: string | number) {
    this.#port = value.toString();
    this.#serialization = this.#serialize();
  }

  /**
   * The path of the URL.
   *
   * @example
   * ```ts
   * import { URL } from "@nick/url";
   *
   * const url = new URL("https://example.com/path/to/page");
   *
   * console.log(url.pathname); // "/path/to/page"
   * ```
   */
  get pathname(): string {
    return this.#pathname;
  }

  /**
   * Sets the path of the URL.
   *
   * @example
   * ```ts
   * import { URL } from "@nick/url";
   *
   * const url = new URL("https://example.com");
   *
   * url.pathname = "/path/to/page";
   * console.log(url.pathname); // "/path/to/page"
   * ```
   */
  set pathname(value: string) {
    this.#pathname = value.startsWith("/") ? value : "/" + value;
    this.#serialization = this.#serialize();
  }

  /**
   * The query string, including the leading "?".
   *
   * @example
   * ```ts
   * import { URL } from "@nick/url";
   *
   * const url = new URL("https://example.com?foo=bar");
   *
   * console.log(url.search); // "?foo=bar"
   * ```
   */
  get search(): string {
    const search = this.#search;
    return search.startsWith("?") ? search : "?" + search;
  }

  /**
   * Sets the query string of the URL.
   *
   * @example
   * ```ts
   * import { URL } from "@nick/url";
   *
   * const url = new URL("https://example.com");
   *
   * url.search = "?foo=bar";
   * console.log(url.search); // "?foo=bar"
   * ```
   */
  set search(value: string) {
    const search = value.startsWith("?") ? value : "?" + value;
    internal.update(this.#searchParams, this.#search = search);
    this.#serialization = this.#serialize();
  }

  /**
   * The URLSearchParams instance representing the query string.
   *
   * This is a live object – mutations update the URL's search property.
   *
   * @example
   * ```ts
   * import { URL } from "@nick/url";
   *
   * const url = new URL("https://example.com?x=1");
   *
   * url.searchParams.append("y", "2");
   * console.log(url.href);
   * ```
   */
  get searchParams(): URLSearchParams {
    return this.#searchParams;
  }

  /**
   * The fragment identifier, including the leading "#".
   *
   * @example
   * ```ts
   * import { URL } from "@nick/url";
   *
   * const url = new URL("https://example.com#section");
   *
   * console.log(url.hash); // "#section"
   * ```
   */
  get hash(): string {
    return this.#hash;
  }

  /**
   * Sets the fragment identifier of the URL.
   *
   * @example
   * ```ts
   * import { URL } from "@nick/url";
   *
   * const url = new URL("https://example.com");
   *
   * url.hash = "#section";
   * console.log(url.hash); // "#section"
   * ```
   */
  set hash(value: string) {
    this.#hash = value.startsWith("#") ? value : "#" + value;
    this.#serialization = this.#serialize();
  }

  /**
   * Returns the URL string when JSONified.
   *
   * @returns The full URL.
   */
  toJSON(): string {
    return this.#serialization ||= this.#serialize();
  }

  /**
   * Returns the full URL string.
   *
   * @returns The full URL.
   * @example
   * ```ts
   * import { URL } from "@nick/url";
   *
   * const url = new URL("https://example.com/path");
   *
   * console.log(url.toString());
   * ```
   */
  toString(): string {
    return this.#serialization ||= this.#serialize();
  }

  /** @internal */
  [kDenoInspect](
    inspect: (v: unknown, o: InspectOptions) => string,
    options: InspectOptionsStylized,
  ): string {
    const name = "URL";
    const keys = [
      "href",
      "origin",
      "protocol",
      "username",
      "password",
      "host",
      "hostname",
      "port",
      "pathname",
      "hash",
      "search",
    ] as const;

    const obj = keys.reduce(
      (o, k) => ({ ...o, [k]: this[k] }),
      {} as Record<typeof keys[number], unknown>,
    );

    if (options.depth != null && options.depth <= 0) {
      const tag = `[${name}]`;
      return options.stylize?.(tag, "special") ?? tag;
    } else {
      return `${name} ${inspect(obj, { ...options, showHidden: false })}`;
    }
  }

  /** @internal */
  [kNodeInspect](
    depth: number | null,
    options: InspectOptionsStylized,
  ): string {
    return this[kDenoInspect](
      (v, o) => {
        // deno-lint-ignore no-explicit-any
        return ($Object.keys(v as any) as (keyof this)[]).reduce(
          (s, k, i, a) => {
            const p = (v as this)[k];
            let ps = "";
            if (typeof p === "string") {
              if (o.colors) ps += `\x1b[32m`;
              ps += JSON.stringify(p ?? "");
              if (o.colors) ps += `\x1b[39m`;
            }
            s += `\n  ${k.toString()}: ${ps}`;
            if (i < a.length - 1) s += ",";
            return s;
          },
          "{",
        ) + "\n}";
      },
      { ...options, depth: depth ?? undefined },
    );
  }
}

export default URL;
