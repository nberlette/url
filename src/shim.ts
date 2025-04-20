/**
 * This module automatically polyfills the global `URL` and `URLSearchParams`
 * functions if they are not already present. It is intended as a side-effect
 * import.
 *
 * @example
 * ```ts
 * import "@nick/url/shim";
 *
 * const url = new URL("https://example.com");
 * console.assert(url instanceof URL);
 * ```
 * @module shim
 */
import "./shim.d.ts";
import { install } from "./install.ts";

install();
