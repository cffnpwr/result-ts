import { expect, it } from "vitest";

import { toString } from "./toString";

it("string to string", () => {
  expect(toString("hoge")).toBe("hoge");
});

it("number to string", () => {
  expect(toString(3)).toBe("3");
});

it("bigint to string", () => {
  expect(toString(BigInt("12345678901234567890"))).toBe("12345678901234567890");
});

it("boolean to string", () => {
  expect(toString(true)).toBe("true");
  expect(toString(false)).toBe("false");
});

it("json to string", () => {
  const json = JSON.stringify({
    hoge: "aaaa",
    fuga: 5,
    piyo: false,
    puyo: ["a", "b", "c"],
  });

  expect(toString(JSON.parse(json))).toBe(json);
});
