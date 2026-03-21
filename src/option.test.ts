import { describe, expect, expectTypeOf, it } from "bun:test";

import type { Option } from "./option.ts";

import { UnwrapError } from "./error.ts";
import { None, Some } from "./option.ts";
import { Err, Ok } from "./result.ts";

describe("option.ts", () => {
  const exSome: Option<number> = Some(1);
  const exNone: Option<number> = None();

  describe("Equality test", () => {
    it("[positive] `Option.Some` with the same value should be equal", () => {
      const some1 = Some(1);
      const some2 = Some(1);

      expect(some1).toEqual(some2);
    });

    it("[positive] `Option.Some` with different values should not be equal", () => {
      const some1 = Some(1);
      const some2 = Some(2);

      expect(some1).not.toEqual(some2);
    });

    it("[positive] `Option.Some` and `Option.None` should not be equal", () => {
      const some = Some(1);
      const none: Option<number> = None();

      expect(some).not.toEqual(none);
    });

    it("[positive] `Option.None` should be equal", () => {
      const none1: Option<number> = None();
      const none2: Option<number> = None();

      expect(none1).toEqual(none2);
    });
  });

  describe("isSome()", () => {
    it("[positive] `isSome()` on `Option.Some` should return true", () => {
      expect(exSome.isSome()).toBe(true);
    });

    it("[positive] `isSome()` on `Option.None` should return false", () => {
      expect(exNone.isSome()).toBe(false);
    });
  });

  describe("isNone()", () => {
    it("[positive] `isNone()` on `Option.Some` should return false", () => {
      expect(exSome.isNone()).toBe(false);
    });

    it("[positive] `isNone()` on `Option.None` should return true", () => {
      expect(exNone.isNone()).toBe(true);
    });
  });

  describe("unwrap()", () => {
    it("[positive] `unwrap()` on `Option.Some` should return the value", () => {
      expect(exSome.unwrap()).toBe(1);
    });

    it("[negative] `unwrap()` on `Option.None` should throw `UnwrapError`", () => {
      expect(() => exNone.unwrap()).toThrow(UnwrapError);
    });
  });

  describe("unwrapOr()", () => {
    it("[positive] `unwrapOr()` on `Option.Some` should return its own value", () => {
      expect(exSome.unwrapOr(2)).toBe(1);
    });

    it("[positive] `unwrapOr()` on `Option.None` should return the fallback value", () => {
      expect(exNone.unwrapOr(2)).toBe(2);
    });
  });

  describe("unwrapOrElse()", () => {
    it("[positive] `unwrapOrElse()` on `Option.Some` should return its own value", () => {
      expect(exSome.unwrapOrElse(() => 2)).toBe(1);
    });

    it("[positive] `unwrapOrElse()` on `Option.None` should return the result of the function", () => {
      expect(exNone.unwrapOrElse(() => 2)).toBe(2);
    });
  });

  describe("expect()", () => {
    it("[positive] `expect()` on `Option.Some` should return the value", () => {
      expect(exSome.expect("error")).toBe(1);
    });

    it("[negative] `expect()` on `Option.None` should throw `UnwrapError`", () => {
      expect(() => exNone.expect("error")).toThrow(new UnwrapError("error"));
    });
  });

  describe("map()", () => {
    it("[positive] `map()` on `Option.Some` should return `Option.Some` with the result of the function", () => {
      const expected: Option<string> = Some("1");

      expect(exSome.map((val) => val.toString())).toEqual(expected);
    });

    it("[positive] `map()` on `Option.None` should return `Option.None`", () => {
      const expected: Option<string> = None();

      expect(exNone.map((val) => val.toString())).toEqual(expected);
    });
  });

  describe("okOr()", () => {
    it("[positive] `okOr()` on `Option.Some` should return the value wrapped in `Result.Ok`", () => {
      expect(exSome.okOr(2)).toEqual(Ok(1));
    });

    it("[positive] `okOr()` on `Option.None` should return the fallback value wrapped in `Result.Err`", () => {
      expect(exNone.okOr(2)).toEqual(Err(2));
    });
  });

  describe("and()", () => {
    it("[positive] `and()` on `Option.Some` should return the argument value", () => {
      const expected: Option<string> = Some("1");

      expect(exSome.and(Some("1"))).toEqual(expected);
    });

    it("[positive] `and()` on `Option.None` should return `Option.None`", () => {
      expect(exNone.and(Some(1))).toEqual(None());
    });
  });

  describe("andThen()", () => {
    it("[positive] `andThen()` on `Option.Some` should return the result of the function", () => {
      const expected: Option<string> = Some("1");

      expect(exSome.andThen((val) => Some(val.toString()))).toEqual(expected);
    });

    it("[positive] `andThen()` on `Option.None` should return `Option.None`", () => {
      expect(exNone.andThen((val) => Some(val.toString()))).toEqual(None());
    });
  });

  describe("or()", () => {
    it("[positive] `or()` on `Option.Some` should return its own value", () => {
      const expected: Option<number> = Some(1);

      expect(exSome.or(Some(2))).toEqual(expected);
    });

    it("[positive] `or()` on `Option.None` should return the argument value", () => {
      const expected: Option<number> = Some(2);

      expect(exNone.or(Some(2))).toEqual(expected);
    });
  });

  describe("orElse()", () => {
    it("[positive] `orElse()` on `Option.Some` should return its own value", () => {
      const expected: Option<number> = Some(1);

      expect(exSome.orElse(() => Some(2))).toEqual(expected);
    });

    it("[positive] `orElse()` on `Option.None` should return the result of the function", () => {
      const expected: Option<number> = Some(2);

      expect(exNone.orElse(() => Some(2))).toEqual(expected);
    });
  });

  describe("Type narrowing", () => {
    it("[positive] `isSome()` should narrow `Option<T>` to `Option.Some<T>`", () => {
      const opt: Option<number> = Some(1);
      if (opt.isSome()) {
        expectTypeOf(opt).toEqualTypeOf<Option.Some<number>>();
      }
    });

    it("[positive] `isNone()` should narrow `Option<T>` to `Option.None<T>`", () => {
      const opt: Option<number> = None();
      if (opt.isNone()) {
        expectTypeOf(opt).toEqualTypeOf<Option.None<number>>();
      }
    });

    it("[positive] `isSome()` should narrow the else branch to `Option.None<T>`", () => {
      const opt: Option<number> = None();
      if (opt.isSome()) {
        // unreachable
      } else {
        expectTypeOf(opt).toEqualTypeOf<Option.None<number>>();
      }
    });

    it("[positive] `isNone()` should narrow the else branch to `Option.Some<T>`", () => {
      const opt: Option<number> = Some(1);
      if (opt.isNone()) {
        // unreachable
      } else {
        expectTypeOf(opt).toEqualTypeOf<Option.Some<number>>();
      }
    });
  });
});
