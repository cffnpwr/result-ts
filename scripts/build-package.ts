import { writeFileSync, readFileSync } from "fs";
import { resolve } from "path";
import { runCmd } from "./util.ts";

const rootDir = resolve(import.meta.dir, "..");

runCmd("bun", ["run", "build"], rootDir);

// Generate dist/package.json with publishConfig.exports applied
// Rewrite paths from root-relative (./dist/...) to dist-relative (./...)
const pkg = JSON.parse(readFileSync(resolve(rootDir, "package.json"), "utf-8"));
const rewritePaths = (value: unknown): unknown => {
  if (typeof value === "string") {
    return value.replace(/^\.\/dist\//, "./");
  }
  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, rewritePaths(v)]),
    );
  }
  return value;
};
const distPkg = {
  ...pkg,
  exports: rewritePaths(pkg.publishConfig?.exports ?? pkg.exports),
  types: typeof pkg.types === "string" ? pkg.types.replace(/^\.\/dist\//, "./") : pkg.types,
};
delete distPkg.publishConfig;
delete distPkg.devDependencies;
delete distPkg.scripts;
delete distPkg.files;
writeFileSync(
  resolve(rootDir, "dist/package.json"),
  JSON.stringify(distPkg, null, 2) + "\n",
);
