import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { z } from "zod";
import { stderr, stdout } from "./util.ts";

const updateLevelSchema = z.enum(["major", "minor", "patch"]);

const args = process.argv.slice(2);
const helpFlag = args.includes("-h") || args.includes("--help");
const dryRunFlag = args.includes("-d") || args.includes("--dry-run");
const positional = args.filter((a) => !a.startsWith("-"));

if (helpFlag) {
  stdout(`
Usage: update-version [options] <update-level>

Options:
  -h, --help       Display this help message
  -d, --dry-run    Display the new versions without writing to file

Arguments:
  update-level     Specify the level of version update (major, minor, patch)
  `);
  process.exit(0);
}

const _updateLevel = updateLevelSchema.safeParse(positional[0]);
if (!_updateLevel.success) {
  const e = _updateLevel.error.format()._errors.join("\n");
  stderr(`Invalid update level: ${e}`);
  process.exit(1);
}
const updateLevel = _updateLevel.data;

const packageJsonPath = resolve(import.meta.dir, "../package.json");
const jsrJsonPath = resolve(import.meta.dir, "../jsr.json");

const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
const currentVersion: string = packageJson.version;
const parts = currentVersion.split(".").map(Number);
const major = parts[0] ?? 0;
const minor = parts[1] ?? 0;
const patch = parts[2] ?? 0;

let newVersion: string;
switch (updateLevel) {
  case "major":
    newVersion = `${major + 1}.0.0`;
    break;
  case "minor":
    newVersion = `${major}.${minor + 1}.0`;
    break;
  case "patch":
    newVersion = `${major}.${minor}.${patch + 1}`;
    break;
}

packageJson.version = newVersion;
const jsrJson = JSON.parse(readFileSync(jsrJsonPath, "utf-8"));
jsrJson.version = newVersion;

if (dryRunFlag) {
  stdout(`package.json:\n${JSON.stringify(packageJson, null, 2)}`);
  stdout(`jsr.json:\n${JSON.stringify(jsrJson, null, 2)}`);
} else {
  writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
  writeFileSync(jsrJsonPath, `${JSON.stringify(jsrJson, null, 2)}\n`);
  stdout(`Updated version from ${currentVersion} to ${newVersion}`);
}
