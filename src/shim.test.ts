import { afterEach, describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";

// deno-lint-ignore no-explicit-any
const _globalThis = globalThis as any;
const originalURL = _globalThis.URL;
const originalURLSearchParams = _globalThis.URLSearchParams;

function clearGlobals() {
  delete _globalThis.URL;
  delete _globalThis.URLSearchParams;
}

describe("shim side-effect import", () => {
  afterEach(() => {
    _globalThis.URL = originalURL;
    _globalThis.URLSearchParams = originalURLSearchParams;
  });

  it("polyfills URL and URLSearchParams if missing", async () => {
    clearGlobals();
    // Dynamically import shim.ts for side-effect
    await import("./shim.ts?test=1");
    expect(typeof _globalThis.URL).toBe("function");
    expect(typeof _globalThis.URLSearchParams).toBe("function");
    // Check that the polyfill works
    const url = new _globalThis.URL("https://example.com/?a=1#b");
    expect(url.hostname).toBe("example.com");
    const usp = new _globalThis.URLSearchParams("a=1&b=2");
    expect(usp.get("b")).toBe("2");
  });

  it("does not overwrite existing URL and URLSearchParams", async () => {
    _globalThis.URL = function CustomURL() {};
    _globalThis.URLSearchParams = function CustomURLSearchParams() {};
    await import("./shim.ts?test=2");
    expect(_globalThis.URL).toBeDefined();
    expect(_globalThis.URLSearchParams).toBeDefined();
    expect(_globalThis.URL.name).toBe("CustomURL");
    expect(_globalThis.URLSearchParams.name).toBe("CustomURLSearchParams");
  });

  it("is safe to import multiple times", async () => {
    clearGlobals();
    await import("./shim.ts?test=3");
    await import("./shim.ts?test=4");
    expect(typeof _globalThis.URL).toBe("function");
    expect(typeof _globalThis.URLSearchParams).toBe("function");
  });
});
