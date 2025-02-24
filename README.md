# result-ts

TypeScript向けのRustライクなResult型の実装

[![GitHub License](https://img.shields.io/github/license/cffnpwr/result-ts?style=flat)](/LICENSE)
[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/cffnpwr/result-ts/runtime-test.yaml?branch=main&style=flat&label=runtime+test)](https://github.com/cffnpwr/result-ts/actions/workflows/runtime-test.yaml)
[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/cffnpwr/result-ts/unit-test.yaml&style=flat&label=unit+test)](https://github.com/cffnpwr/result-ts/actions/workflows/unit-test.yaml)
[![JSR Version](https://jsr.io/badges/@cffnpwr/result-ts)](https://jsr.io/@cffnpwr/result-ts)


## Installation

### node

npm

```bash
npx jsr add @cffnpwr/result-ts
```

yarn

```bash
yarn dlx jsr add @cffnpwr/result-ts
```

pnpm

```bash
pnpm dlx jsr add @cffnpwr/result-ts
```

### deno

```bash
deno add jsr:@cffnpwr/result-ts
```

### bun

```bash
bunx jsr add @cffnpwr/result-ts
```

## How to use

```typescript
import { type Result, ok, err } from "@cffnpwr/result-ts";

const result1: Result<number, string> = ok(42);
const result2: Result<number, string> = err("error");

console.log(result1.isOk()); // true
console.log(result1.isErr()); // false
console.log(result1.unwrap()); // 42

console.log(result2.isOk()); // false
console.log(result2.isErr()); // true
console.log(result2.unwrapErr()); // error
```

