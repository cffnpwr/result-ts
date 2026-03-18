import { readFileSync } from "fs";

import { z } from "zod";

const packageJsonSchema = z.object({
  name: z.string().default(""),
  version: z.string().default("0.0.0"),
  description: z.string().default(""),
  exports: z
    .union([z.string(), z.record(z.string(), z.union([z.string(), z.record(z.string(), z.string())]))])
    .default("./src/index.ts"),
  license: z.string().optional(),
  scripts: z.record(z.string(), z.string()).optional(),
  dependencies: z.record(z.string(), z.string()).optional(),
  devDependencies: z.record(z.string(), z.string()).optional(),
});
export type PackageJson = z.infer<typeof packageJsonSchema>;

export const loadPackageJson = (path: string): PackageJson => {
  const text = readFileSync(path, "utf-8");
  const res = packageJsonSchema.safeParse(JSON.parse(text));
  if (!res.success) {
    throw new Error(
      `Invalid package.json: ${res.error.issues.map((i) => i.message).join(", ")}`,
    );
  }
  return res.data;
};
