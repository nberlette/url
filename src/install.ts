/**
 * This module provides a single {@linkcode install} function to gracefully
 * polyfill the global `URL` and `URLSearchParams` functions if they are not
 * already present in the environment's global scope.
 *
 * It checks for the existence of these functions and installs them if needed.
 * If both functions are already available, a "skipped" result is returned. On
 * success, a "success" result containing references to the installed functions
 * is returned. If an error occurs during the installation process, a "failure"
 * result is returned.
 *
 * @example
 * ```ts
 * import install from "@nick/url/install";
 *
 * const result = install();
 *
 * if (result.type === "success") {
 *   console.log("Global URL and URLSearchParams polyfilled successfully.");
 * } else if (result.type === "skipped") {
 *   console.log("Global URL and URLSearchParams are already installed.");
 * } else {
 *   console.error("Failed to install:", result.error);
 * }
 * ```
 * @module install
 */
import { $ObjectDefineProperty } from "./_internal.ts";
import { URL } from "./url.ts";
import { URLSearchParams } from "./url_search_params.ts";

/**
 * Represents a successful polyfill installation.
 *
 * @template T - The type of the installation data.
 *
 * @category Types
 * @tags Result, Success
 */
export interface Success<T> {
  readonly type: "success";
  readonly data: T;
}

/**
 * Represents a skipped installation if the global functions are already
 * present.
 *
 * @category Types
 * @tags Result, Skipped
 */
export interface Skipped {
  readonly type: "skipped";
  readonly info?: string;
}

/**
 * Represents a failed installation attempt, with an associated error.
 *
 * @category Types
 * @tags Result, Failure
 */
export interface Failure {
  readonly type: "failure";
  readonly error: unknown;
}

/**
 * The data returned upon successful installation contains references to the
 * installed functions.
 *
 * @category Types
 * @tags Result, Data
 */
export type Data = {
  readonly URL?: typeof URL;
  readonly URLSearchParams?: typeof URLSearchParams;
};

/**
 * Represents the result of the installation process.
 *
 * @category Types
 * @tags Result
 */
export type Result<T extends Data = Data> = Success<T> | Skipped | Failure;

/**
 * Installs the global `URL` and/or `URLSearchParams` functions if they are not
 * already available in the current environment's global scope.
 *
 * On success, returns {@linkcode Success} with the installed functions. If
 * both functions are already available, returns a {@linkcode Skipped} result.
 * If an error occurs, returns a {@linkcode Failure} result.
 *
 * @returns The {@linkcode Result} of the polyfill install operation.
 * @example
 * ```ts
 * import install from "@nick/url/install";
 *
 * if (typeof URL !== "function") {
 *   const result = install();
 *   if (result.type === "success") {
 *     console.log("URL APIs polyfilled successfully.");
 *   } else if (result.type === "failure") {
 *     console.error("Failed to install URL APIs:", result.error);
 *   } else {
 *     console.log("URL APIs already installed.");
 *   }
 * }
 * ```
 */
export function installURL(): Result<{ URL: typeof URL | undefined }> {
  const data = { URL: undefined as typeof URL | undefined };

  // Install global URL if not already available
  if (typeof globalThis.URL === "function") {
    return {
      type: "skipped",
      info: "URL is already installed.",
    };
  } else {
    try {
      $ObjectDefineProperty(URL, "name", {
        value: "URL",
        configurable: true,
      });

      $ObjectDefineProperty(globalThis, "URL", {
        value: URL,
        configurable: true,
        writable: true,
        enumerable: false,
      });

      data.URL = URL;
    } catch (error) {
      return { type: "failure", error };
    }
  }

  return { type: "success", data };
}

export function installURLSearchParams(): Result {
  const data = {
    URLSearchParams: undefined as typeof URLSearchParams | undefined,
  };

  // Install global URLSearchParams if not already available
  if (typeof globalThis.URLSearchParams === "function") {
    return {
      type: "skipped",
      info: "URLSearchParams is already installed.",
    };
  } else {
    try {
      $ObjectDefineProperty(URLSearchParams, "name", {
        value: "URLSearchParams",
        configurable: true,
      });
      $ObjectDefineProperty(globalThis, "URLSearchParams", {
        value: URLSearchParams,
        configurable: true,
        writable: true,
        enumerable: false,
      });
      data.URLSearchParams = URLSearchParams;
    } catch (error) {
      return { type: "failure", error };
    }
  }

  return { type: "success", data };
}

export function install(): Result {
  const a = installURL();
  if (a.type === "failure") return a;

  const b = installURLSearchParams();
  if (b.type === "failure") return b;

  if (a.type === "skipped" && b.type === "skipped") {
    return {
      type: "skipped",
      info: "URL and URLSearchParams are both already installed.",
    };
  }

  return {
    type: "success",
    data: {
      ...(a.type === "success" && a.data),
      ...(b.type === "success" && b.data),
    },
  };
}

export default install;
