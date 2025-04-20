/**
 * This module provides a ponyfill implementation of the `URLSearchParams`
 * interface from the WHATWG URL Standard. It allows for easy manipulation of
 * query strings in URLs, including adding, deleting, and updating parameters.
 *
 * This implementation is designed to be fully compatible with the native API,
 * allowing for easy migration and drop-in replacement in environments that do
 * not support the native `URLSearchParams` interface out of the box.
 *
 * This module **does not** make any modifications to the global scope in any
 * way. It simply provides the `URLSearchParams` class as a standalone export,
 * known as a [ponyfill](https://ponyfill.com).
 *
 * If you wish to _polyfill_ the API into the global scope, you can do so by
 * importing `@nick/url/shim` with a side-effect import, like so:
 *
 * ```ts
 * import "@nick/url/shim";
 * ```
 *
 * The above import will add the `URL` and/or `URLSearchParams` classes to the
 * global scope, but only if they are not already present. You can also import
 * the `install` function from `@nick/url/install`, which performs the same
 * operation when called, allowing you to control when the polyfill is applied.
 *
 * See the [API documentation] for `@nick/url` for more information.
 *
 * [API documentation]: https://jsr.io/@nick/url/doc
 *
 * @module url-search-params
 */
import "@nick/url/shim";
import {
  $ObjectHasOwn,
  $String,
  $TypeError,
  internal,
  isIterableObject,
} from "./_internal.ts";

/**
 * Represents the possible types that can be used to initialize a new
 * {@linkcode URLSearchParams} instance.
 *
 * @category URL
 */
export type URLSearchParamsInit =
  | string
  | Iterable<string[]>
  | Record<string, string>
  | URLSearchParams;

/**
 * Iterator for the URLSearchParams class, used to iterate over key-value pairs
 * in search parameters.
 *
 * @example
 * ```ts
 * const url = new URL('https://example.org/path?a=1&b=2');
 * const queryString = url.search.substring(1); // Remove the leading '?'
 * const params = new URLSearchParams(queryString);
 * const iterator = params.entries();
 * console.log(iterator.next().value); // ['a', '1']
 * console.log(iterator.next().value); // ['b', '2']
 * ```
 *
 * @category URL
 */
export interface URLSearchParamsIterator<T>
  extends IteratorObject<T, BuiltinIteratorReturn, unknown> {
  [Symbol.iterator](): URLSearchParamsIterator<T>;
}

/**
 * Ponyfill implementation of the `URLSearchParams` interface from the WHATWG
 * URL Standard. This class allows for easy manipulation of query strings in
 * URLs, including adding, deleting, and updating parameters.
 *
 * @see https://jsr.io/@nick/url/doc/~/URLSearchParams
 * @see https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
 * @see https://url.spec.whatwg.org
 * @example
 * ```ts
 * import { URLSearchParams } from "@nick/url";
 *
 * const params = new URLSearchParams("a=1&b=2");
 * params.append("c", "3");
 *
 * console.log(params.toString()); // "a=1&b=2&c=3"
 * ```
 * @category URL Components
 */
export class URLSearchParams {
  static {
    internal.setUpdateCallback = (usp, cb) => {
      usp.#updateCallback = cb;
    };
    internal.update = (usp, search) => {
      usp.#list = [];
      usp.#parse(search);
    };
  }

  // List-based storage of key/value pairs.
  #list: [string, string][] = [];
  #updateCallback?: (search: string) => void;

  /**
   * Constructs a new `URLSearchParams` object.
   *
   * @param init - The query string or an object to initialize with.
   * @example
   * ```ts
   * import { URLSearchParams } from "@nick/url";
   *
   * const params = new URLSearchParams("foo=bar");
   * ```
   */
  constructor(init?: URLSearchParamsInit) {
    init ??= "";
    if (typeof init === "string") {
      this.#parse(init);
    } else if (init instanceof URLSearchParams) {
      this.#list = init.#list.slice();
    } else if (isIterableObject(init)) {
      let i = 0;
      for (const pair of init) {
        if (pair.length !== 2) {
          throw new TypeError(
            `Failed to construct 'URLSearchParams': item ${i} in the parameter list does not have length 2 exactly`,
          );
        }
        this.#list.push([pair[0], pair[1]]);
        i++;
      }
    } else if (typeof init === "object") {
      for (const key in init) {
        if (!$ObjectHasOwn(init, key)) continue;
        const value = init[key];
        this.#list.push([key, $String(value)]);
      }
    } else {
      throw new $TypeError(
        `Failed to construct 'URLSearchParams': The provided value '${init}' is not of type 'string'.`,
      );
    }
  }

  /**
   * Returns the number of key/value pairs.
   *
   * @returns The number of parameters.
   * @example
   * ```ts
   * import { URLSearchParams } from "@nick/url";
   *
   * const params = new URLSearchParams("foo=bar&baz=qux");
   * console.log(params.size); // 2
   * ```
   */
  get size(): number {
    return this.#list.length;
  }

  /**
   * Appends a new value onto an existing key.
   *
   * @param name - The parameter name.
   * @param value - The value to append.
   * @example
   * ```ts
   * import { URLSearchParams } from "@nick/url";
   *
   * const params = new URLSearchParams("foo=bar");
   * params.append("foo", "baz");
   * ```
   */
  append(name: string, value: string): void {
    this.#list.push([name, value]);
    this.#update();
  }

  /**
   * Deletes all values associated with a key.
   *
   * @param name - The parameter name.
   * @example
   * ```ts
   * import { URLSearchParams } from "@nick/url";
   *
   * const params = new URLSearchParams("foo=bar&baz=qux");
   *
   * params.delete("foo");
   * ```
   */
  delete(key: string): void;
  /**
   * Deletes a specific value associated with a key.
   *
   * @param name - The parameter name.
   * @param value - The specific value to delete.
   * @example
   * ```ts
   * import { URLSearchParams } from "@nick/url";
   *
   * const params = new URLSearchParams("foo=bar&foo=baz");
   *
   * params.delete("foo", "baz");
   * console.log(params.getAll("foo")); // ["bar"]
   * ```
   */
  delete(name: string, value: string): void;
  /** @internal */
  delete(name: string, value?: string): void {
    this.#list = this.#list.filter((pair) =>
      pair[0] !== name || (typeof value !== "undefined" && pair[1] !== value)
    );
    this.#update();
  }

  /**
   * Returns the first value associated with a given key.
   *
   * @param name - The parameter name.
   * @returns The first value or null.
   * @example
   * ```ts
   * import { URLSearchParams } from "@nick/url";
   *
   * const params = new URLSearchParams("foo=bar&foo=baz");
   *
   * console.log(params.get("foo")); // "bar"
   * ```
   */
  get(name: string): string | null {
    for (const [key, value] of this.#list) {
      if (key === name) return value;
    }
    return null;
  }

  /**
   * Returns all the values associated with a given key.
   *
   * @param name - The parameter name.
   * @returns An array of values.
   * @example
   * ```ts
   * import { URLSearchParams } from "@nick/url";
   *
   * const params = new URLSearchParams("foo=bar&foo=baz");
   *
   * console.log(params.getAll("foo")); // ["bar", "baz"]
   * ```
   */
  getAll(name: string): string[] {
    const result: string[] = [];
    for (const [key, value] of this.#list) {
      if (key === name) result.push(value);
    }
    return result;
  }

  /**
   * Checks if a parameter with the specified name exists.
   *
   * @param name - The parameter name.
   * @returns True if the parameter exists.
   * @example
   * ```ts
   * import { URLSearchParams } from "@nick/url";
   *
   * const params = new URLSearchParams("foo=bar");
   *
   * console.log(params.has("foo")); // true
   * console.log(params.has("baz")); // false
   * ```
   */
  has(name: string): boolean;
  /**
   * Checks if a parameter with the specified name and value exists.
   *
   * @param name - The parameter name.
   * @param value - The specific value to check.
   * @returns True if the parameter with the specified value exists.
   * @example
   * ```ts
   * import { URLSearchParams } from "@nick/url";
   *
   * const params = new URLSearchParams("foo=bar&foo=baz");
   *
   * console.log(params.has("foo", "bar")); // true
   * console.log(params.has("foo", "qux")); // false
   * ```
   */
  has(name: string, value: string): boolean;
  /** @internal */
  has(name: string, value?: string): boolean {
    return this.#list.some((pair) =>
      pair[0] === name && (typeof value === "undefined" || pair[1] === value)
    );
  }

  /**
   * Sets a new value for an existing key, or adds the key if it does not exist.
   *
   * @param name - The parameter name.
   * @param value - The new value.
   * @example
   * ```ts
   * import { URLSearchParams } from "@nick/url";
   *
   * const params = new URLSearchParams("foo=bar");
   *
   * params.set("foo", "baz");
   * console.log(params.get("foo")); // "baz"
   * ```
   */
  set(name: string, value: string): void {
    let found = false;
    for (let i = 0; i < this.#list.length; i++) {
      if (this.#list[i][0] === name) {
        if (!found) {
          this.#list[i][1] = value;
          found = true;
        } else {
          this.#list.splice(i, 1);
          i--;
        }
      }
    }
    if (!found) this.#list.push([name, value]);
    this.#update();
  }

  /**
   * Sorts all key/value pairs in place with keys in ascending order.
   *
   * @example
   * ```ts
   * import { URLSearchParams } from "@nick/url";
   *
   * const params = new URLSearchParams("b=2&a=1&c=3");
   *
   * params.sort();
   * // Order will be: a=1, b=2, c=3
   * ```
   */
  sort(): void {
    this.#list.sort((a, b) => a[0].localeCompare(b[0]));
    this.#update();
  }

  /**
   * Returns an iterator allowing iteration through all key/value pairs.
   *
   * @returns An iterator of key/value pairs.
   * @example
   * ```ts
   * import { URLSearchParams } from "@nick/url";
   *
   * const params = new URLSearchParams("foo=bar&baz=qux");
   *
   * for (const [key, value] of params) {
   *   console.log(key, value);
   * }
   * ```
   */
  *entries(): URLSearchParamsIterator<[string, string]> {
    for (const pair of this.#list) yield pair;
  }

  /**
   * Returns an iterator allowing iteration through all keys.
   *
   * @returns An iterator of keys.
   */
  *keys(): URLSearchParamsIterator<string> {
    for (const [key] of this.#list) yield key;
  }

  /**
   * Returns an iterator allowing iteration through all values.
   *
   * @returns An iterator of values.
   */
  *values(): URLSearchParamsIterator<string> {
    for (const [, value] of this.#list) yield value;
  }

  /**
   * Returns the default iterator for key/value pairs.
   *
   * @returns An iterator of key/value pairs.
   */
  [Symbol.iterator](): URLSearchParamsIterator<[string, string]> {
    return this.entries();
  }

  /**
   * Executes a provided function once per each key/value pair.
   *
   * @param callback - Function to execute for each entry.
   * @param thisArg - Value to use as `this` when executing callback.
   * @example
   * ```ts
   * import { URLSearchParams } from "@nick/url";
   *
   * const params = new URLSearchParams("foo=bar&baz=qux");
   *
   * params.forEach((value, key) => {
   *   console.log(key, value);
   * });
   * ```
   */
  forEach(
    callback: (value: string, name: string, parent: URLSearchParams) => void,
    thisArg?: unknown,
  ): void {
    for (const [key, value] of this.#list) {
      callback.call(thisArg, value, key, this);
    }
  }

  /**
   * Returns a string containing a query string suitable for use in a URL.
   *
   * @returns The query string.
   * @example
   * ```ts
   * import { URLSearchParams } from "@nick/url";
   *
   * const params = new URLSearchParams("foo=bar");
   *
   * console.log(params.toString()); // "foo=bar"
   * ```
   */
  toString(): string {
    return this.#list
      .map(([key, value]) => {
        const encodedKey = encodeURIComponent(key).replace(/%20/g, "+");
        const encodedValue = encodeURIComponent(value).replace(/%20/g, "+");
        return `${encodedKey}=${encodedValue}`;
      })
      .join("&");
  }

  /** @internal */
  #update = (): void => {
    this.#updateCallback?.(this.toString());
  };

  /** @internal */
  #parse(query: string): void {
    if (query.startsWith("?")) query = query.slice(1);
    if (query) {
      const pairs = query.split("&");
      for (const pair of pairs) {
        const idx = pair.indexOf("=");
        const key = idx === -1 ? pair : pair.slice(0, idx);
        const value = idx === -1 ? "" : pair.slice(idx + 1);
        const decodedKey = decodeURIComponent(key.replace(/\+/g, " "));
        const decodedValue = decodeURIComponent(value.replace(/\+/g, " "));
        // Use append so that the update callback is triggered.
        this.append(decodedKey, decodedValue);
      }
    }
  }
}
