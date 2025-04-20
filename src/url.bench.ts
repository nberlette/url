import { URL } from "./url.ts";

const absoluteUrlStr =
  "https://user:pass@example.com:8080/path/to/resource?query=123&foo=bar#section";
const relativeUrlStr = "/new/resource?foo=new";

const subjects = [
  { name: "URL", URL },
  { name: "globalThis.URL", URL: globalThis.URL },
] as const;

for (const { name, URL } of subjects) {
  Deno.bench({
    group: `URL.constructor (absolute)`,
    name,
    warmup: 100,
    baseline: URL !== globalThis.URL,
    fn: () => {
      new URL(absoluteUrlStr);
    },
  });

  Deno.bench({
    group: `URL.constructor (relative)`,
    name,
    warmup: 100,
    baseline: URL !== globalThis.URL,
    fn: () => {
      new URL(relativeUrlStr, absoluteUrlStr);
    },
  });

  Deno.bench({
    group: `URL.constructor (relative with base)`,
    name,
    warmup: 100,
    baseline: URL !== globalThis.URL,
    fn: () => {
      new URL(relativeUrlStr, absoluteUrlStr);
    },
  });

  Deno.bench({
    group: `URL.constructor (invalid)`,
    name,
    warmup: 100,
    baseline: URL !== globalThis.URL,
    fn: () => {
      try {
        new URL("invalid-url");
      } catch {}
    },
  });

  Deno.bench({
    group: `URL.set search`,
    name,
    warmup: 100,
    baseline: URL !== globalThis.URL,
    fn: () => {
      const url = new URL(absoluteUrlStr);
      url.search = "?changed=true&value=42";
    },
  });

  Deno.bench({
    group: `URL.set pathname`,
    name,
    warmup: 100,
    baseline: URL !== globalThis.URL,
    fn: () => {
      const url = new URL(absoluteUrlStr);
      url.pathname = "/updated/path";
    },
  });

  Deno.bench({
    group: `URL.update multiple properties`,
    name,
    warmup: 100,
    baseline: URL !== globalThis.URL,
    fn: () => {
      const url = new URL(absoluteUrlStr);
      url.protocol = "http:";
      url.username = "newUser";
      url.password = "newPass";
      url.host = "changed.com:3000";
      url.pathname = "/modified/path";
      url.search = "?abc=123";
      url.hash = "#new-hash";
    },
  });

  Deno.bench({
    group: `URL.toString`,
    name,
    warmup: 100,
    baseline: URL !== globalThis.URL,
    fn: () => {
      const url = new URL(absoluteUrlStr);
      url.toString();
    },
  });

  Deno.bench({
    group: `URL.toJSON`,
    name,
    warmup: 100,
    baseline: URL !== globalThis.URL,
    fn: () => {
      const url = new URL(absoluteUrlStr);
      url.toJSON();
    },
  });

  Deno.bench({
    group: `URL.toString (relative)`,
    name,
    warmup: 100,
    baseline: URL !== globalThis.URL,
    fn: () => {
      const url = new URL(relativeUrlStr, absoluteUrlStr);
      url.toString();
    },
  });
}
