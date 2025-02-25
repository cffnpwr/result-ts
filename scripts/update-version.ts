import { resolve } from "@std/path";
import { loadDenoJson } from "./load-deno-json.ts";
import { parseArgs } from "@std/cli/parse-args";
import { stdout } from "./util.ts";
import z from "zod";
import { stderr } from "./util.ts";

const updateLevelSchema = z.enum(["major", "minor", "patch"]);

const cli = async () => {
  const args = parseArgs(Deno.args, {
    boolean: ["dry-run", "help"],
    alias: {
      h: "help",
      d: "dry-run",
    },
  });
  if (args.help) {
    const data = `
Usage: update-version [options] [runtime]

Options:
  -h, --help       Display this help message
  -d, --dry-run    Display the new deno.json without writing to file

Arguments:
  update-level     Specify the level of version update (major, minor, patch)
    `;
    stdout(data);
    Deno.exit(0);
  }

  const _updateLevel = updateLevelSchema.safeParse(args._[0]);
  if (!_updateLevel.success) {
    const e = _updateLevel.error.format()._errors.join("\n");
    stderr(`Invalid update level: ${e}`);
    Deno.exit(1);
  }
  const updateLevel = _updateLevel.data;

  const denoJsonPath = resolve(Deno.cwd(), "./deno.json");
  const denoJson = await loadDenoJson(denoJsonPath);
  const currentVersion = denoJson.version;
  const [major, minor, patch] = currentVersion.split(".").map(Number);
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
    default:
      stderr(`Invalid update level: ${updateLevel}`);
      Deno.exit(1);
  }
  denoJson.version = newVersion;

  const newDenoJson = `${JSON.stringify(denoJson, null, 2)}\n`;
  if (args["dry-run"]) {
    stdout(newDenoJson);
    return;
  }
  Deno.writeTextFileSync(denoJsonPath, newDenoJson);
  stdout(`Updated version from ${currentVersion} to ${newVersion}`);
};

await cli();
