import { parseArgs } from "@std/cli/parse-args";
import { basename, resolve } from "@std/path";
import { emptyDir } from "@std/fs";
import { z } from "zod";
import { Project, type SourceFile } from "@ts-morph/ts-morph";
import { loadDenoJson } from "./load-deno-json.ts";

const runtimeSchema = z.enum(["node", "deno", "bun"]);
type Runtime = z.infer<typeof runtimeSchema>;

const templates = {
  node: ["package.json", "vitest.config.ts"],
  bun: ["package.json", "vitest.config.ts"],
  deno: ["deno.json"],
};

const toString = (data: unknown) => {
  let msg: string;
  switch (typeof data) {
    case "string":
    case "number":
    case "bigint":
    case "boolean":
    case "symbol":
    case "function": {
      msg = data.toString();
      break;
    }
    case "undefined": {
      msg = "undefined";
      break;
    }
    case "object": {
      msg = JSON.stringify(data);
      break;
    }
    default: {
      msg = `${data}`;
    }
  }
  if (msg.slice(-1) !== "\n") {
    msg += "\n";
  }
  return msg;
};
const stdout = (data: unknown) => {
  const encoder = new TextEncoder();
  const msg = toString(data);
  Deno.stdout.writeSync(encoder.encode(msg));
};
const stderr = (data: unknown) => {
  const encoder = new TextEncoder();
  const msg = toString(data);
  Deno.stderr.writeSync(encoder.encode(msg));
};
const printSeparator = () => {
  const columns = Deno.consoleSize().columns;
  stdout("=".repeat(columns - 1));
};

const cli = async () => {
  const encoder = new TextEncoder();
  const args = parseArgs(Deno.args, {
    string: ["help"],
    alias: {
      h: "help",
    },
  });
  if (args.help) {
    const data = encoder.encode(`
      Usage: runtime-test [options] [runtime]

      Options:
        -h, --help  Display this help message

      Arguments:
        runtime     Specify the runtime to test (node, deno, bun)
    `);
    stdout(data);
    Deno.exit(0);
  }

  const _runtime = runtimeSchema.safeParse(args._[0]);
  if (!_runtime.success) {
    const e = _runtime.error.format()._errors.join("\n");
    stderr(`Invalid runtime: ${e}`);
    Deno.exit(1);
  }
  const runtime = _runtime.data;
  stdout(`Start runtime test for ${runtime}...`);
  printSeparator();

  stdout(`Building runtime test for ${runtime}...`);
  await buildRuntimeTest(runtime);
  stdout(`Built runtime test for ${runtime}.`);
  printSeparator();
};

const buildRuntimeTest = async (runtime: Runtime) => {
  const denoJsonPath = resolve(Deno.cwd(), "./deno.json");
  const denoJson = await loadDenoJson(denoJsonPath);
  const outDir = resolve(Deno.cwd(), `./runtime-test/${runtime}`);
  const testFilesDir = resolve(Deno.cwd(), "./src");
  stdout(`Target directory: ${outDir}`);
  await emptyDir(outDir);

  const project = new Project();
  // ソースディレクトリからテストファイルを取得
  const testFiles = project.addSourceFilesAtPaths(
    `${testFilesDir}/**/*.test.ts`,
  );
  stdout(
    `Found ${testFiles.length} files: [\n  ${
      testFiles.map((f) => f.getFilePath()).join(",\n  ")
    }\n]`,
  );
  const runtimeTestFiles: SourceFile[] = [];
  for (const f of testFiles) {
    const importDeclarations = f.getImportDeclarations();

    // Importから./result.ts, ./error.ts, ./option.tsから読み込んでいる物を抽出
    const regex = /^((.{1,2})\/)+([^\/]+)$/;
    const localImports = importDeclarations.filter((d) =>
      regex.test(d.getModuleSpecifierValue())
    );
    const imports = localImports
      .map((d) => d.getNamedImports())
      .flat()
      .map((d) => d.getFullText().trim());
    // Importから./result.ts, ./error.ts, ./option.tsを削除
    localImports.forEach((d) => d.remove());
    // ローカルのImportを追加
    if (imports.length > 0) {
      f.addImportDeclaration({
        namedImports: imports,
        moduleSpecifier: denoJson.name.trim(),
      });
    }

    // Importから@std/testing/bdd, @std/expectを削除
    importDeclarations
      .filter((d) =>
        !localImports.includes(d) &&
        d.getModuleSpecifierValue().startsWith("@std")
      )
      .forEach((d) => d.remove());

    // テストランナーを追加
    switch (runtime) {
      case "node":
      case "bun": {
        f.addImportDeclaration({
          namedImports: ["describe", "it", "expect"],
          moduleSpecifier: "vitest",
        });
        break;
      }
      case "deno": {
        f.addImportDeclarations([
          {
            namedImports: ["describe", "it"],
            moduleSpecifier: "@std/testing/bdd",
          },
          {
            namedImports: ["expect"],
            moduleSpecifier: "@std/expect",
          },
        ]);
        break;
      }
      default: {
        throw new Error(`Invalid runtime: ${runtime}`);
      }
    }

    const sourceFile = f.copyToDirectory(outDir, { overwrite: true });
    runtimeTestFiles.push(sourceFile);
  }
  runtimeTestFiles.forEach((f) => {
    f.saveSync();
  });

  // テンプレートファイルをコピー
  const templateDir = resolve(Deno.cwd(), "./runtime-test/templates");
  const templateFiles = templates[runtime].map((f) => resolve(templateDir, f));
  for (const f of templateFiles) {
    const filename = basename(f);
    const outFile = resolve(outDir, filename);
    await Deno.copyFile(f, outFile);
  }
};

await cli();
