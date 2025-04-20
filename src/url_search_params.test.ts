import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";

import * as ponyfill from "./url_search_params.ts";

type URLSearchParamsConstructor = typeof globalThis.URLSearchParams;

run(ponyfill.URLSearchParams);
run(globalThis.URLSearchParams, "globalThis.");

function run(URLSearchParams: URLSearchParamsConstructor, prefix = "") {
  describe(prefix + "URLSearchParams: constructor and initialization", () => {
    it("initializes with an empty string", () => {
      const usp = new URLSearchParams("");
      expect(usp.toString()).toBe("");
    });

    it("parses a query string without a leading '?'", () => {
      const usp = new URLSearchParams("a=1&b=2");
      expect(usp.get("a")).toBe("1");
      expect(usp.get("b")).toBe("2");
    });

    it("parses a query string with a leading '?'", () => {
      const usp = new URLSearchParams("?a=1&b=2");
      expect(usp.get("a")).toBe("1");
      expect(usp.get("b")).toBe("2");
    });

    it("initializes with an array of pairs", () => {
      const usp = new URLSearchParams([["a", "1"], ["b", "2"]]);
      expect(usp.get("a")).toBe("1");
      expect(usp.get("b")).toBe("2");
    });

    it("initializes with a record object with string values", () => {
      const usp = new URLSearchParams({ a: "1", b: "2" });
      expect(usp.get("a")).toBe("1");
      expect(usp.get("b")).toBe("2");
    });

    it("initializes by copying another URLSearchParams instance", () => {
      const original = new URLSearchParams("a=1&b=2");
      const copy = new URLSearchParams(original);
      expect(copy.get("a")).toBe("1");
      expect(copy.get("b")).toBe("2");
    });
  });

  describe(prefix + "URLSearchParams: core methods", () => {
    it("appends values correctly", () => {
      const usp = new URLSearchParams("a=1");
      usp.append("a", "2");
      expect(usp.getAll("a")).toEqual(["1", "2"]);
    });

    it("sets a value (overriding previous values)", () => {
      const usp = new URLSearchParams("a=1&a=2");
      usp.set("a", "3");
      expect(usp.getAll("a")).toEqual(["3"]);
    });

    it("deletes a key and all its values", () => {
      const usp = new URLSearchParams("a=1&b=2");
      usp.delete("a");
      expect(usp.has("a")).toBe(false);
      expect(usp.toString()).toBe("b=2");
    });

    it("checks key existence correctly", () => {
      const usp = new URLSearchParams("a=1");
      expect(usp.has("a")).toBe(true);
      expect(usp.has("nonexistent")).toBe(false);
    });

    it("returns null for non-existent keys", () => {
      const usp = new URLSearchParams("a=1");
      expect(usp.get("b")).toBeNull();
    });
  });

  describe(prefix + "URLSearchParams: iteration and sorting", () => {
    it("iterates over entries in insertion order", () => {
      const usp = new URLSearchParams("b=2&a=1&a=3");
      const entries = Array.from(usp.entries());
      expect(entries).toEqual([["b", "2"], ["a", "1"], ["a", "3"]]);
    });

    it("iterates over keys", () => {
      const usp = new URLSearchParams("b=2&a=1&a=3");
      const keys = Array.from(usp.keys());
      expect(keys).toEqual(["b", "a", "a"]);
    });

    it("iterates over values", () => {
      const usp = new URLSearchParams("b=2&a=1&a=3");
      const values = Array.from(usp.values());
      expect(values).toEqual(["2", "1", "3"]);
    });

    it("sorts key/value pairs in ascending order by key", () => {
      const usp = new URLSearchParams("b=2&a=1&c=3&a=4");
      usp.sort();
      // Expected order: a=1, a=4, b=2, c=3
      expect(Array.from(usp.entries())).toEqual([
        ["a", "1"],
        ["a", "4"],
        ["b", "2"],
        ["c", "3"],
      ]);
    });

    it("iterates correctly using forEach", () => {
      const usp = new URLSearchParams("a=1&b=2&a=3");
      const result: Array<[string, string]> = [];
      usp.forEach((value, key) => {
        result.push([key, value]);
      });
      expect(result).toEqual([["a", "1"], ["b", "2"], ["a", "3"]]);
    });
  });

  describe(prefix + "URLSearchParams: edge cases and encoding", () => {
    it("encodes special characters in keys and values", () => {
      const usp = new URLSearchParams();
      usp.append("a b", "c+d");
      // "a b" becomes "a%20b", "c+d" becomes "c%2Bd"
      expect(usp.toString()).toBe("a+b=c%2Bd");
    });

    it("handles empty keys and values", () => {
      const usp1 = new URLSearchParams("=value");
      expect(usp1.get("")).toBe("value");

      const usp2 = new URLSearchParams("key=");
      expect(usp2.get("key")).toBe("");
    });

    it("handles multiple '=' characters in a value", () => {
      const usp = new URLSearchParams("a=1=2");
      // Splitting should occur at the first '=' only.
      expect(usp.get("a")).toBe("1=2");
    });
  });

  // only run these for our ponyfill
  if (URLSearchParams !== globalThis.URLSearchParams) {
    // ensuring the output and behavior of our ponyfill matches the native impl
    describe(prefix + "URLSearchParams: native vs ponyfill", () => {
      it("should have the same behavior as the native implementation", () => {
        const native = new globalThis.URLSearchParams("a=1&b=2");
        const ponyfill = new URLSearchParams("a=1&b=2");

        expect(ponyfill.toString()).toBe(native.toString());
        expect(ponyfill.get("a")).toBe(native.get("a"));
        expect(ponyfill.get("b")).toBe(native.get("b"));
      });

      it("should handle edge cases similarly to the native implementation", () => {
        const native = new globalThis.URLSearchParams();
        const ponyfill = new URLSearchParams();

        ponyfill.append("key with spaces", "value with spaces");
        native.append("key with spaces", "value with spaces");

        expect(ponyfill.toString()).toBe(native.toString());
      });

      it("should handle special characters in keys and values", () => {
        const native = new globalThis.URLSearchParams();
        const ponyfill = new URLSearchParams();

        ponyfill.append("key&value", "value&key");
        native.append("key&value", "value&key");

        expect(ponyfill.toString()).toBe(native.toString());
      });

      it("should handle empty keys and values", () => {
        const native = new globalThis.URLSearchParams();
        const ponyfill = new URLSearchParams();

        ponyfill.append("", "value");
        native.append("", "value");

        ponyfill.append("key", "");
        native.append("key", "");

        expect(ponyfill.get("")).toBe(native.get(""));
        expect(ponyfill.get("key")).toBe(native.get("key"));
        expect(ponyfill.has("")).toBe(native.has(""));

        expect(ponyfill.toString()).toBe(native.toString());
      });

      it("should handle multiple '=' characters in a value", () => {
        const native = new globalThis.URLSearchParams();
        const ponyfill = new URLSearchParams();

        ponyfill.append("key", "value=1=2");
        native.append("key", "value=1=2");

        expect(ponyfill.toString()).toBe(native.toString());
      });
    });
  }
}
