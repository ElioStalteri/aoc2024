import { assertEquals } from "@std/assert";

const decoder = new TextDecoder("utf-8");
const dataFile = decoder.decode(
  await Deno.readFile(import.meta.dirname + "/data.txt"),
);
const testFile = decoder.decode(
  await Deno.readFile(import.meta.dirname + "/test.txt"),
);

function checkOrder(rules: Set<string>, update: string[]) {
  const updateRev = update.toReversed();
  const toCheck = new Set<string>();
  for (let i = 0; i < updateRev.length - 1; i++) {
    for (let j = i + 1; j < updateRev.length; j++) {
      toCheck.add(`${updateRev[i]}|${updateRev[j]}`);
    }
  }
  const toFix = rules.intersection(toCheck);
  return { toFix, correct: toFix.size === 0 };
}

function fixOrder(rules: Set<string>, update: string[]): string[] {
  const { correct, toFix } = checkOrder(rules, update);
  if (correct) return update;
  const toFixArr = Array.from(toFix).map((v) => v.split("|"))
    .toSorted(([a1, a2], [b1, b2]) => {
      if (a2 === b2) {
        return update.indexOf(a1) - update.indexOf(b1);
      }
      return update.indexOf(a2) - update.indexOf(b2);
    });

  const corrected = [...update];
  for (const [after, before] of toFixArr) {
    const aIdx = corrected.indexOf(after);
    const bIdx = corrected.indexOf(before);
    corrected[aIdx] = before;
    corrected[bIdx] = after;
  }

  return checkOrder(rules, corrected).correct
    ? corrected
    : fixOrder(rules, corrected);
}

function part1(data: string) {
  const [rulesString, updatesString] = data.trim().split("\n\n", 2);
  const rules = new Set(
    rulesString.split("\n")
      .map((v) => v.trim())
      .filter(Boolean),
  );
  const updates = updatesString.split("\n")
    .map((v) => v.trim())
    .filter(
      Boolean,
    ).map((updateStr) => {
      const update = updateStr.trim().split(",");
      if (update.length % 2 == 0) {
        throw new Error("not correct -> " + updatesString);
      }
      const middle = parseInt(update[(update.length - 1) / 2]);
      return {
        middle,
        correct: checkOrder(rules, update).correct,
      };
    })
    .filter(({ correct }) => correct);

  return updates
    .reduce((acc, v) => acc + v.middle, 0);
}

function part2(data: string) {
  const [rulesString, updatesString] = data.trim().split("\n\n", 2);
  const rules = new Set(
    rulesString.split("\n")
      .map((v) => v.trim())
      .filter(Boolean),
  );
  const updates = updatesString.split("\n")
    .map((v) => v.trim())
    .filter(
      Boolean,
    ).map((updateStr) => {
      const update = updateStr.trim().split(",");
      if (update.length % 2 == 0) {
        throw new Error("not correct -> " + updatesString);
      }
      return {
        update,
        correct: checkOrder(rules, update).correct,
      };
    })
    .filter(({ correct }) => !correct)
    .map(({ update }) => {
      const corrected = fixOrder(rules, update);
      const middle = parseInt(corrected[(corrected.length - 1) / 2]);
      return { middle };
    });

  return updates
    .reduce((acc, v) => acc + v.middle, 0);
}

export function solve() {
  return {
    part1: part1(dataFile),
    part2: part2(dataFile),
  };
}

Deno.test(function part1Test() {
  assertEquals(part1(testFile), 143);
});

Deno.test(function part2Test() {
  assertEquals(part2(testFile), 123);
});
