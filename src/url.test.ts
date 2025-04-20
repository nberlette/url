import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import * as ponyfill from "./url.ts";

type URLConstructor = typeof globalThis.URL;

run(ponyfill.URL as URLConstructor);
run(globalThis.URL, "globalThis.");

function run(URL: URLConstructor, prefix = "") {
  describe(prefix + "URL: constructor and basic parsing", () => {
    it("parses a full URL with all components", () => {
      const url = new URL(
        "https://user:pass@example.com:8080/path?foo=bar#hash",
      );
      expect(url.protocol).toBe("https:");
      expect(url.username).toBe("user");
      expect(url.password).toBe("pass");
      expect(url.hostname).toBe("example.com");
      expect(url.port).toBe("8080");
      expect(url.pathname).toBe("/path");
      expect(url.search).toBe("?foo=bar");
      expect(url.hash).toBe("#hash");
      expect(url.origin).toBe("https://example.com:8080");
    });

    it("throws on relative URL without a base", () => {
      let errorCaught = false;
      try {
        new URL("/path");
      } catch {
        errorCaught = true;
      }
      expect(errorCaught).toBe(true);
    });

    it("resolves relative URLs when provided a base", () => {
      const url = new URL("/newpath?x=1", "https://example.com/oldpath");
      expect(url.href).toBe("https://example.com/newpath?x=1");
    });

    it("handles protocol-relative URLs with a base", () => {
      const url = new URL("//example.com/path", "https://base.com");
      expect(url.href).toBe("https://example.com/path");
    });
  });

  describe(prefix + "URL: static methods", () => {
    it("canParse returns true for a valid URL and false for an invalid one", () => {
      expect(URL.canParse("https://example.com")).toBe(true);
      expect(URL.canParse("invalid-url")).toBe(false);
    });

    it("parse returns a URL instance for a valid URL and null for an invalid one", () => {
      const parsed = URL.parse("https://example.com");
      expect(parsed).not.toBeNull();
      const invalid = URL.parse("invalid-url");
      expect(invalid).toBeNull();
    });

    it("createObjectURL produces a blob URL", () => {
      const blob = new Blob(["test"], { type: "text/plain" });
      const blobUrl = URL.createObjectURL(blob);
      expect(blobUrl.startsWith("blob:")).toBe(true);
    });

    it("revokeObjectURL does not throw an error", () => {
      const blob = new Blob(["test"], { type: "text/plain" });
      const blobUrl = URL.createObjectURL(blob);
      expect(() => {
        URL.revokeObjectURL(blobUrl);
      }).not.toThrow();
    });
  });

  describe(prefix + "URL: property setters and dynamic updates", () => {
    it("updates the search property when searchParams are mutated", () => {
      const url = new URL("https://example.com?foo=bar");
      url.searchParams.append("baz", "qux");
      // Since search order is not guaranteed, verify the updated string contains the new parameter.
      expect(url.search.includes("baz=qux")).toBe(true);
    });

    it("updates all components when setting href", () => {
      const url = new URL("https://example.com/path");
      url.href = "http://user:secret@another.com:9090/newpath?x=1#section";
      expect(url.protocol).toBe("http:");
      expect(url.username).toBe("user");
      expect(url.password).toBe("secret");
      expect(url.hostname).toBe("another.com");
      expect(url.port).toBe("9090");
      expect(url.pathname).toBe("/newpath");
      expect(url.search).toBe("?x=1");
      expect(url.hash).toBe("#section");
    });

    it("normalizes protocol to end with ':'", () => {
      const url = new URL("https://example.com");
      url.protocol = "ftp";
      expect(url.protocol).toBe("ftp:");
    });

    it("ensures pathname starts with '/'", () => {
      const url = new URL("https://example.com");
      url.pathname = "page";
      expect(url.pathname).toBe("/page");
    });

    it("normalizes search to start with '?'", () => {
      const url = new URL("https://example.com");
      url.search = "param=1";
      expect(url.search).toBe("?param=1");
    });

    it("normalizes hash to start with '#'", () => {
      const url = new URL("https://example.com");
      url.hash = "section";
      expect(url.hash).toBe("#section");
    });

    it("setting host updates both hostname and port", () => {
      const url = new URL("https://example.com");
      url.host = "another.com:8080";
      expect(url.hostname).toBe("another.com");
      expect(url.port).toBe("8080");
    });
  });

  describe(prefix + "URL: serialization", () => {
    it("toString returns the full serialized URL", () => {
      const url = new URL("https://example.com/path?query=val#frag");
      expect(url.toString()).toBe("https://example.com/path?query=val#frag");
    });

    it("toJSON returns the same string as toString", () => {
      const url = new URL("https://example.com/path?query=val#frag");
      expect(url.toJSON()).toBe(url.toString());
    });
  });
}
