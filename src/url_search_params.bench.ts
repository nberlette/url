import { URLSearchParams } from "./url_search_params.ts";

const subjects = [
  { name: "URLSearchParams", URLSearchParams },
  {
    name: "globalThis.URLSearchParams",
    URLSearchParams: globalThis.URLSearchParams,
  },
] as const;

for (const { name, URLSearchParams } of subjects) {
  // Benchmark URLSearchParams construction from a query string.
  Deno.bench({
    group: "URLSearchParams.constructor (string)",
    name,
    warmup: 100,
    baseline: URLSearchParams !== globalThis.URLSearchParams,
    fn: () => {
      new URLSearchParams("a=1&b=2&c=3&d=4&e=5&f=6&g=7&h=8&i=9&j=10");
    },
  });

  // Benchmark URLSearchParams construction from an array of pairs.
  Deno.bench({
    group: "URLSearchParams.constructor (array)",
    name,
    warmup: 100,
    baseline: URLSearchParams !== globalThis.URLSearchParams,
    fn: () => {
      new URLSearchParams([
        ["a", "1"],
        ["b", "2"],
        ["c", "3"],
        ["d", "4"],
        ["e", "5"],
      ]);
    },
  });

  // Benchmark URLSearchParams construction from an object.
  Deno.bench({
    group: "URLSearchParams.constructor (object)",
    name,
    warmup: 100,
    baseline: URLSearchParams !== globalThis.URLSearchParams,
    fn: () => {
      new URLSearchParams({ a: "1", b: "2", c: "3", d: "4", e: "5" });
    },
  });

  // Benchmark appending many values.
  Deno.bench({
    group: "URLSearchParams.append",
    name,
    warmup: 100,
    baseline: URLSearchParams !== globalThis.URLSearchParams,
    fn: () => {
      const usp = new URLSearchParams();
      for (let i = 0; i < 100; i++) {
        usp.append("key" + i, "value" + i);
      }
    },
  });

  // Benchmark setting (overriding) existing keys.
  Deno.bench({
    group: "URLSearchParams.set",
    name,
    warmup: 100,
    baseline: URLSearchParams !== globalThis.URLSearchParams,
    fn: () => {
      const usp = new URLSearchParams("a=1&a=2&a=3");
      usp.set("a", "new");
    },
  });

  // Benchmark deleting a parameter.
  Deno.bench({
    group: "URLSearchParams.delete",
    name,
    warmup: 100,
    baseline: URLSearchParams !== globalThis.URLSearchParams,
    fn: () => {
      const usp = new URLSearchParams("a=1&b=2&c=3");
      usp.delete("b");
    },
  });

  // Benchmark sorting key/value pairs.
  Deno.bench({
    group: "URLSearchParams.sort",
    name,
    warmup: 100,
    baseline: URLSearchParams !== globalThis.URLSearchParams,
    fn: () => {
      const usp = new URLSearchParams("z=26&y=25&x=24&a=1&b=2");
      usp.sort();
    },
  });

  // Benchmark serialization to a query string.
  Deno.bench({
    group: "URLSearchParams.toString",
    name,
    warmup: 100,
    baseline: URLSearchParams !== globalThis.URLSearchParams,
    fn: () => {
      const usp = new URLSearchParams(
        "a=1&b=2&c=3&d=4&e=5&f=6&g=7&h=8&i=9&j=10",
      );
      usp.toString();
    },
  });

  // Benchmark iterating over entries using forEach.
  Deno.bench({
    group: "URLSearchParams.forEach iteration",
    name,
    warmup: 100,
    baseline: URLSearchParams !== globalThis.URLSearchParams,
    fn: () => {
      const usp = new URLSearchParams("a=1&b=2&c=3&d=4&e=5");
      let sum = 0;
      usp.forEach((value) => {
        sum += Number(value);
      });
      if (isNaN(sum)) throw new Error("Iteration failed");
    },
  });
}
