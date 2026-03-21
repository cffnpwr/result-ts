import { describe, expect, expectTypeOf, it } from "bun:test";

import type { Option } from "./option.ts";
import type { Result } from "./result.ts";

import { UnwrapError } from "./error.ts";
import { None, Some } from "./option.ts";
import { Err, Ok } from "./result.ts";

describe("result.ts", () => {
  const exOk = Ok(1) as Result<number, number>;
  const exErr = Err(1) as Result<number, number>;

  describe("Equality test", () => {
    it("[positive] `Result.Ok` with the same value should be equal", () => {
      const ok1 = Ok(1);
      const ok2 = Ok(1);

      expect(ok1).toEqual(ok2);
    });

    it("[positive] `Result.Ok` with different values should not be equal", () => {
      const ok1 = Ok(1);
      const ok2 = Ok(2);

      expect(ok1).not.toEqual(ok2);
    });

    it("[positive] `Result.Err` with the same value should be equal", () => {
      const err1 = Err(1);
      const err2 = Err(1);

      expect(err1).toEqual(err2);
    });

    it("[positive] `Result.Err` with different values should not be equal", () => {
      const err1 = Err(1);
      const err2 = Err(2);

      expect(err1).not.toEqual(err2);
    });

    it("[positive] `Result.Ok` and `Result.Err` should not be equal", () => {
      const ok = Ok(1);
      const err = Err(1);

      expect(ok).not.toEqual(err);
    });
  });

  describe("isOk()", () => {
    it("[positive] `isOk()` on `Result.Ok` should return true", () => {
      expect(exOk.isOk()).toBe(true);
    });

    it("[positive] `isOk()` on `Result.Err` should return false", () => {
      expect(exErr.isOk()).toBe(false);
    });
  });

  describe("isErr()", () => {
    it("[positive] `isErr()` on `Result.Ok` should return false", () => {
      expect(exOk.isErr()).toBe(false);
    });

    it("[positive] `isErr()` on `Result.Err` should return true", () => {
      expect(exErr.isErr()).toBe(true);
    });
  });

  describe("unwrap()", () => {
    it("[positive] `unwrap()` on `Result.Ok` should return the value", () => {
      expect(exOk.unwrap()).toBe(1);
    });

    it("[negative] `unwrap()` on `Result.Err` should throw `UnwrapError`", () => {
      expect(() => exErr.unwrap()).toThrow(UnwrapError);
    });
  });

  describe("unwrapOr()", () => {
    it("[positive] `unwrapOr()` on `Result.Ok` should return its own value", () => {
      expect(exOk.unwrapOr(2)).toBe(1);
    });

    it("[positive] `unwrapOr()` on `Result.Err` should return the fallback value", () => {
      expect(exErr.unwrapOr(2)).toBe(2);
    });
  });

  describe("unwrapOrElse()", () => {
    it("[positive] `unwrapOrElse()` on `Result.Ok` should return its own value", () => {
      expect(exOk.unwrapOrElse(() => 2)).toBe(1);
    });

    it("[positive] `unwrapOrElse()` on `Result.Err` should return the result of the function", () => {
      expect(exErr.unwrapOrElse(() => 2)).toBe(2);
    });
  });

  describe("unwrapErr()", () => {
    it("[negative] `unwrapErr()` on `Result.Ok` should throw `UnwrapError`", () => {
      expect(() => exOk.unwrapErr()).toThrow(UnwrapError);
    });

    it("[positive] `unwrapErr()` on `Result.Err` should return the value", () => {
      expect(exErr.unwrapErr()).toBe(1);
    });
  });

  describe("expect()", () => {
    it("[positive] `expect()` on `Result.Ok` should return the value", () => {
      expect(exOk.expect("Error")).toBe(1);
    });

    it("[negative] `expect()` on `Result.Err` should throw `UnwrapError`", () => {
      expect(() => exErr.expect("Error")).toThrow(new UnwrapError("Error"));
    });
  });

  describe("map()", () => {
    it("[positive] `map()` on `Result.Ok` should return `Result.Ok` with the result of the function", () => {
      const expected: Result<string, number> = Ok("1");

      expect(exOk.map((val) => val.toString())).toEqual(expected);
    });

    it("[positive] `map()` on `Result.Err` should return its own value", () => {
      const expected: Result<string, number> = Err(1);
      expect(exErr.map((val) => val.toString())).toEqual(expected);
    });
  });

  describe("mapErr()", () => {
    it("[positive] `mapErr()` on `Result.Ok` should return its own value", () => {
      const expected: Result<number, string> = Ok(1);

      expect(exOk.mapErr((Err) => Err.toString())).toEqual(expected);
    });

    it("[positive] `mapErr()` on `Result.Err` should return `Result.Err` with the result of the function", () => {
      const expected: Result<number, string> = Err("1");

      expect(exErr.mapErr((Err) => Err.toString())).toEqual(expected);
    });
  });

  describe("ok()", () => {
    it("[positive] `ok()` on `Result.Ok` should return `Option.Some`", () => {
      const expected = Some(1);

      expect(exOk.ok()).toEqual(expected);
    });

    it("[positive] `ok()` on `Result.Err` should return `Option.None`", () => {
      const expected: Option<number> = None();

      expect(exErr.ok()).toEqual(expected);
    });
  });

  describe("err()", () => {
    it("[positive] `err()` on `Result.Ok` should return `Option.None`", () => {
      const expected: Option<number> = None();

      expect(exOk.err()).toEqual(expected);
    });

    it("[positive] `err()` on `Result.Err` should return `Option.Some`", () => {
      const expected = Some(1);

      expect(exErr.err()).toEqual(expected);
    });
  });

  describe("and()", () => {
    it("[positive] `and()` on `Result.Ok` should return the argument value", () => {
      const expected = Ok("1");

      expect(exOk.and(expected)).toEqual(expected);
    });

    it("[positive] `and()` on `Result.Err` should return its own value", () => {
      const expected: Result<string, number> = Err(1);

      expect(exErr.and(Ok("1"))).toEqual(expected);
    });
  });

  describe("andThen()", () => {
    it("[positive] `andThen()` on `Result.Ok` should return the result of the function", () => {
      const expected = Ok("1");

      expect(exOk.andThen((val) => Ok(val.toString()))).toEqual(expected);
    });

    it("[positive] `andThen()` on `Result.Err` should return its own value", () => {
      const expected: Result<string, number> = Err(1);

      expect(exErr.andThen((val) => Ok(val.toString()))).toEqual(expected);
    });
  });

  describe("or()", () => {
    it("[positive] `or()` on `Result.Ok` should return its own value", () => {
      expect(exOk.or(Ok<number, number>(2))).toEqual(exOk);
    });

    it("[positive] `or()` on `Result.Err` should return the argument value", () => {
      const expected = Ok(2);

      expect(exErr.or(expected)).toEqual(expected);
    });
  });

  describe("orElse()", () => {
    it("[positive] `orElse()` on `Result.Ok` should return its own value", () => {
      expect(exOk.orElse(() => Ok<number, number>(2))).toEqual(exOk);
    });

    it("[positive] `orElse()` on `Result.Err` should return the result of the function", () => {
      const expected = Ok(2);

      expect(exErr.orElse(() => expected)).toEqual(expected);
    });
  });
});
