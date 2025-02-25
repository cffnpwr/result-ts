import { build, emptyDir, type EntryPoint } from "@deno/dnt";
import { resolve } from "@std/path";
import { loadDenoJson } from "./load-deno-json.ts";

const outDir = resolve(Deno.cwd(), "./built-package");
await emptyDir(outDir);

const denoJson = await loadDenoJson(resolve(Deno.cwd(), "./deno.json"));
const getEntryPoints = (
  exports: string | Record<string, string>,
): (string | EntryPoint)[] => {
  if (typeof exports === "string") {
    return [exports];
  }
  return Object.entries(exports).map(([k, v]) => ({ name: k, path: v }));
};

await build({
  entryPoints: getEntryPoints(denoJson.exports),
  outDir,
  shims: {},
  importMap: resolve(Deno.cwd(), "./deno.json"),
  test: false,
  typeCheck: false,
  package: {
    name: denoJson.name,
    version: denoJson.version,
    description: denoJson.description,
    license: denoJson.license,
  },
});
