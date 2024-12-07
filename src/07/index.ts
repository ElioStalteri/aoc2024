import { assertEquals } from "@std/assert";

const decoder = new TextDecoder("utf-8");
const dataFile = decoder.decode(
  await Deno.readFile(import.meta.dirname + "/data.txt"),
);
const testFile = decoder.decode(
  await Deno.readFile(import.meta.dirname + "/test.txt"),
);

const permTable: {
  [ops: string]: {
    // deno-lint-ignore no-explicit-any
    [key: number]: any[][];
  };
} = {};

function permStep<T>(ops: T[], times: number): T[][] {
  const opsStr = ops.join("");
  if (!(opsStr in permTable)) permTable[opsStr] = {};
  if (times in permTable[opsStr]) return permTable[opsStr][times];
  if (times === 1) return ops.map((v) => [v]);
  const nextPerm = permStep<T>(ops, times - 1);
  let res: T[][] = [];
  for (const op of ops) {
    res = res.concat(nextPerm.map((v) => [op, ...v]));
  }
  permTable[opsStr][times] = res;
  return res;
}

function part1(data: string) {
  enum OP {
    PLUS = "+",
    MUL = "*",
  }
  const equations = data
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((l) => {
      const [res, eq] = l.split(":", 2);
      return {
        res: parseInt(res),
        eq: eq.trim().split(" ").map((n) => parseInt(n)),
      };
    });

  const res = equations.map(({ res, eq: [first, ...rest] }) => {
    const permCount = [first, ...rest].length - 1;
    const permutations = permStep<OP>(Object.values(OP), permCount);

    for (const perm of permutations) {
      const correct = res === rest.reduce((acc, v, i) => {
        switch (perm[i]) {
          case OP.PLUS:
            return acc + v;
          case OP.MUL:
            return acc * v;
          default:
            throw new Error("OP not found");
        }
      }, first);

      if (correct) return { correct, res };
    }
    return { correct: false, res };
  }).filter(({ correct }) => correct).reduce((acc, { res }) => acc + res, 0);
  return res;
}

function part2(data: string) {
  enum OP {
    PLUS = "+",
    MUL = "*",
    CONCAT = "||",
  }
  const equations = data
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((l) => {
      const [res, eq] = l.split(":", 2);
      return {
        res: parseInt(res),
        eq: eq.trim().split(" ").map((n) => parseInt(n)),
      };
    });

  const res = equations.map(({ res, eq: [first, ...rest] }) => {
    const permCount = [first, ...rest].length - 1;
    const permutations = permStep<OP>(Object.values(OP), permCount);

    for (const perm of permutations) {
      const correct = res === rest.reduce((acc, v, i) => {
        switch (perm[i]) {
          case OP.PLUS:
            return acc + v;
          case OP.MUL:
            return acc * v;
          case OP.CONCAT:
            return parseInt(acc + "" + v);
          default:
            throw new Error("OP not found");
        }
      }, first);

      if (correct) return { correct, res };
    }
    return { correct: false, res };
  }).filter(({ correct }) => correct).reduce((acc, { res }) => acc + res, 0);
  return res;
}

export function solve() {
  return {
    part1: part1(dataFile),
    part2: part2(dataFile),
  };
}

Deno.test(function part1Test() {
  assertEquals(part1(testFile), 3749);
});

Deno.test(function part2Test() {
  assertEquals(part2(testFile), 11387);
});
