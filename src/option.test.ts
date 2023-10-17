import { beforeEach, describe, expect, it, vi } from "vitest";

import { None, Option, Some } from "./option";

describe("isSome", () => {
  it("Returns `true` if the option is a `Some` value.", () => {
    const x: Option<number> = new Some(2);

    expect(x.isSome()).toBe(true);
  });

  it("Returns `false` if the option is a `None` value.", () => {
    const x: Option<number> = new None();

    expect(x.isSome()).toBe(false);
  });
});

describe("isSomeAnd", () => {
  it("Returns `true` if the option is a `Some` and the value inside of it matches a predicate.", () => {
    const x: Option<number> = new Some(2);

    expect(x.isSomeAnd((x) => x > 1)).toBe(true);
  });

  it("Returns `false` if the option is a `Some` and the value inside of it does not matche a predicate.", () => {
    const x: Option<number> = new Some(0);

    expect(x.isSomeAnd((x) => x > 1)).toBe(false);
  });

  it("Returns `false` if the option is a `None`.", () => {
    const x: Option<number> = new None();

    expect(x.isSomeAnd((x) => x > 1)).toBe(false);
  });
});

describe("isNone", () => {
  it("Returns `false` if the option is a `Some` value.", () => {
    const x: Option<number> = new Some(2);

    expect(x.isNone()).toBe(false);
  });

  it("Returns `true` if the option is a `None` value.", () => {
    const x: Option<number> = new None();

    expect(x.isNone()).toBe(true);
  });
});

describe("expect", () => {
  it("Returns the contained `Some` value, consuming the self value.", () => {
    const x: Option<number> = new Some(2);

    expect(x.expect("error")).toBe(2);
  });

  it("throw `msg`, if contained `None`.", () => {
    const x: Option<number> = new None();

    expect(() => x.expect("error")).toThrowError("error");
  });
});

describe("unwrap", () => {
  it("Returns the contained `Some` value, consuming the self value.", () => {
    const x: Option<number> = new Some(2);

    expect(x.unwrap()).toBe(2);
  });

  it("Throw an Error, if contained `None` value.", () => {
    const x: Option<number> = new None();

    expect(() => x.unwrap()).toThrowError();
  });
});

describe("unwrapOr", () => {
  it("Returns the contained `Some` value.", () => {
    const x: Option<number> = new Some(2);

    expect(x.unwrapOr(0)).toBe(2);
  });

  it("Returns a provided default.", () => {
    const x: Option<number> = new None();

    expect(x.unwrapOr(0)).toBe(0);
  });
});

describe("unwrapOrElse", () => {
  const k = 10;

  it("Returns the contained `Some` value.", () => {
    const x: Option<number> = new Some(2);

    expect(x.unwrapOrElse(() => 2 * k)).toBe(2);
  });

  it("Returns computes it from a closure.", () => {
    const x: Option<number> = new None();

    expect(x.unwrapOrElse(() => 2 * k)).toBe(20);
  });
});

describe("map", () => {
  const getLength = (str: string) => str.length;

  it("Maps an `Option<T>` to `Option<U>` by applying a function to a contained value (if `Some`).", () => {
    const x: Option<string> = new Some("hello");

    expect(x.map(getLength).unwrap()).toBe(5);
  });

  it("Returns `None` (if `None`).", () => {
    const x: Option<string> = new None();

    expect(x.map(getLength).isNone()).toBe(true);
  });
});

describe("mapOr", () => {
  const getLength = (str: string) => str.length;

  it("Applies a function to the contained value (if any).", () => {
    const x: Option<string> = new Some("hello");

    expect(x.mapOr(13 as number, getLength)).toBe(5);
  });

  it("Returns the provided default result (if none).", () => {
    const x: Option<string> = new None();

    expect(x.mapOr(13 as number, getLength)).toBe(13);
  });
});

describe("mapOrElse", () => {
  const k = 21;

  it("Computes a default function result (if none).", () => {
    const x: Option<string> = new None();

    expect(
      x.mapOrElse(
        () => 2 * k,
        (v: string) => v.length,
      ),
    ).toBe(42);
  });

  it("Applies a different function to the contained value (if any).", () => {
    const x: Option<string> = new Some("hoge");

    expect(
      x.mapOrElse(
        () => 2 * k,
        (v) => v.length,
      ),
    ).toBe(4);
  });
});

describe("inspect", () => {
  const closure = vi.fn((input: string) => input);

  beforeEach(() => {
    closure.mockReset();
  });

  it("Calls the provided closure with a reference to the contained value (if `Some`).", () => {
    const x: Option<string> = new Some("foo");

    expect(x.inspect(closure)).toBe(x);
    expect(closure).toHaveBeenCalledOnce();
  });

  it("Do nothing (if `None`).", () => {
    const x: Option<string> = new None();

    expect(x.inspect(closure)).toBe(x);
    expect(closure).not.toHaveBeenCalled();
  });
});

describe("okOr", () => {
  it("Transforms the `Option<T>` into a `Result<T, E>`, mapping `Some(v)` to `Ok(v)`.", () => {
    const x: Option<string> = new Some("foo");

    expect(x.okOr("error").isOk()).toBe(true);
    expect(x.okOr("error").unwrap()).toBe("foo");
  });

  it("Transforms the `Option<T>` into a `Result<T, E>`, mapping `None` to `Err(error)`.", () => {
    const x: Option<string> = new None();

    expect(x.okOr("error").isErr()).toBe(true);
    expect(x.okOr("error").unwrapErr()).toBe("error");
  });
});

describe("okOrElse", () => {
  const getError = () => "error";

  it("Transforms the `Option<T>` into a `Result<T, E>`, mapping `Some(v)` to `Ok(v)`.", () => {
    const x: Option<string> = new Some("foo");

    expect(x.okOrElse(getError).isOk()).toBe(true);
    expect(x.okOrElse(getError).unwrap()).toBe("foo");
  });

  it("Transforms the `Option<T>` into a `Result<T, E>`, mapping `None` to `Err(error())`.", () => {
    const x: Option<string> = new None();

    expect(x.okOrElse(getError).isErr()).toBe(true);
  });
});

describe("and", () => {
  it("Returns `optb`. (`Some` and `Some`)", () => {
    const x: Option<string> = new Some("foo");
    const y: Option<string> = new Some("bar");

    expect(x.and(y).isSome()).toBe(true);
    expect(x.and(y).unwrap()).toBe("bar");
  });

  it("Returns `None` if the option is `None`. (`None` and `Some`)", () => {
    const x: Option<string> = new None();
    const y: Option<string> = new Some("bar");

    expect(x.and(y).isNone()).toBe(true);
  });

  it("Returns `optb`. (`Some` and `None`)", () => {
    const x: Option<string> = new Some("foo");
    const y: Option<string> = new None();

    expect(x.and(y).isNone()).toBe(true);
  });

  it("Returns `None` if the option is `None`. (`None` and `None`)", () => {
    const x: Option<string> = new None();
    const y: Option<string> = new None();

    expect(x.and(y).isNone()).toBe(true);
  });
});

describe("andThen", () => {
  const stringify = (x: number) => {
    if (x < 0) {
      return new None();
    }

    return new Some(`${x}`);
  };

  it("Returns `None` if the option is `None`.", () => {
    const x: Option<number> = new None();

    expect(x.andThen(stringify).isNone()).toBe(true);
  });

  it("Calls `op` with the wrapped value and returns the result. (`op` returns `Some`)", () => {
    const x: Option<number> = new Some(3);

    expect(x.andThen(stringify).isSome()).toBe(true);
    expect(x.andThen(stringify).unwrap()).toBe("3");
  });

  it("Calls `op` with the wrapped value and returns the result. (`op` returns `None`)", () => {
    const x: Option<number> = new Some(-3);

    expect(x.andThen(stringify).isNone()).toBe(true);
  });
});

describe("filter", () => {
  const isPositiveNumber = (x: number) => x > 0;

  it("Returns `None` if the option is `None`.", () => {
    const x: Option<number> = new None();

    expect(x.filter(isPositiveNumber).isNone()).toBe(true);
  });

  it("Calls `predicate` with the wrapped value and returns. (`predicate` returns `true`)", () => {
    const x: Option<number> = new Some(3);

    expect(x.filter(isPositiveNumber).isSome()).toBe(true);
    expect(x.filter(isPositiveNumber).unwrap()).toBe(3);
  });

  it("Calls `predicate` with returns `None`. (`predicate` returns `false`)", () => {
    const x: Option<number> = new Some(-3);

    expect(x.filter(isPositiveNumber).isNone()).toBe(true);
  });
});

describe("or", () => {
  it("Returns the option if it contains a value. (`Some` and `Some`)", () => {
    const x: Option<string> = new Some("foo");
    const y: Option<string> = new Some("bar");

    expect(x.or(y).isSome()).toBe(true);
    expect(x.or(y).unwrap()).toBe("foo");
  });

  it("Returns `optb`. (`None` and `Some`)", () => {
    const x: Option<string> = new None();
    const y: Option<string> = new Some("bar");

    expect(x.or(y).isSome()).toBe(true);
    expect(x.or(y).unwrap()).toBe("bar");
  });

  it("Returns the option if it contains a value. (`Some` and `None`)", () => {
    const x: Option<string> = new Some("foo");
    const y: Option<string> = new None();

    expect(x.or(y).isSome()).toBe(true);
    expect(x.or(y).unwrap()).toBe("foo");
  });

  it("Returns `optb`. (`None` and `None`)", () => {
    const x: Option<string> = new None();
    const y: Option<string> = new None();

    expect(x.or(y).isNone()).toBe(true);
  });
});

describe("orElse", () => {
  it("Returns the option if it contains a value. (`Some` and `Some`)", () => {
    const x: Option<string> = new Some("foo");

    expect(x.orElse(() => new Some("bar")).isSome()).toBe(true);
    expect(x.orElse(() => new Some("bar")).unwrap()).toBe("foo");
  });

  it("Calls `op` and returns the result. (`None` and `Some`)", () => {
    const x: Option<string> = new None();

    expect(x.orElse(() => new Some("bar")).isSome()).toBe(true);
    expect(x.orElse(() => new Some("bar")).unwrap()).toBe("bar");
  });

  it("Returns the option if it contains a value. (`Some` and `None`)", () => {
    const x: Option<string> = new Some("foo");

    expect(x.orElse(() => new None()).isSome()).toBe(true);
    expect(x.orElse(() => new None()).unwrap()).toBe("foo");
  });

  it("Returns `optb`. (`None` and `None`)", () => {
    const x: Option<string> = new None();

    expect(x.orElse(() => new None()).isNone()).toBe(true);
  });
});

describe("or", () => {
  it("Returns `None`. (`Some` and `Some`)", () => {
    const x: Option<string> = new Some("foo");
    const y: Option<string> = new Some("bar");

    expect(x.xor(y).isNone()).toBe(true);
  });

  it("Returns `Some` if exactly one of self. (`None` and `Some`)", () => {
    const x: Option<string> = new None();
    const y: Option<string> = new Some("bar");

    expect(x.xor(y).isSome()).toBe(true);
    expect(x.xor(y).unwrap()).toBe("bar");
  });

  it("Returns `Some` if exactly one of self. (`Some` and `None`)", () => {
    const x: Option<string> = new Some("foo");
    const y: Option<string> = new None();

    expect(x.xor(y).isSome()).toBe(true);
    expect(x.xor(y).unwrap()).toBe("foo");
  });

  it("Returns `None`. (`None` and `None`)", () => {
    const x: Option<string> = new None();
    const y: Option<string> = new None();

    expect(x.xor(y).isNone()).toBe(true);
  });
});
