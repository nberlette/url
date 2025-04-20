// deno-lint-ignore-file no-explicit-any ban-types
// import type { URLSearchParams } from "./url_search_params.ts"

export const $Error: ErrorConstructor = globalThis.Error;
export const $TypeError: TypeErrorConstructor = globalThis.TypeError;
export const $RangeError: RangeErrorConstructor = globalThis.RangeError;
export const $URIError: URIErrorConstructor = globalThis.URIError;
export const $EvalError: EvalErrorConstructor = globalThis.EvalError;
export const $ReferenceError: ReferenceErrorConstructor =
  globalThis.ReferenceError;
export const $SyntaxError: SyntaxErrorConstructor = globalThis.SyntaxError;
export const $AggregateError: AggregateErrorConstructor =
  globalThis.AggregateError;

export const $String: StringConstructor = globalThis.String;
export const $Symbol: SymbolConstructor = globalThis.Symbol;
export const $SymbolIterator: typeof Symbol.iterator = $Symbol.iterator;

export const $Function: FunctionConstructor = globalThis.Function;
export const $FunctionPrototype: Function = $Function.prototype;
const { bind, call, apply } = $FunctionPrototype;

export const uncurryThis: <T, A extends readonly any[], R = any>(
  fn: (this: T, ...args: A) => R,
  _self?: T,
) => (self: T, ...args: A) => R = bind.bind(call);

export const $setTimeout: typeof globalThis.setTimeout = globalThis.setTimeout;

export const $FunctionPrototypeBind: <T, A extends any[], B extends any[], R>(
  self: (this: T, ...args: [...A, ...B]) => R,
  thisArg: T,
  ...args: A
) => (...args: B) => R = uncurryThis(bind);
export const $FunctionPrototypeCall: <T, A extends any[], R>(
  self: (this: T, ...args: A) => R,
  thisArg: T,
  ...args: A
) => R = uncurryThis(call as CallableFunction["call"]);
export const $FunctionPrototypeApply: <T, A extends any[], R>(
  self: (this: T, ...args: A) => R,
  thisArg: T,
  args: A,
) => R = uncurryThis(apply);

export const $Object: ObjectConstructor = globalThis.Object;
export const $ObjectGetOwnPropertyDescriptor:
  typeof $Object.getOwnPropertyDescriptor = $Object.getOwnPropertyDescriptor;
export const $ObjectGetOwnPropertyDescriptors:
  typeof $Object.getOwnPropertyDescriptors =
    $Object.getOwnPropertyDescriptors || function <T extends object>(o: T) {
      const result: PropertyDescriptorMap = {};
      const keys: (string | symbol)[] = $ObjectGetOwnPropertyNames(o);
      if (typeof $ObjectGetOwnPropertySymbols === "function") {
        keys.push(...$ObjectGetOwnPropertySymbols(o));
      }
      for (const key of keys) {
        const desc = $ObjectGetOwnPropertyDescriptor(o, key);
        if (desc) result[key] = desc;
      }
      return result;
    };
export const $ObjectGetOwnPropertyNames: typeof $Object.getOwnPropertyNames =
  $Object.getOwnPropertyNames;
export const $ObjectGetOwnPropertySymbols:
  typeof $Object.getOwnPropertySymbols = $Object.getOwnPropertySymbols;
export const $ObjectGetPrototypeOf: typeof $Object.getPrototypeOf =
  $Object.getPrototypeOf;
export const $ObjectSetPrototypeOf: typeof $Object.setPrototypeOf =
  $Object.setPrototypeOf || function setPrototypeOf(o, p) {
    if (o === null) {
      throw new TypeError("Cannot set prototype of null");
    }
    try {
      o.__proto__ = p;
    } catch {
      throw new $TypeError("Cannot set prototype of non-object");
    }
    return o;
  };

let $$ObjectDefineProperty = $Object.defineProperty;

export const $ObjectDefineProperty: typeof $Object.defineProperty = function (
  o,
  p,
  d,
) {
  return $FunctionPrototypeApply($$ObjectDefineProperty, void 0, [o, p, d]);
} as typeof $Object.defineProperty;

function setODP(fn: Function | ((...args: any) => any)) {
  return $$ObjectDefineProperty = fn as typeof $Object.defineProperty;
}

export {
  /**
   * For testing purposes only, allowing us to mock the Object.defineProperty
   * variable to test the shim. Do not ever use this in production code. This
   * function has mild potential to become an attack vector if exposed prior to
   * the shim being installed.
   *
   * To further deter usage, we only export this function under a string
   * literal alias that both illustrates the danger of using it and obscures it
   * from any autocomplete or intellisense, since it is not a valid JavaScript
   * identifier.
   * @internal
   * @private
   */
  setODP as " DO NOT USE THIS! ¡PELIGRO! ACHTUNG! DANGER! ",
};

export const $ObjectDefineProperties = $Object.defineProperties ||
  function defineProperties(o, p) {
    for (const k in p) {
      if (!$ObjectHasOwn(p, k)) continue;
      const desc = $ObjectGetOwnPropertyDescriptor(p, k);
      if (desc) $ObjectDefineProperty(o, k, desc);
    }
    return o;
  };
export const $ObjectKeys: <T extends object>(o: T) => Array<keyof T> =
  $Object.keys;
export const $ObjectValues: <T extends object>(o: T) => Array<T[keyof T]> =
  $Object.values;
export const $ObjectEntries: <T extends object>(o: T) => Array<
  {
    [K in keyof T]: [K, T[K]];
  }[keyof T]
> = $Object.entries;
export const $ObjectFromEntries: <
  const T extends ReadonlyArray<[PropertyKey, unknown]>,
>(
  entries: T,
) => { [K in T[number] as K[0]]: K[1] } = $Object.fromEntries;

export const $ObjectPrototype: Object = $Object.prototype;
export const $ObjectPrototypeToString: (self: unknown) => string = uncurryThis(
  $ObjectPrototype.toString,
);
export const $ObjectHasOwn: <T extends object, K extends PropertyKey>(
  o: T,
  p: K,
) => o is T & Record<K, K extends keyof T ? T[K] : unknown> = (() => {
  if (typeof $Object.hasOwn === "function") return $Object.hasOwn as never;
  return uncurryThis($ObjectPrototype.hasOwnProperty) as never;
})();

export const $Array: ArrayConstructor = globalThis.Array;
export const $ArrayFrom: typeof $Array.from = $FunctionPrototypeBind(
  $Array.from,
  $Array,
) as typeof $Array.from;
export const $Map: MapConstructor = globalThis.Map;
export const $Set: SetConstructor = globalThis.Set;
export const $WeakMap: WeakMapConstructor = globalThis.WeakMap;
export const $WeakSet: WeakSetConstructor = globalThis.WeakSet;
export const $FinalizationRegistry: FinalizationRegistryConstructor =
  globalThis.FinalizationRegistry;
export const $WeakRef: WeakRefConstructor = globalThis.WeakRef;

type URL = import("./url.ts").URL;
type URLSearchParams = import("./url_search_params.ts").URLSearchParams;

export interface Internal {
  update: (usp: URLSearchParams, search: string) => void;
  setUpdateCallback(usp: URLSearchParams, callback: UpdateCallback): void;
}

export const internal: Internal = { __proto__: null! } as unknown as Internal;

export const kUpdate: unique symbol = Symbol.for("URLSearchParams.update");
export const kDenoInspect: unique symbol = Symbol.for("Deno.customInspect");
export const kNodeInspect: unique symbol = Symbol.for(
  "nodejs.util.inspect.custom",
);

export interface InspectOptions {
  breakLength?: number;
  colors?: boolean;
  compact?: boolean | number;
  customInspect?: boolean;
  depth?: number | null;
  getters?: boolean | "get" | "set";
  maxArrayLength?: number | null;
  maxStringLength?: number | null;
  showHidden?: boolean;
  showProxy?: boolean;
  sorted?: boolean;
}

export interface InspectOptionsStylized extends InspectOptions {
  stylize(text: string, style: string): string;
}

export type InspectCallback<T> = (
  this: T,
  depth: number | null,
  options: InspectOptionsStylized,
) => string;

export type UpdateCallback = (this: URLSearchParams, search: string) => void;

export function isIterableObject<T>(it: unknown): it is Iterable<T> & object {
  return (typeof it === "object" && it !== null && $SymbolIterator in it &&
    typeof it[$SymbolIterator] === "function");
}
/**
 * @internal represents the parsed components of a URL
 */
export interface ParsedURL {
  protocol: string; // e.g. "https:"
  username: string;
  password: string;
  hostname: string;
  port: string;
  pathname: string;
  /** includes leading "?" if non-empty */
  search: string;
  /** includes leading "#" if non-empty */
  hash: string;
}
/**
 * Removes dot-segments from a URL path per RFC 3986 Section 5.2.4.
 * @param path The URL path.
 * @returns The normalized path.
 * @internal
 */
export function normalize(path: string): string {
  const input = path.split(/[\\/]+/);
  const output: string[] = [];
  for (const segment of input) {
    if (segment === "..") {
      if (output.length > 1 || (output.length === 1 && output[0] !== "")) {
        output.pop();
      }
    } else if (segment !== "." && segment !== "") {
      output.push(segment);
    } else if (segment === "" && output.length === 0) {
      // preserve the leading empty segment for an absolute path
      output.push("");
    }
  }
  // If the last segment was "." or "..", ensure trailing slash.
  if (path.endsWith("/")) output.push("");
  // Ensure that if the input started with "/" the output does too.
  if (path.startsWith("/") && output[0] !== "") output.unshift("");
  if (!output.length) output.push("");
  return output.join("/");
}

const absoluteRegex =
  /^(?<protocol>[a-zA-Z][a-zA-Z\d+-.]*:)(?:\/\/(?:(?<username>[^:@\/?#]+)(?::(?<password>[^:@\/?#]*))?@)?(?<hostname>[^:\/?#]+)(?::(?<port>\d+))?)?(?<pathname>\/[^?#]*)?(?<search>\?[^#]*)?(?<hash>#.*)?$/;

// Protocol-relative URL (starts with "//")
const protocolRelativeRegex =
  /^\/\/(?:(?<username>[^:@\/?#]+)(?::(?<password>[^:@\/?#]*))?@)?(?<hostname>[^:\/?#]+)(?::(?<port>\d+))?(?<pathname>\/[^?#]*)?(?<search>\?[^#]*)?(?<hash>#.*)?$/;

const relativeRegex = /^(?<pathname>[^?#]*)(?<search>\?[^#]*)?(?<hash>#.*)?$/;

/**
 * Parses a URL string into its components.
 * Supports absolute, protocol-relative, and relative URLs.
 * @param input The URL string.
 * @returns An object with the parsed parts.
 * @throws {TypeError} if the URL cannot be parsed.
 * @internal
 */
export function parseURL(input: string): Partial<ParsedURL> {
  // Absolute URL (with scheme)
  let match = absoluteRegex.exec(input);
  if (match && match.groups) {
    return {
      protocol: match.groups.protocol,
      username: match.groups.username || "",
      password: match.groups.password || "",
      hostname: match.groups.hostname || "",
      port: match.groups.port || "",
      pathname: match.groups.pathname || "/",
      search: match.groups.search || "",
      hash: match.groups.hash || "",
    };
  }
  // Protocol-relative URL (starts with "//")
  match = protocolRelativeRegex.exec(input);
  if (match && match.groups) {
    return {
      protocol: "", // will be filled from the base
      username: match.groups.username || "",
      password: match.groups.password || "",
      hostname: match.groups.hostname || "",
      port: match.groups.port || "",
      pathname: match.groups.pathname || "/",
      search: match.groups.search || "",
      hash: match.groups.hash || "",
    };
  }
  // Relative URL (no scheme or authority)
  match = relativeRegex.exec(input);
  if (match && match.groups) {
    return {
      protocol: "",
      username: "",
      password: "",
      hostname: "",
      port: "",
      pathname: match.groups.pathname || "/",
      search: match.groups.search || "",
      hash: match.groups.hash || "",
    };
  }
  // Invalid URL
  throw new TypeError("Invalid URL");
}
/**
 * Resolves a relative URL against a base URL per RFC 3986 Section 5.2.
 * @param base The base URL components.
 * @param relative The relative URL components.
 * @returns The resolved absolute URL components.
 * @internal
 */
export function resolveURL(
  base: ParsedURL,
  relative: Partial<ParsedURL>,
): ParsedURL {
  // If the relative URL has a scheme, it is absolute.
  if (relative.protocol) {
    return {
      protocol: relative.protocol,
      username: relative.username || "",
      password: relative.password || "",
      hostname: relative.hostname || "",
      port: relative.port || "",
      pathname: normalize(relative.pathname || "/"),
      search: relative.search || "",
      hash: relative.hash || "",
    };
  }
  const result: ParsedURL = {
    protocol: base.protocol,
    username: base.username,
    password: base.password,
    hostname: base.hostname,
    port: base.port,
    pathname: "/",
    search: relative.search || "",
    hash: relative.hash || "",
  };

  // If the relative URL specifies an authority, use it.
  if (relative.hostname) {
    result.username = relative.username || "";
    result.password = relative.password || "";
    result.hostname = relative.hostname;
    result.port = relative.port || "";
    result.pathname = normalize(relative.pathname || "/");
  } else {
    // No authority in relative URL
    if (!relative.pathname) {
      result.pathname = base.pathname || "/";
      if (!relative.search) result.search = base.search;
    } else {
      if (relative.pathname.startsWith("/")) {
        result.pathname = normalize(relative.pathname);
      } else {
        // Merge with base path
        const basePath = base.pathname;
        const idx = basePath.lastIndexOf("/");
        const merged = (idx !== -1 ? basePath.slice(0, idx + 1) : "/") +
          relative.pathname;
        result.pathname = normalize(merged);
      }
    }
  }
  return result;
}
