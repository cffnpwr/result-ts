import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { None, type Option, Some } from "./option.ts";
import { UnwrapError } from "./error.ts";
import { Err, Ok } from "./result.ts";

describe("option.ts", () => {
  const exSome: Option<number> = Some(1);
  const exNone: Option<number> = None();

  describe("等価性", () => {
    it("[正常系] 同一の値を持つSomeは等価である", () => {
      const some1 = Some(1);
      const some2 = Some(1);

      expect(some1).toEqual(some2);
    });

    it("[正常系] 異なる値を持つSomeは等価でない", () => {
      const some1 = Some(1);
      const some2 = Some(2);

      expect(some1).not.toEqual(some2);
    });

    it("[正常系] SomeとNoneは等価でない", () => {
      const some = Some(1);
      const none = None();

      expect(some).not.toEqual(none);
    });

    it("[正常系] 同一の値を持つNoneは等価である", () => {
      const none1 = None();
      const none2 = None();

      expect(none1).toEqual(none2);
    });
  });

  describe("isSome()", () => {
    it("[正常系] SomeでisSome()を実行するとtrueが返る", () => {
      expect(exSome.isSome()).toBe(true);
    });

    it("[正常系] NoneでisSome()を実行するとfalseが返る", () => {
      expect(exNone.isSome()).toBe(false);
    });
  });

  describe("isNone()", () => {
    it("[正常系] SomeでisNone()を実行するとfalseが返る", () => {
      expect(exSome.isNone()).toBe(false);
    });

    it("[正常系] NoneでisNone()を実行するとtrueが返る", () => {
      expect(exNone.isNone()).toBe(true);
    });
  });

  describe("unwrap()", () => {
    it("[正常系] Someでunwrap()を実行すると値が返る", () => {
      expect(exSome.unwrap()).toBe(1);
    });

    it("[異常系] Noneでunwrap()を実行するとUnwrapErrorを吐く", () => {
      expect(() => exNone.unwrap()).toThrow(UnwrapError);
    });
  });

  describe("unwrapOr()", () => {
    it("[正常系] SomeでunwrapOr()を実行すると自身の値を返す", () => {
      expect(exSome.unwrapOr(2)).toBe(1);
    });

    it("[正常系] NoneでunwrapOr()を実行すると引数の値を返す", () => {
      expect(exNone.unwrapOr(2)).toBe(2);
    });
  });

  describe("unwrapOrElse()", () => {
    it("[正常系] SomeでunwrapOrElse()を実行すると自身の値を返す", () => {
      expect(exSome.unwrapOrElse(() => 2)).toBe(1);
    });

    it("[正常系] NoneでunwrapOrElse()を実行すると関数の戻り値を返す", () => {
      expect(exNone.unwrapOrElse(() => 2)).toBe(2);
    });
  });

  describe("expect()", () => {
    it("[正常系] Someでexpect()を実行すると値が返る", () => {
      expect(exSome.expect("error")).toBe(1);
    });

    it("[異常系] Noneでexpect()を実行するとUnwrapErrorを吐く", () => {
      expect(() => exNone.expect("error")).toThrow(new UnwrapError("error"));
    });
  });

  describe("map()", () => {
    it("[正常系] Someでmap()を実行すると引数の関数を実行した結果のSomeが返る", () => {
      const expected: Option<string> = Some("1");

      expect(exSome.map((val) => val.toString())).toEqual(expected);
    });

    it("[正常系] Noneでmap()を実行すると自身の値を返す", () => {
      const expected: Option<string> = None();

      expect(exNone.map((val) => val.toString())).toEqual(expected);
    });
  });

  describe("okOr()", () => {
    it("[正常系] SomeでokOr()を実行すると自身の値をOkで包んで返す", () => {
      expect(exSome.okOr(2)).toEqual(Ok(1));
    });

    it("[正常系] NoneでokOr()を実行すると引数の値をErrで包んで返す", () => {
      expect(exNone.okOr(2)).toEqual(Err(2));
    });
  });

  describe("and()", () => {
    it("[正常系] Someでand()を実行すると引数の値を返す", () => {
      const expected: Option<string> = Some("1");

      expect(exSome.and(Some("1"))).toEqual(expected);
    });

    it("[正常系] Noneでand()を実行するとNoneを返す", () => {
      expect(exNone.and(Some(1))).toEqual(None());
    });
  });

  describe("andThen()", () => {
    it("[正常系] SomeでandThen()を実行すると引数の関数を実行した結果を返す", () => {
      const expected: Option<string> = Some("1");

      expect(exSome.andThen((val) => Some(val.toString()))).toEqual(expected);
    });

    it("[正常系] NoneでandThen()を実行するとNoneを返す", () => {
      expect(exNone.andThen((val) => Some(val.toString()))).toEqual(None());
    });
  });

  describe("or()", () => {
    it("[正常系] Someでor()を実行すると自身の値を返す", () => {
      const expected: Option<number> = Some(1);

      expect(exSome.or(Some(2))).toEqual(expected);
    });

    it("[正常系] Noneでor()を実行すると引数の値を返す", () => {
      const expected: Option<number> = Some(2);

      expect(exNone.or(Some(2))).toEqual(expected);
    });
  });

  describe("orElse()", () => {
    it("[正常系] SomeでorElse()を実行すると自身の値を返す", () => {
      const expected: Option<number> = Some(1);

      expect(exSome.orElse(() => Some(2))).toEqual(expected);
    });

    it("[正常系] NoneでorElse()を実行すると関数の戻り値を返す", () => {
      const expected: Option<number> = Some(2);

      expect(exNone.orElse(() => Some(2))).toEqual(expected);
    });
  });
});
