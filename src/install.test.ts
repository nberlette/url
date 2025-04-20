import { afterEach, describe, it } from "@std/testing/bdd";
import { expect, fn } from "@std/expect";
import { install, installURL, installURLSearchParams } from "./install.ts";
import { assert } from "@std/assert";
import * as internal from "./_internal.ts";

const setObjectDefineProperty =
  internal[" DO NOT USE THIS! ¡PELIGRO! ACHTUNG! DANGER! "];
const globalURL = globalThis.URL;
const globalURLSearchParams = globalThis.URLSearchParams;
// deno-lint-ignore no-explicit-any
const _globalThis = globalThis as any;

afterEach(() => {
  _globalThis.URL = globalURL;
  _globalThis.URLSearchParams = globalURLSearchParams;
});

describe("installURL", () => {
  it("should install URL if not already available", () => {
    delete _globalThis.URL;
    const result = installURL();
    assert(
      result.type === "success" && _globalThis.URL,
      "Install should be successful",
    );
    assert(
      _globalThis.URL === result.data.URL,
      "Should install URL on globalThis",
    );
    assert(
      result.data.URL !== globalURL,
      "Should return a reference to the Ponyfill URL instance",
    );
  });

  it("should skip installation if URL is already available", () => {
    const result = installURL();
    assert(result.type === "skipped", "Install should be skipped");
    assert(
      _globalThis.URL === globalURL,
      "Should not modify the existing URL on globalThis",
    );
  });

  it("should handle errors during installation", () => {
    delete _globalThis.URL;
    const originalDefineProperty = internal.$Object.defineProperty;

    try {
      // mimic the behavior of a frozen globalThis object
      const error = new TypeError("Cannot redefine property: URL");
      const defineProperty = fn((...args: unknown[]) => {
        if (args[1] === "URL") throw error;
      });
      setObjectDefineProperty(defineProperty);

      const result = installURL();
      assert(
        result.type === "failure",
        "Installation should fail on non-configurable property",
      );
      expect(result.error, "Should contain the thrown error").toBe(error);
      // once for the 'name' property on URL (for minification)
      // once for the 'URL' property on globalThis
      expect(defineProperty).toBeCalledTimes(2);
    } finally {
      // restore the original defineProperty method
      setObjectDefineProperty(originalDefineProperty);
    }
  });
});

describe("installURLSearchParams", () => {
  it("should install URLSearchParams if not already available", () => {
    delete _globalThis.URLSearchParams;
    const result = installURLSearchParams();
    assert(
      result.type === "success" && _globalThis.URLSearchParams,
      "Install should be successful",
    );
    assert(
      _globalThis.URLSearchParams === result.data.URLSearchParams,
      "Should install URL on globalThis",
    );
    assert(
      result.data.URLSearchParams !== globalURLSearchParams,
      "Should return a reference to the Ponyfill URL instance",
    );
  });

  it("should skip installation if URL is already available", () => {
    const result = installURLSearchParams();
    assert(result.type === "skipped", "Install should be skipped");
    assert(
      _globalThis.URLSearchParams === globalURLSearchParams,
      "Should not modify the existing URL on globalThis",
    );
  });

  it("should handle errors during installation", () => {
    delete _globalThis.URLSearchParams;
    const originalDefineProperty = internal.$Object.defineProperty;

    try {
      // mimic the behavior of a frozen globalThis object
      const error = new TypeError("Cannot redefine property: URL");
      const defineProperty = fn((...args: unknown[]) => {
        if (args[1] === "URLSearchParams") throw error;
      });
      setObjectDefineProperty(defineProperty);

      const result = installURLSearchParams();
      assert(
        result.type === "failure",
        "Installation should fail on non-configurable property",
      );
      expect(result.error, "Should contain the thrown error").toBe(error);
      // once for the 'name' property on URL (for minification)
      // once for the 'URL' property on globalThis
      expect(defineProperty).toBeCalledTimes(2);
    } finally {
      // restore the original defineProperty method
      setObjectDefineProperty(originalDefineProperty);
    }
  });
});

describe("install", () => {
  it("should install both URL and URLSearchParams", () => {
    delete _globalThis.URL;
    delete _globalThis.URLSearchParams;

    const result = install();
    assert(result.type === "success", "Install should be successful");
    assert(_globalThis.URL, "URL should be installed");
    assert(_globalThis.URLSearchParams, "URLSearchParams should be installed");
  });

  it("should skip installation if both are already available", () => {
    const result = install();
    assert(result.type === "skipped", "Install should be skipped");
  });

  it("should handle errors during installation", () => {
    delete _globalThis.URL;
    delete _globalThis.URLSearchParams;
    const originalDefineProperty = internal.$Object.defineProperty;

    try {
      // mimic the behavior of a frozen globalThis object
      const error = new TypeError("Cannot redefine property: URL");
      const defineProperty = fn(function (...args: unknown[]) {
        if (args[1] === "URL") throw error;
      });
      setObjectDefineProperty(defineProperty);

      const result = install();

      assert(
        result.type === "failure",
        "Installation should fail on non-configurable property",
      );

      expect(result.error, "Should contain the thrown error").toBe(error);

      // once for the 'name' property on URL (for minification)
      // once for the 'name' property on URLSearchParams (for minification)
      expect(defineProperty).toBeCalledTimes(2);
    } finally {
      // restore the original defineProperty method
      setObjectDefineProperty(originalDefineProperty);
    }
  });
});
