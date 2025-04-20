<div align="center">

<h1>

<picture alt="@nick/url" title="@nick/url">
  <source type="image/svg+xml" srcset="./.github/assets/logo.svg" />
  <source type="image/png" srcset="./.github/assets/logo@2x.png" media="(device-pixel-ratio: 2)" />
  <source type="image/png" srcset="./.github/assets/logo@3x.png" media="(device-pixel-ratio: 3)" />
  <img src="./.github/assets/logo.svg" alt="@nick/url" width="40%" height="auto" />
</picture>

</h1>

**Portable ponyfills (and polyfills) for `URL` and `URLSearchParams`.**

[![][badge-jsr-score]][JSR] [![][badge-jsr-pkg]][JSR]

</div>

---

## Overview

This package provides [ponyfill]s for the Web APIs `URL` and `URLSearchParams`.

For those who _do_ need polyfills for these APIs, the `@nick/url/shim` module
can be used with a side-effect import to automatically add the `URL` and/or
`URLSearchParams` APIs if they are not already defined in the global scope.

Alternatively, the shimming can be performed on demand, by using the `install`,
`installURL`, or `installURLSearchParams` functions of the `./install` module.


> Ponyfills are the recommended alternative to the typical
> polyfill approach, as they do not modify the global scope. Instead, users can
> import the ponyfilled APIs directly into their code on an as-needed basis.
>
> **[↪︎ Click here for a breakdown of ponyfills by Sindre Sorhus][ponyfill]**
>
---

## Install

#### [Deno]

```sh
# deno
deno add jsr:@nick/url
```

#### [Bun]

```sh
# bun
bunx jsr add @nick/url
```

#### [PNPM]

```sh
# pnpm
pnpm dlx jsr add @nick/url
```

#### [Yarn]

```sh
# yarn
yarn dlx jsr add @nick/url
```

#### [NPM]

```sh
# npm
npx -y jsr add @nick/url
```

> [!NOTE]
>
> See the **[CDN section]** for details on using `@nick/url` with a CDN.

[Deno]: https://deno.com "Deno is a secure runtime for JavaScript and TypeScript"
[Bun]: https://bun.sh "Bun is a fast all-in-one JavaScript runtime"
[PNPM]: https://pnpm.io "pnpm is a fast, disk space efficient package manager"
[Yarn]: https://yarnpkg.com "Yarn is a package manager for JavaScript"
[NPM]: https://www.npmjs.com "npm is a package manager for JavaScript"
[CDN section]: #cdn "View the CDN section"

---

## Usage

The recommended usage for this package is to import the [ponyfill] directly in
your code and use them as needed.

### [Ponyfill]

```ts
import { URL, URLSearchParams } from "@nick/url";

// Create and manipulate a URL instance
const url = new URL("https://user:pass@example.com:8080/path?foo=bar#hash");
console.log(url.protocol); // "https:"
console.log(url.hostname); // "example.com"

// Update and serialize search parameters
const params = new URLSearchParams(url.search);
params.append("baz", "qux");
url.search = params.toString();
console.log(url.href); // Updated URL with new search parameters
```

### Polyfill

For environments without global `URL` or `URLSearchParams` support, this package
offers two routes to polyfilling these APIs:

1. **[Automatic Shim](#shim-automatic)**
   - Installs `URL` and/or `URLSearchParams` in the global scope as needed.
   - Convenient for quick usage via a side-effect import.
   - Uses the `install` function under the hood.
2. **[Manual Install](#install-manual)**
   - Provides three `install[...]` functions to polyfill at a specific time.
   - Allows for more control over when the polyfill is applied.
   - Only polyfills if the global implementations are missing.
   - [`install`] installs both the `URL` and `URLSearchParams` APIs.
   - [`installURLSearchParams`] installs only `URLSearchParams`, if needed.
   - [`installURL`] installs only `URL`, if needed.

[`install`]: #install
[`installURL`]: #installurl
[`installURLSearchParams`]: #installurlsearchparams

#### Shim (automatic)

The automatic shim installs global `URL` and `URLSearchParams` if they are not
already defined.

```ts
import "@nick/url/shim"; // side-effect import

// Global URL and URLSearchParams will now be available if missing.
const url = new URL("https://example.com");
console.assert(url instanceof URL);

const params = new URLSearchParams("foo=bar");
console.assert(params instanceof URLSearchParams);
```

> [!NOTE]
>
> The `@nick/url/shim` module uses the `install` function under the hood, and is
> primarily provided for convenience.

#### Install (manual)

Use the following functions to explicitly polyfill the global scope:

```ts
import {
  install,
  installURL,
  installURLSearchParams,
} from "@nick/url/install";

// Polyfill both URL and URLSearchParams if missing
const result = install();
console.log(result.type); // either "success", "skipped", or "failure"

if (result.type === "success") {
  // result.data contains the installed APIs (URL and/or URLSearchParams)
  console.log(result.data);
}

// Polyfill only URL
const urlResult = installURL();
console.log(urlResult);

// Polyfill only URLSearchParams
const paramsResult = installURLSearchParams();
console.log(paramsResult);
```

> [!TIP]
>
> The `install` function is the recommended way to polyfill both APIs in one
> call, while `installURL` and `installURLSearchParams` give more control over
> which API is polyfilled.
>
> In all cases, the functions will only polyfill the APIs if they are not
> already defined in the global scope. Otherwise it returns a "skipped" result.

### CDN

For environments that support ES modules, you can use the package directly from
a CDN that supports the [JSR] registry, such as [esm.sh].

```html
<script type="module">
  import { URL, URLSearchParams } from "https://esm.sh/jsr/@nick/url";
  // Use the imported URL and URLSearchParams as needed
  const url = new URL("https://example.com");
</script>
```

```html
<script type="module">
  import "https://esm.sh/jsr/@nick/url/shim"; // side-effect import

  // Global URL and URLSearchParams will now be available if missing.
  // what browser wouldn't have URL support by now, but hey.. ̆\_(ツ)_̆/
  const url = new URL("https://example.com");
</script>
```

[esm.sh]: https://esm.sh

---

##### `install()`

```ts ignore
install(): InstallResult;
```

The `install()` function will polyfill both the `URL` and `URLSearchParams`
globals if either one is missing. It returns an object of type
`InstallResult`—`urlInstalled` will be `true` if `URL` was added by this call,
and `searchParamsInstalled` will be `true` if `URLSearchParams` was added.

##### `installURL()`

```ts ignore
installURL(): boolean;
```

The `installURL()` function focuses solely on polyfilling the `URL` global.
When invoked, it checks if `URL` is already defined; if not, it installs the
ponyfill and returns `true`. If `URL` was already present, it does nothing and
returns `false`.

##### `installURLSearchParams()`

```ts ignore
installURLSearchParams(): boolean;
```

The `installURLSearchParams()` function is dedicated to polyfilling only
`URLSearchParams`. It returns `true` if it installs the ponyfill because
`URLSearchParams` was not defined, or `false` if the global implementation
already existed.

---

## API

### `URL`

A ponyfill/polyfill for the standard URL interface.

#### Example

```ts
import { URL } from "@nick/url";

const url = new URL("https://example.com/path?foo=bar#section");
console.log(url.protocol); // "https:"
```

#### Constructor

```ts ignore
new URL(input: string | URL, base?: string | URL)
```

#### Properties

##### `href`

The complete URL string.

##### `origin`

The scheme, hostname, and port.

##### `protocol`

The URL scheme, normalized to include `:`.

##### `username`

User authentication credential: username.

##### `password`

User authentication credential: password.

##### `host`

The hostname and port.

##### `hostname`

The domain name.

##### `port`

The port number.

##### `pathname`

The path component.

##### `search`

The query string (normalized to begin with `?`).

##### `hash`

The fragment identifier (normalized to begin with `#`).

##### `searchParams`

A live instance of `URLSearchParams` linked to the query string.

#### Static Methods

##### `canParse`

```ts ignore
static canParse(url: string | URL, base?: string | URL): boolean;
```

Check if the input can be parsed into a `URL` instance.

##### `parse`

```ts ignore
static parse(url: string | URL, base?: string | URL): URL | null;
```

Parse the input into a `URL` instance or return `null` if invalid.

##### `createObjectURL`

```ts ignore
static createObjectURL(blob: Blob): string;
```

Create an object URL for a given `Blob`.

> [!WARNING]
>
> This method is a stub implementation, since it is not possible to create
> or revoke object URLs from purely userland JavaScript code. It will not
> throw any errors, but it will not actually perform the intended operation.

##### `revokeObjectURL`

```ts ignore
static revokeObjectURL(url: string): void;
```

Release an object URL previously created with `createObjectURL`.

> [!WARNING]
>
> This method is a stub implementation, since it is not possible to create
> or revoke object URLs from purely userland JavaScript code. It will not
> throw any errors, but it will not actually perform the intended operation.

[URL documentation]: https://developer.mozilla.org/en-US/docs/Web/API/URL "View the URL documentation on MDN"

---

### `URLSearchParams`

Spec-compliant ponyfill implementation of the `URLSearchParams` interface.


> [!NOTE]
>
> See the **[URL documentation]** for more details on this API.

#### Example

```ts
import { URLSearchParams } from "@nick/url";

const params = new URLSearchParams("a=1&b=2");

params.append("c", "3");

console.log(params.toString()); // "a=1&b=2&c=3"
```

> [!NOTE]
>
> See the **[URLSearchParams documentation]** for more details on this API.

#### Constructor

```ts ignore
new URLSearchParams(
  init?: string | string[][] | Record<string, string> | URLSearchParams
)
```

#### Methods

##### `append`

```ts ignore
append(name: string, value: string): void;
```

Append a new value for the given key. If the key already exists, the new value
is added to the existing values, which can be retrieved using `getAll`.

> No existing values will be modified or removed by this method.

##### `delete`

###### Overload 1 (single argument)

Remove all values associated with the key. If the key does not exist, this
method does nothing.

```ts ignore
delete(name: string): void;
```

###### Overload 2 (two arguments)

Removes a specific value from the given key. If the key does not exist, this
method does nothing. All other values associated with the key are left as-is.


```ts ignore
delete(name: string, value: string): void;
```

##### `get`

Retrieve the first value for the key. If the key does not exist, this method
returns `null`. If the key exists but has no values, this method returns an
empty string.

```ts ignore
get(name: string): string | null;
```

##### `getAll`

Retrieve all values for the key. If the key does not exist, or exists but
has no values, this method returns an empty array.

```ts ignore
getAll(name: string): string[];
```

##### `has`

###### Overload 1 (single argument)

Check if the key exists. If the key does not exist, this method returns
`false`. If the key exists but has no values, this method returns `true`.

```ts ignore
has(name: string): boolean;
```

###### Overload 2 (two arguments)

Check if a key exists, and if it has a specific value. Returns `true` only if
both of those conditions are met. Otherwise, this method returns `false`.

```ts ignore
has(name: string, value: string): boolean;
```

##### `set`

Set the value for the key, replacing any existing values that may be present. If
the key does not exist, this method creates a new key/value pair.

```ts ignore
set(name: string, value: string): void;
```

##### `sort`

Sort all key/value pairs in ascending order. This method modifies the order of
the key/value pairs in the `URLSearchParams` instance (i.e. it is mutative).

> Unlike `Array.prototype.sort`, no arguments are accepted and nothing is
> returned from this method. It simply sorts the key/value pairs in place.

```ts ignore
sort(): void;
```

##### `keys`

Returns an iterator that iterates over the keys in the `URLSearchParams`
instance, in the order in which they were added.

```ts ignore
keys(): URLSearchParamsIterator<string>;
```

##### `values`

Returns an iterator that iterates over the values in the `URLSearchParams`
instance, in the order in which they were added.

```ts ignore
values(): URLSearchParamsIterator<string>;
```

##### `entries`

Returns an iterator that iterates over the key/value pairs in the
`URLSearchParams` instance, in the order in which they were added.

```ts ignore
entries(): URLSearchParamsIterator<[string, string]>;
```

##### `forEach`

Calls the provided callback function once for each key/value pair in the
`URLSearchParams` instance, in the order in which they were added.

The callback function is invoked with three arguments: the current value, the
key of the current key/value pair, and the `URLSearchParams` instance itself.
An optional `thisArg` parameter can be provided to set the value of `this` in
the callback function (default is `undefined`).

```ts ignore
forEach<This = void>(
  cb: (this: This, value: string, key: string, params: URLSearchParams) => void,
  thisArg?: This
): void;
```

##### `toString`

Returns a string representation of the `URLSearchParams` instance, serializing the
parameters in the order in which they were added, with `&` separating each pair, and
`=` separating the key and value.

```ts ignore
toString(): string;
```

##### `toJSON`

This is an alias for [`toString`](#toString), provided for spec compatibility. This
is called by the semantics of the native `JSON.stringify` API, allowing `URLSearchParams` instances to be serialized to JSON.

```ts ignore
toJSON(): string;
```

##### `[Symbol.iterator]`

This is an alias for the [`entries`](#entries) method. It returns an iterator over
the entries in the `URLSearchParams` instance, in the order in which they were added.
This is called internally by the semantics of the native `for...of` loop and other
ES2015+ iteration APIs (e.g. spread operators, `Array.from`, etc.).

```ts ignore
[Symbol.iterator](): URLSearchParamsIterator<[string, string]>;
```

[URLSearchParams documentation]: https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams "View the URLSearchParams documentation on MDN"

---

## Contributing

Contributions are always welcome! Before [submitting a pull request], please
[open an issue] to discuss your ideas or report bugs. This ensures that
contributions align with the project's goals.

For more details, see the [contributing guidelines].

---

<div align="center">

**[MIT] © [Nicholas Berlette]. All rights reserved.**

<small>

[Github] · [Issues] · [Docs] · [Contribute]

</small>

[![][badge-jsr]][JSR]

</div>

[JSR]: https://jsr.io/@nick/url "View @nick/url on JSR"
[Docs]: https://jsr.io/@nick/url/doc "View the API documentation for @nick/url on JSR"
[open an issue]: https://github.com/nberlette/url/issues/new "Report a bug or request a feature"
[contributing guidelines]: https://github.com/nberlette/url/blob/main/.github/CONTRIBUTING.md "Read the contributing guidelines"
[submitting a pull request]: https://github.com/nberlette/url/compare "Submit a pull request"
[badge-jsr]: https://jsr.io/badges/@nick?style=for-the-badge "View all of @nick's packages on JSR"
[badge-jsr-pkg]: https://jsr.io/badges/@nick/url?style=for-the-badge "View @nick/url on JSR"
[badge-jsr-score]: https://jsr.io/badges/@nick/url/score?style=for-the-badge "View the score for @nick/url on JSR"
[MIT]: https://nick.mit-license.org "MIT © Nicholas Berlette. All rights reserved."
[Nicholas Berlette]: https://github.com/nberlette "Follow Nicholas Berlette on GitHub"
[Github]: https://github.com/nberlette/url "View the @nick/url repository on GitHub"
[Issues]: https://github.com/nberlette/url/issues "Report issues for @nick/url"
[Contribute]: https://github.com/nberlette/url/blob/main/.github/CONTRIBUTING.md "Contribute to @nick/url"
[ponyfill]: https://ponyfill.com "Learn more about ponyfills"
