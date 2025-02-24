export const toString = (data: unknown) => {
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
export const stdout = (data: unknown) => {
  const encoder = new TextEncoder();
  const msg = toString(data);
  Deno.stdout.writeSync(encoder.encode(msg));
};
export const stderr = (data: unknown) => {
  const encoder = new TextEncoder();
  const msg = toString(data);
  Deno.stderr.writeSync(encoder.encode(msg));
};
export const printSeparator = () => {
  const columns = Deno.consoleSize().columns;
  stdout("=".repeat(columns - 1));
};

export const runCmd = async (
  exec: string,
  args: string[],
  cwd: string = Deno.cwd(),
) => {
  const cmd = new Deno.Command(exec, {
    args: args,
    cwd: cwd,
    stdout: "inherit",
    stderr: "inherit",
  });
  await cmd.output();
};
