import { spawnSync } from "child_process";

export const toString = (data: unknown): string => {
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

export const stdout = (data: unknown): void => {
  process.stdout.write(toString(data));
};

export const stderr = (data: unknown): void => {
  process.stderr.write(toString(data));
};

export const printSeparator = (): void => {
  const columns = process.stdout.columns ?? 5;
  stdout("=".repeat(columns - 1));
};

export const runCmd = (exec: string, args: string[], cwd?: string): void => {
  const result = spawnSync(exec, args, {
    cwd: cwd ?? process.cwd(),
    stdio: "inherit",
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};
