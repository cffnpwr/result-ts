import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { Err, Ok, type Result } from "./result.ts";
import { UnwrapError } from "./error.ts";
import { None, Some } from "./option.ts";

describe("result.ts", () => {
  const exOk: Result<number, number> = Ok(1);
  const exErr: Result<number, number> = Err(1);

  describe("等価性", () => {
    it("[正常系] 同一の値を持つOkは等価である", () => {
      const ok1 = Ok(1);
      const ok2 = Ok(1);

      expect(ok1).toEqual(ok2);
    });

    it("[正常系] 異なる値を持つOkは等価でない", () => {
      const ok1 = Ok(1);
      const ok2 = Ok(2);

      expect(ok1).not.toEqual(ok2);
    });

    it("[正常系] 同一の値を持つErrは等価である", () => {
      const err1 = Err(1);
      const err2 = Err(1);

      expect(err1).toEqual(err2);
    });

    it("[正常系] 異なる値を持つErrは等価でない", () => {
      const err1 = Err(1);
      const err2 = Err(2);

      expect(err1).not.toEqual(err2);
    });

    it("[正常系] OkとErrは等価でない", () => {
      const ok = Ok(1);
      const err = Err(1);

      expect(ok).not.toEqual(err);
    });
  });

  describe("isOk()", () => {
    it("[正常系] OkでisOk()を実行するとtrueが返る", () => {
      expect(exOk.isOk()).toBe(true);
    });

    it("[正常系] ErrでisOk()を実行するとfalseが返る", () => {
      expect(exErr.isOk()).toBe(false);
    });
  });

  describe("isErr()", () => {
    it("[正常系] OkでisErr()を実行するとfalseが返る", () => {
      expect(exOk.isErr()).toBe(false);
    });

    it("[正常系] ErrでisErr()を実行するとtrueが返る", () => {
      expect(exErr.isErr()).toBe(true);
    });
  });

  describe("unwrap()", () => {
    it("[正常系] Okでunwrap()を実行すると値が返る", () => {
      expect(exOk.unwrap()).toBe(1);
    });

    it("[異常系] Errでunwrap()を実行するとUnwrapErrorを吐く", () => {
      expect(() => exErr.unwrap()).toThrow(UnwrapError);
    });
  });

  describe("unwrapOr()", () => {
    it("[正常系] OkでunwrapOr()を実行すると自身の値を返す", () => {
      expect(exOk.unwrapOr(2)).toBe(1);
    });

    it("[正常系] ErrでunwrapOr()を実行すると引数の値を返す", () => {
      expect(exErr.unwrapOr(2)).toBe(2);
    });
  });

  describe("unwrapOrElse()", () => {
    it("[正常系] OkでunwrapOrElse()を実行すると自身の値を返す", () => {
      expect(exOk.unwrapOrElse(() => 2)).toBe(1);
    });

    it("[正常系] ErrでunwrapOrElse()を実行すると関数の戻り値を返す", () => {
      expect(exErr.unwrapOrElse(() => 2)).toBe(2);
    });
  });

  describe("unwrapErr()", () => {
    it("[異常系] OkでunwrapErr()を実行するとUnwrapErrorを吐く", () => {
      expect(() => exOk.unwrapErr()).toThrow(UnwrapError);
    });

    it("[正常系] ErrでunwrapErr()を実行すると自身の値を返す", () => {
      expect(exErr.unwrapErr()).toBe(1);
    });
  });

  describe("expect()", () => {
    it("[正常系] Okでexpect()を実行すると値が返る", () => {
      expect(exOk.expect("Error")).toBe(1);
    });

    it("[異常系] Errでexpect()を実行するとUnwrapErrorを吐く", () => {
      expect(() => exErr.expect("Error")).toThrow(new UnwrapError("Error"));
    });
  });

  describe("map()", () => {
    it("[正常系] Okでmap()を実行すると引数の関数を実行した結果のOkが返る", () => {
      const expected: Result<string, number> = Ok("1");

      expect(exOk.map((val) => val.toString())).toEqual(expected);
    });

    it("[正常系] Errでmap()を実行すると自身の値を返す", () => {
      expect(exErr.map((val) => val.toString())).toEqual(exErr);
    });
  });

  describe("mapErr()", () => {
    it("[正常系] OkでmapErr()を実行すると自身の値を返す", () => {
      expect(exOk.mapErr((Err) => Err.toString())).toEqual(exOk);
    });

    it("[正常系] ErrでmapErr()を実行すると引数の関数を実行した結果のErrが返る", () => {
      const expected: Result<number, string> = Err("1");

      expect(exErr.mapErr((Err) => Err.toString())).toEqual(expected);
    });
  });

  describe("Ok()", () => {
    it("[正常系] OkでOk()を実行するとSomeが返る", () => {
      const expected = Some(1);

      expect(exOk.ok()).toEqual(expected);
    });

    it("[正常系] ErrでOk()を実行するとNoneが返る", () => {
      const expected = None();

      expect(exErr.ok()).toEqual(expected);
    });
  });

  describe("Err()", () => {
    it("[正常系] OkでErr()を実行するとNoneが返る", () => {
      const expected = None();

      expect(exOk.err()).toEqual(expected);
    });

    it("[正常系] ErrでErr()を実行するとSomeが返る", () => {
      const expected = Some(1);

      expect(exErr.err()).toEqual(expected);
    });
  });

  describe("and()", () => {
    it("[正常系] Okでand()を実行すると引数のResultを返す", () => {
      const expected = Ok("1");

      expect(exOk.and(expected)).toEqual(expected);
    });

    it("[正常系] Errでand()を実行すると自身の値を返す", () => {
      expect(exErr.and(Ok("1"))).toEqual(exErr);
    });
  });

  describe("andThen()", () => {
    it("[正常系] OkでandThen()を実行すると引数の関数を実行した結果のResultが返る", () => {
      const expected = Ok("1");

      expect(exOk.andThen((val) => Ok(val.toString()))).toEqual(expected);
    });

    it("[正常系] ErrでandThen()を実行すると自身の値を返す", () => {
      expect(exErr.andThen((val) => Ok(val.toString()))).toEqual(exErr);
    });
  });

  describe("or()", () => {
    it("[正常系] Okでor()を実行すると自身の値を返す", () => {
      expect(exOk.or(Ok(2))).toEqual(exOk);
    });

    it("[正常系] Errでor()を実行すると引数の値を返す", () => {
      const expected = Ok(2);

      expect(exErr.or(expected)).toEqual(expected);
    });
  });

  describe("orElse()", () => {
    it("[正常系] OkでorElse()を実行すると自身の値を返す", () => {
      expect(exOk.orElse(() => Ok(2))).toEqual(exOk);
    });

    it("[正常系] ErrでorElse()を実行すると関数の戻り値を返す", () => {
      const expected = Ok(2);

      expect(exErr.orElse(() => expected)).toEqual(expected);
    });
  });
});
