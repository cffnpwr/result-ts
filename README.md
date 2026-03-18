# result-ts

Rust-like Result/Option type implementation for TypeScript.

[![GitHub License](https://img.shields.io/github/license/cffnpwr/result-ts?style=flat)](/LICENSE)
[![Unit Test](https://github.com/cffnpwr/result-ts/actions/workflows/unit-test.yaml/badge.svg)](https://github.com/cffnpwr/result-ts/actions/workflows/unit-test.yaml)
[![Runtime Test](https://github.com/cffnpwr/result-ts/actions/workflows/runtime-test.yaml/badge.svg)](https://github.com/cffnpwr/result-ts/actions/workflows/runtime-test.yaml)
[![npm Version](https://img.shields.io/npm/v/%40cffnpwr%2Fresult-ts?style=flat)](https://www.npmjs.com/package/@cffnpwr/result-ts)
[![JSR Version](https://jsr.io/badges/@cffnpwr/result-ts)](https://jsr.io/@cffnpwr/result-ts)

[日本語版のREADMEはこちら](./README-ja.md)

## Installation

### npm

```sh
npm install @cffnpwr/result-ts
```

or

```sh
npx jsr add @cffnpwr/result-ts
```

### yarn

```sh
yarn add @cffnpwr/result-ts
```

or

```sh
yarn dlx jsr add @cffnpwr/result-ts
```

### pnpm

```sh
pnpm add @cffnpwr/result-ts
```

or

```sh
pnpm dlx jsr add @cffnpwr/result-ts
```

### Bun

```sh
bun add @cffnpwr/result-ts
```

or

```sh
bunx jsr add @cffnpwr/result-ts
```

### Deno

```sh
deno add npm:@cffnpwr/result-ts
```

or

```sh
deno add jsr:@cffnpwr/result-ts
```

## How to Use

### Result type

```typescript
import { type Result, Ok, Err } from "@cffnpwr/result-ts";

const result1: Result<number, string> = Ok(42);
const result2: Result<number, string> = Err("error");

console.log(result1.isOk()); // true
console.log(result1.isErr()); // false
console.log(result1.unwrap()); // 42

console.log(result2.isOk()); // false
console.log(result2.isErr()); // true
console.log(result2.unwrapErr()); // "error"

// Transform values
const doubled = result1.map((n) => n * 2);
console.log(doubled.unwrap()); // 84

// Chain operations
const parsed: Result<number, string> = Ok("42").andThen((s) => {
  const n = Number(s);
  return Number.isNaN(n) ? Err("not a number") : Ok(n);
});
console.log(parsed.unwrap()); // 42
```

### Option type

```typescript
import { type Option, Some, None } from "@cffnpwr/result-ts";

const some: Option<number> = Some(42);
const none: Option<number> = None();

console.log(some.isSome()); // true
console.log(some.isNone()); // false
console.log(some.unwrap()); // 42

console.log(none.isSome()); // false
console.log(none.isNone()); // true
console.log(none.unwrapOr(-1)); // -1

// Convert to Result
const result = none.okOr("no value");
console.log(result.isErr()); // true
console.log(result.unwrapErr()); // "no value"
```

## API Reference

See [docs/API.md](./docs/API.md) for full API documentation.

## License

[MIT License](./LICENSE)
