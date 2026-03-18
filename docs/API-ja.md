# APIリファレンス

[API Reference for English is available here](./API.md)

## Result\<T, E\>

成功（`Ok<T, E>`）または失敗（`Err<T, E>`）を表す型。

### コンストラクタ

| 関数 | 説明 |
|---|---|
| `Ok<T, E>(value: T): Result<T, E>` | 成功値を生成する。 |
| `Err<T, E>(error: E): Result<T, E>` | 失敗値を生成する。 |

### メソッド

| メソッド | シグネチャ | 説明 |
|---|---|---|
| `isOk` | `() => boolean` | 結果が`Ok`なら`true`を返す。 |
| `isErr` | `() => boolean` | 結果が`Err`なら`true`を返す。 |
| `unwrap` | `() => T` | `Ok`の値を返す。`Err`の場合は`UnwrapError`をスローする。 |
| `unwrapOr` | `(val: T) => T` | `Ok`の値を返す。`Err`の場合は`val`を返す。 |
| `unwrapOrElse` | `(fn: () => T) => T` | `Ok`の値を返す。`Err`の場合は`fn`の返り値を返す。 |
| `unwrapErr` | `() => E` | `Err`の値を返す。`Ok`の場合は`UnwrapError`をスローする。 |
| `expect` | `(msg: string) => T` | `Ok`の値を返す。`Err`の場合は`msg`付きで`UnwrapError`をスローする。 |
| `map` | `<U>(fn: (val: T) => U) => Result<U, E>` | `Ok`の値に`fn`を適用する。`Err`はそのまま返す。 |
| `mapErr` | `<U>(fn: (err: E) => U) => Result<T, U>` | `Err`の値に`fn`を適用する。`Ok`はそのまま返す。 |
| `ok` | `() => Option<T>` | `Option<T>`に変換する。エラー値は破棄される。 |
| `err` | `() => Option<E>` | `Option<E>`に変換する。成功値は破棄される。 |
| `and` | `<U>(res: Result<U, E>) => Result<U, E>` | `Ok`なら`res`を返す。`Err`なら`Err`の値を返す。 |
| `andThen` | `<U>(fn: (val: T) => Result<U, E>) => Result<U, E>` | `Ok`なら`fn`を呼び出す。`Err`なら`Err`の値を返す。 |
| `or` | `<F>(res: Result<T, F>) => Result<T, F>` | `Ok`なら`Ok`の値を返す。`Err`なら`res`を返す。 |
| `orElse` | `<F>(fn: (err: E) => Result<T, F>) => Result<T, F>` | `Ok`なら`Ok`の値を返す。`Err`なら`fn`を呼び出す。 |

### 使用例

```typescript
import { type Result, Ok, Err } from "@cffnpwr/result-ts";

// 基本的な使い方
const ok: Result<number, string> = Ok(42);
const err: Result<number, string> = Err("エラーが発生しました");

ok.isOk();    // true
ok.isErr();   // false
ok.unwrap();  // 42

err.isOk();       // false
err.isErr();      // true
err.unwrapErr();  // "エラーが発生しました"

// unwrapOr / unwrapOrElse
err.unwrapOr(0);            // 0
err.unwrapOrElse(() => -1); // -1

// map / mapErr
Ok(42).map((n) => n * 2);                     // Ok(84)
Err("err").mapErr((e) => e.toUpperCase());     // Err("ERR")

// and / andThen
Ok(1).and(Ok(2));    // Ok(2)
Err("e").and(Ok(2)); // Err("e")

Ok(1).andThen((n) => Ok(n + 1));    // Ok(2)
Err("e").andThen((n) => Ok(n + 1)); // Err("e")

// or / orElse
Ok(1).or(Ok(2));    // Ok(1)
Err("e").or(Ok(2)); // Ok(2)

Ok(1).orElse(() => Ok(2));    // Ok(1)
Err("e").orElse(() => Ok(2)); // Ok(2)

// ok / err (Optionへの変換)
Ok(42).ok();    // Some(42)
Ok(42).err();   // None
Err("e").ok();  // None
Err("e").err(); // Some("e")
```

---

## Option\<T\>

値あり（`Some<T>`）または値なし（`None`）を表す型。

### コンストラクタ

| 関数 | 説明 |
|---|---|
| `Some<T>(value: T): Option<T>` | 値ありのオプションを生成する。 |
| `None<T>(): Option<T>` | 値なしのオプションを生成する。 |

### メソッド

| メソッド | シグネチャ | 説明 |
|---|---|---|
| `isSome` | `() => boolean` | `Some`なら`true`を返す。 |
| `isNone` | `() => boolean` | `None`なら`true`を返す。 |
| `unwrap` | `() => T` | `Some`の値を返す。`None`の場合は`UnwrapError`をスローする。 |
| `unwrapOr` | `(val: T) => T` | `Some`の値を返す。`None`の場合は`val`を返す。 |
| `unwrapOrElse` | `(fn: () => T) => T` | `Some`の値を返す。`None`の場合は`fn`の返り値を返す。 |
| `expect` | `(msg: string) => T` | `Some`の値を返す。`None`の場合は`msg`付きで`UnwrapError`をスローする。 |
| `map` | `<U>(fn: (val: T) => U) => Option<U>` | `Some`の値に`fn`を適用する。`None`はそのまま返す。 |
| `okOr` | `<E>(err: E) => Result<T, E>` | `Some(v)`を`Ok(v)`に、`None`を`Err(err)`に変換する。 |
| `and` | `<U>(optb: Option<U>) => Option<U>` | `Some`なら`optb`を返す。`None`なら`None`を返す。 |
| `andThen` | `<U>(fn: (val: T) => Option<U>) => Option<U>` | `Some`なら`fn`を呼び出す。`None`なら`None`を返す。 |
| `or` | `(optb: Option<T>) => Option<T>` | `Some`ならそのまま返す。`None`なら`optb`を返す。 |
| `orElse` | `(fn: () => Option<T>) => Option<T>` | `Some`ならそのまま返す。`None`なら`fn`を呼び出す。 |

### 使用例

```typescript
import { type Option, Some, None } from "@cffnpwr/result-ts";

// 基本的な使い方
const some: Option<number> = Some(42);
const none: Option<number> = None();

some.isSome();  // true
some.isNone();  // false
some.unwrap();  // 42

none.isSome();               // false
none.isNone();               // true
none.unwrapOr(-1);           // -1
none.unwrapOrElse(() => -1); // -1

// map
Some(42).map((n) => n * 2);         // Some(84)
None<number>().map((n) => n * 2);   // None

// okOr (Resultへの変換)
Some(42).okOr("エラー");   // Ok(42)
None().okOr("エラー");     // Err("エラー")

// and / andThen
Some(1).and(Some(2));  // Some(2)
None().and(Some(2));   // None

Some(1).andThen((n) => Some(n + 1));          // Some(2)
None<number>().andThen((n) => Some(n + 1));   // None

// or / orElse
Some(1).or(Some(2));  // Some(1)
None().or(Some(2));   // Some(2)

Some(1).orElse(() => Some(2));          // Some(1)
None<number>().orElse(() => Some(2));   // Some(2)
```

---

## エラー

### UnwrapError

期待するバリアント（`Ok`/`Some` or `Err`/`None`）でない値に対して`unwrap()`、`unwrapErr()`、または`expect()`を呼び出した際にスローされる。

```typescript
import { Err } from "@cffnpwr/result-ts";

try {
  Err("エラー").unwrap();
} catch (e) {
  // e は UnwrapError
}
```
