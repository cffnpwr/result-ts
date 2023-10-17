import { beforeEach, describe, expect, it, vi } from "vitest";

import { Err, Ok, Result } from "./result";

describe("isOk", () => {
  it("Returns `true` if the result is `Ok`.", () => {
    const x: Result<number, string> = new Ok(-3);

    expect(x.isOk()).toBe(true);
  });

  it("Returns `false` if the result is `Err`.", () => {
    const x: Result<number, string> = new Err("Some Error Message");

    expect(x.isOk()).toBe(false);
  });
});

describe("isOkAnd", () => {
  it("Returns `true` if the result is `Ok` and the value inside of it matches a predicate.", () => {
    const x: Result<number, string> = new Ok(2);

    expect(x.isOkAnd((x) => x > 1)).toBe(true);
  });

  it("Returns `false` if the result is `Ok` and the value inside of it does not matche a predicate.", () => {
    const x: Result<number, string> = new Ok(0);

    expect(x.isOkAnd((x) => x > 1)).toBe(false);
  });

  it("Returns `false` if the result is `Err`", () => {
    const x: Result<number, string> = new Err("hey");

    expect(x.isOkAnd((x) => x > 1)).toBe(false);
  });
});

describe("isErr", () => {
  it("Returns `false` if the result is `Ok`", () => {
    const x: Result<number, string> = new Ok(-3);

    expect(x.isErr()).toBe(false);
  });

  it("Returns `true` if the result is `Err`.", () => {
    const x: Result<number, string> = new Err("Some Error Message");

    expect(x.isOk()).toBe(false);
  });
});

describe("isErrAnd", () => {
  it("Returns `false` if the result is `Ok`", () => {
    const x: Result<number, string> = new Ok(2);

    expect(x.isErrAnd((e) => e === "hey")).toBe(false);
  });

  it("Returns `false` if the result is `Err` and the value inside of it does not matche a predicate.", () => {
    const x: Result<number, string> = new Err("hi");

    expect(x.isErrAnd((e) => e === "hey")).toBe(false);
  });

  it("Returns `true` if the result is `Err` and the value inside of it matches a predicate.", () => {
    const x: Result<number, string> = new Err("hey");

    expect(x.isErrAnd((e) => e === "hey")).toBe(true);
  });
});

describe("ok", () => {
  it("Converts from `Ok<T>` to `Some<T>`.", () => {
    const x: Result<number, string> = new Ok(2);

    expect(x.ok().isSome()).toBe(true);
    expect(x.ok().unwrap()).toBe(2);
  });

  it("Converts from `Err<E>` to `None`.", () => {
    const x: Result<number, string> = new Err("Nothing here!!");

    expect(x.ok().isNone()).toBe(true);
  });
});

describe("err", () => {
  it("Converts from `Ok<T>` to `None`.", () => {
    const x: Result<number, string> = new Ok(2);

    expect(x.err().isNone()).toBe(true);
  });

  it("Converts from `Err<E>` to `Some<T>`.", () => {
    const x: Result<number, string> = new Err("Nothing here!!");

    expect(x.err().isSome()).toBe(true);
    expect(x.err().unwrap()).toBe("Nothing here!!");
  });
});

describe("map", () => {
  it("Maps a `Result<T, E>` to `Result<U, E>` by applying a function to a contained `Ok` value.", () => {
    const x: Result<number, string> = new Ok(2);

    expect(x.map((x) => `${x}`).unwrap()).toBe("2");
  });

  it("Leaving an `Err` value untouched.", () => {
    const x: Result<number, string> = new Err("hey");

    expect(x.map((x: number) => `${x}`).unwrapErr()).toBe("hey");
  });
});

describe("mapOr", () => {
  it("Applies a function to the contained value (if `Ok`).", () => {
    const x: Result<string, string> = new Ok("foo");

    expect(x.mapOr(42 as number, (x) => x.length)).toBe(3);
  });

  it("Returns the provided default (if `Err`).", () => {
    const x: Result<string, string> = new Err("bar");

    expect(x.mapOr(42 as number, (x: string) => x.length)).toBe(42);
  });
});

describe("mapOrElse", () => {
  const k = 21;

  it("Maps a `Result<T, E>` to `U` by applying fallback function `mapper` to a contained `Ok` value.", () => {
    const x: Result<string, string> = new Ok("foo");

    expect(
      x.mapOrElse(
        (_) => k * 2,
        (x) => x.length,
      ),
    ).toBe(3);
  });

  it("Maps a `Result<T, E>` to `U` by applying fallback function `defaultFn` to a contained `Err` value.", () => {
    const x: Result<string, string> = new Err("bar");

    expect(
      x.mapOrElse(
        (_) => k * 2,
        (x: string) => x.length,
      ),
    ).toBe(42);
  });
});

describe("mapErr", () => {
  const stringify = (x: number) => `error code: ${x}`;

  it("Maps a `Result<T, E>` to `Result<T, F>` by applying a function to a contained `Err` value.", () => {
    const x: Result<number, number> = new Err(13);

    expect(x.mapErr(stringify).unwrapErr()).toBe("error code: 13");
  });

  it("Leaving an `Ok` value untouched.", () => {
    const x: Result<number, number> = new Ok(2);

    expect(x.mapErr(stringify).unwrap()).toBe(2);
  });
});

describe("inspect", () => {
  const closure = vi.fn((input: string) => input);

  beforeEach(() => {
    closure.mockReset();
  });

  it("Calls the provided closure with a reference to the contained value (if `Ok`).", () => {
    const x: Result<string, string> = new Ok("foo");

    expect(x.inspect(closure)).toBe(x);
    expect(closure).toHaveBeenCalledOnce();
  });

  it("Do nothing (if `Err`).", () => {
    const x: Result<string, string> = new Err("bar");

    expect(x.inspect(closure)).toBe(x);
    expect(closure).not.toHaveBeenCalled();
  });
});

describe("inspectErr", () => {
  const closure = vi.fn((input: string) => input);

  beforeEach(() => {
    closure.mockReset();
  });

  it("Calls the provided closure with a reference to the contained value (if `Err`).", () => {
    const x: Result<string, string> = new Err("bar");

    expect(x.inspectErr(closure)).toBe(x);
    expect(closure).toHaveBeenCalledOnce();
  });

  it("Do nothing (if `Ok`).", () => {
    const x: Result<string, string> = new Ok("foo");

    expect(x.inspectErr(closure)).toBe(x);
    expect(closure).not.toHaveBeenCalled();
  });
});

describe("expect", () => {
  it("Returns the contained `Ok` value, consuming the self value.", () => {
    const x: Result<string, string> = new Ok("foo");

    expect(x.expect("error")).toBe("foo");
  });

  it("throw `msg`, if contained `Err`.", () => {
    const x: Result<string, string> = new Err("bar");

    expect(() => x.expect("error")).toThrowError("error");
  });
});

describe("expectErr", () => {
  it("Returns the contained `Err` value, consuming the self value.", () => {
    const x: Result<string, string> = new Err("bar");

    expect(x.expectErr("error")).toBe("bar");
  });

  it("throw `msg`, if contained `Ok`.", () => {
    const x: Result<string, string> = new Ok("foo");

    expect(() => x.expectErr("error")).toThrowError("error");
  });
});

describe("unwrap", () => {
  it("Returns the contained `Ok` value, consuming the self value.", () => {
    const x: Result<string, string> = new Ok("foo");

    expect(x.unwrap()).toBe("foo");
  });

  it("throw an Error with `Err`", () => {
    const x: Result<string, string> = new Err("bar");

    expect(() => x.unwrap()).toThrowError("bar");
  });
});

describe("unwrapErr", () => {
  it("Returns the contained `Err` value, consuming the self value.", () => {
    const x: Result<string, string> = new Err("bar");

    expect(x.unwrapErr()).toBe("bar");
  });

  it("throw an Error with `Ok`", () => {
    const x: Result<string, string> = new Ok("foo");

    // expect(x.unwrapErr()).toThrowError(new Error("Error with: foo"));
    expect(() => x.unwrapErr()).toThrowError("foo");
  });
});

describe("unwrapOr", () => {
  it("Returns the contained `Ok` value.", () => {
    const x: Result<string, string> = new Ok("foo");

    expect(x.unwrapOr("hoge")).toBe("foo");
  });

  it("Returns a provided default value.", () => {
    const x: Result<string, string> = new Err("bar");

    expect(x.unwrapOr("hoge")).toBe("hoge");
  });
});

describe("unwrapOrElse", () => {
  it("Returns the contained `Ok` value.", () => {
    const x: Result<string, string> = new Ok("foo");

    expect(x.unwrapOrElse((e: string) => `error: ${e}`)).toBe("foo");
  });

  it("Returns computes it from a closure.", () => {
    const x: Result<string, string> = new Err("bar");

    expect(x.unwrapOrElse((e) => `error: ${e}`)).toBe("error: bar");
  });
});

describe("and", () => {
  it("Returns `res` if the result is `Ok`.", () => {
    const x: Result<number, string> = new Ok(2);
    const y: Result<number, string> = new Ok(4);

    expect(x.and(y).isOk()).toBe(true);
    expect(x.and(y).unwrap()).toBe(4);
  });

  it("Otherwise returns the `Err` value of self. (`Ok` and `Err`)", () => {
    const x: Result<number, string> = new Ok(2);
    const y: Result<number, string> = new Err("late error");

    expect(x.and(y).isErr()).toBe(true);
    expect(x.and(y).unwrapErr()).toBe("late error");
  });

  it("Otherwise returns the `Err` value of self. (`Err` and `Ok`)", () => {
    const x: Result<number, string> = new Err("early error");
    const y: Result<number, string> = new Ok(2);

    expect(x.and(y).isErr()).toBe(true);
    expect(x.and(y).unwrapErr()).toBe("early error");
  });

  it("Otherwise returns the `Err` value of self. (`Err` and `Err`)", () => {
    const x: Result<number, string> = new Err("not a 2");
    const y: Result<number, string> = new Err("late error");

    expect(x.and(y).isErr()).toBe(true);
    expect(x.and(y).unwrapErr()).toBe("not a 2");
  });
});

describe("andThen", () => {
  const stringify = (x: number) => {
    if (x < 0) {
      return new Err("must be positive number");
    }

    return new Ok(`${x}`);
  };

  it("Calls `op` if the result is `Ok`.", () => {
    const x: Result<number, string> = new Ok(2);

    expect(x.andThen(stringify).isOk()).toBe(true);
    expect(x.andThen(stringify).unwrap()).toBe("2");
  });

  it("Otherwise returns the `Err` value of self. (`Ok` and `Err`)", () => {
    const x: Result<number, string> = new Ok(-2);

    expect(x.andThen(stringify).isErr()).toBe(true);
    expect(x.andThen(stringify).unwrapErr()).toBe("must be positive number");
  });

  it("Otherwise returns the `Err` value of self. (`Err` and `Ok`)", () => {
    const x: Result<number, string> = new Err("not a number");

    expect(x.andThen(stringify).isErr()).toBe(true);
    expect(x.andThen(stringify).unwrapErr()).toBe("not a number");
  });
});

describe("or", () => {
  it("Returns `res` if the result is `Err`", () => {
    const x: Result<number, string> = new Err("not a 2");
    const y: Result<number, string> = new Err("late error");

    expect(x.or(y).isErr()).toBe(true);
    expect(x.or(y).unwrapErr()).toBe("late error");
  });

  it("Otherwise returns the `Ok` value of self. (`Ok` and `Ok`)", () => {
    const x: Result<number, string> = new Ok(2);
    const y: Result<number, string> = new Ok(4);

    expect(x.or(y).isOk()).toBe(true);
    expect(x.or(y).unwrap()).toBe(2);
  });

  it("Otherwise returns the `Ok` value of self. (`Ok` and `Err`)", () => {
    const x: Result<number, string> = new Ok(2);
    const y: Result<number, string> = new Err("late error");

    expect(x.or(y).isOk()).toBe(true);
    expect(x.or(y).unwrap()).toBe(2);
  });

  it("Otherwise returns the `Ok` value of self. (`Err` and `Ok`)", () => {
    const x: Result<number, string> = new Err("early error");
    const y: Result<number, string> = new Ok(4);

    expect(x.or(y).isOk()).toBe(true);
    expect(x.or(y).unwrap()).toBe(4);
  });
});

describe("orElse", () => {
  const sq = (x: number) => new Ok(x * x);
  const err = (x: number) => new Err(x);

  it("Returns `res` if the result is `Err`", () => {
    const x: Result<number, number> = new Err(2);

    expect(x.orElse(err).isErr()).toBe(true);
    expect(x.orElse(err).unwrapErr()).toBe(2);
  });

  it("Otherwise returns the `Ok` value of self. (`Ok` and `Ok`)", () => {
    const x: Result<number, string> = new Ok(2);

    expect(x.orElse(sq).isOk()).toBe(true);
    expect(x.orElse(sq).unwrap()).toBe(2);
  });

  it("Otherwise returns the `Ok` value of self. (`Ok` and `Err`)", () => {
    const x: Result<number, string> = new Ok(2);

    expect(x.orElse(err).isOk()).toBe(true);
    expect(x.orElse(err).unwrap()).toBe(2);
  });

  it("Otherwise returns the `Ok` value of self. (`Err` and `Ok`)", () => {
    const x: Result<number, number> = new Err(2);

    expect(x.orElse(sq).isOk()).toBe(true);
    expect(x.orElse(sq).unwrap()).toBe(4);
  });
});
