export class UnimplementedError extends Error {
  override readonly name = "UnimplementedError" as const;
  constructor() {
    super("unimplemented");
  }
}

export class UnwrapError extends Error {
  override readonly name = "UnwrapError" as const;
  constructor(msg?: string) {
    super(msg || "Unwrap failed.");
  }
}
