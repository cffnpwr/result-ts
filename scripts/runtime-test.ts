import { parseArgs } from "@std/cli/parse-args";
import { basename, resolve } from "@std/path";
import { emptyDir } from "@std/fs";
import { z } from "zod";
import { Project, type SourceFile } from "@ts-morph/ts-morph";
import { loadDenoJson } from "./load-deno-json.ts";
import { printSeparator, runCmd, stderr, stdout } from "./util.ts";

const runtimeSchema = z.enum(["node", "deno", "bun"]);
type Runtime = z.infer<typeof runtimeSchema>;

const testConfig: {
  [key in Runtime]: {
    templates: string[];
    exec: string;
    install: string[];
    test: string[];
  };
} = {
  node: {
    templates: ["package.json", "vitest.config.ts"],
    exec: "pnpm",
    install: ["install"],
    test: ["test"],
  },
  bun: {
    templates: ["package.json", "vitest.config.ts"],
    exec: "bun",
    install: ["install"],
    test: ["test"],
  },
  deno: {
    templates: ["deno.json"],
    exec: "deno",
    install: ["install"],
    test: ["test"],
  },
};

const cli = async () => {
  const args = parseArgs(Deno.args, {
    boolean: ["help"],
    alias: {
      h: "help",
    },
  });
  if (args.help) {
    const data = `
Usage: runtime-test [options] [runtime]

Options:
  -h, --help  Display this help message

Arguments:
  runtime     Specify the runtime to test (node, deno, bun)
    `;
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

  stdout(`Running runtime test for ${runtime}...`);
  await runRuntimeTest(runtime);
  stdout(`Ran runtime test for ${runtime}.`);
  printSeparator();

  stdout(`Finish runtime test for ${runtime}.`);
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
  const templateFiles = testConfig[runtime].templates
    .map((f) => resolve(templateDir, f));
  for (const f of templateFiles) {
    // ファイルコピー
    const filename = basename(f);
    const outFile = resolve(outDir, filename);
    await Deno.copyFile(f, outFile);

    // テンプレートリテラルを置換
    let data = await Deno.readTextFile(outFile);
    data = data.replaceAll(/\${runtime}/g, runtime)
      .replaceAll(
        /\${Runtime}/g,
        runtime.charAt(0).toUpperCase() + runtime.slice(1),
      )
      .replaceAll(/\${node-only:(.*?)}/g, runtime === "node" ? "$1" : "")
      .replaceAll(/\${deno-only:(.*?)}/g, runtime === "deno" ? "$1" : "")
      .replaceAll(/\${bun-only:(.*?)}/g, runtime === "bun" ? "$1" : "");
    await Deno.writeTextFile(outFile, data);
  }
};

const runRuntimeTest = async (runtime: Runtime) => {
  const testDir = resolve(Deno.cwd(), `./runtime-test/${runtime}`);

  const { exec, install, test } = testConfig[runtime];
  stdout(`Installing dependencies...`);
  await runCmd(exec, install, testDir);
  stdout(`Installed dependencies.`);
  printSeparator();

  stdout(`Running tests...`);
  await runCmd(exec, test, testDir);
  stdout(`Ran tests.`);
  printSeparator();
};

await cli();
