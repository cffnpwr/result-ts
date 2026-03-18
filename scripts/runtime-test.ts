import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import { basename, resolve } from "path";

import type { SourceFile } from "ts-morph";

import { Project } from "ts-morph";
import { z } from "zod";

import { loadPackageJson } from "./load-package-json.ts";
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

const args = process.argv.slice(2);
const helpFlag = args.includes("-h") || args.includes("--help");
const positional = args.filter((a) => !a.startsWith("-"));

if (helpFlag) {
  stdout(`
Usage: runtime-test [options] <runtime>

Options:
  -h, --help  Display this help message

Arguments:
  runtime     Specify the runtime to test (node, deno, bun)
  `);
  process.exit(0);
}

const _runtime = runtimeSchema.safeParse(positional[0]);
if (!_runtime.success) {
  const e = _runtime.error.format()._errors.join("\n");
  stderr(`Invalid runtime: ${e}`);
  process.exit(1);
}
const runtime = _runtime.data;

stdout(`Start runtime test for ${runtime}...`);
printSeparator();

stdout(`Building runtime test for ${runtime}...`);
await buildRuntimeTest(runtime);
stdout(`Built runtime test for ${runtime}.`);
printSeparator();

stdout(`Running runtime test for ${runtime}...`);
runRuntimeTest(runtime);
stdout(`Ran runtime test for ${runtime}.`);
printSeparator();

stdout(`Finish runtime test for ${runtime}.`);

async function buildRuntimeTest(runtime: Runtime): Promise<void> {
  const rootDir = resolve(import.meta.dir, "..");
  const packageJson = loadPackageJson(resolve(rootDir, "./package.json"));
  const outDir = resolve(rootDir, `./runtime-test/${runtime}`);
  const testFilesDir = resolve(rootDir, "./src");
  stdout(`Target directory: ${outDir}`);

  // Clean and recreate output directory
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });

  const project = new Project();
  // Collect test files from the source directory
  const testFiles = project.addSourceFilesAtPaths(
    `${testFilesDir}/**/*.test.ts`,
  );
  stdout(
    `Found ${testFiles.length} files: [\n  ${testFiles.map((f) => f.getFilePath()).join(",\n  ")}\n]`,
  );

  const runtimeTestFiles: SourceFile[] = [];
  for (const f of testFiles) {
    const importDeclarations = f.getImportDeclarations();

    // Extract local relative imports (e.g. ./result.ts)
    const localRegex = /^((.{1,2})\/)+([^/]+)$/;
    const localImports = importDeclarations.filter((d) => localRegex.test(d.getModuleSpecifierValue()));
    const imports = localImports
      .flatMap((d) => d.getNamedImports())
      .map((d) => d.getFullText().trim());

    // Identify bun:test imports before any remove() calls to avoid accessing removed nodes
    const bunTestImports = importDeclarations.filter(
      (d) => d.getModuleSpecifierValue() === "bun:test",
    );

    // ローカルインポートと bun:test インポートをまとめて削除
    localImports.forEach((d) => d.remove());
    bunTestImports.forEach((d) => d.remove());

    if (imports.length > 0) {
      f.addImportDeclaration({
        namedImports: imports,
        moduleSpecifier: packageJson.name.trim(),
      });
    }

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
  runtimeTestFiles.forEach((f) => f.saveSync());

  // テンプレートファイルをコピーしてテンプレートリテラルを置換
  const templateDir = resolve(rootDir, "./runtime-test/templates");
  for (const templateName of testConfig[runtime].templates) {
    const src = resolve(templateDir, templateName);
    const dest = resolve(outDir, basename(templateName));
    cpSync(src, dest);

    let data = readFileSync(dest, "utf-8");
    data = data
      .replaceAll(/\${runtime}/g, runtime)
      .replaceAll(
        /\${Runtime}/g,
        runtime.charAt(0).toUpperCase() + runtime.slice(1),
      )
      .replaceAll(/\${node-only:(.*?)}/gs, runtime === "node" ? "$1" : "")
      .replaceAll(/\${deno-only:(.*?)}/gs, runtime === "deno" ? "$1" : "")
      .replaceAll(/\${bun-only:(.*?)}/gs, runtime === "bun" ? "$1" : "");
    writeFileSync(dest, data);
  }
}

function runRuntimeTest(runtime: Runtime): void {
  const testDir = resolve(import.meta.dir, `../runtime-test/${runtime}`);
  const { exec, install, test } = testConfig[runtime];

  stdout("Installing dependencies...");
  runCmd(exec, install, testDir);
  stdout("Installed dependencies.");
  printSeparator();

  stdout("Running tests...");
  runCmd(exec, test, testDir);
  stdout("Ran tests.");
  printSeparator();
}
