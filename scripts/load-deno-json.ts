import { parse } from "@std/jsonc";
import { z } from "zod";

const pathSchema = z.union([
  z.string().url(),
  z.string().regex(/^(.+)\/([^\/]+)$/),
]);
const denoJsonSchema = z.object({
  name: z.string().default(""),
  version: z.string().default("0.0.0"),
  description: z.string().default(""),
  exports: z.union([z.string(), z.record(z.string())]).default("./index.ts"),
  license: z.string().optional(),
});
export type DenoJson = z.infer<typeof denoJsonSchema>;

export const loadDenoJson = async (path: string): Promise<DenoJson> => {
  if (!pathSchema.safeParse(path).success) {
    throw new Error(`Invalid path: ${path}`);
  }

  let denoJsonText: string;
  if (z.string().url().safeParse(path).success) {
    const resp = await fetch(path);
    if (!resp.ok) {
      throw new Error(`Failed to fetch: ${path}`);
    }
    denoJsonText = await resp.text();
  } else {
    denoJsonText = await Deno.readTextFile(path);
  }
  const res = denoJsonSchema.safeParse(parse(denoJsonText));
  if (!res.success) {
    throw new Error(
      `Invalid deno.json: ${res.error.format()._errors.join(", ")}`,
    );
  }
  return res.data;
};
