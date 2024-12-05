import { assertEquals } from "@std/assert";

const decoder = new TextDecoder("utf-8");
const dataFile = decoder.decode(
  await Deno.readFile(import.meta.dirname + "/data.txt"),
);
const testFile = decoder.decode(
  await Deno.readFile(import.meta.dirname + "/test.txt"),
);

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
      const updateRev = update.toReversed();
      const toCheck = new Set<string>();
      for (let i = 0; i < updateRev.length - 1; i++) {
        for (let j = i + 1; j < updateRev.length; j++) {
          toCheck.add(`${updateRev[i]}|${updateRev[j]}`);
        }
      }
      return {
        middle,
        toCheck,
        //updateStr,
        //intersection: rules.intersection(toCheck),
      };
    })
    .filter(({ toCheck }) => rules.intersection(toCheck).size === 0);

  //console.log(rules, updates);

  return updates
    .reduce((acc, v) => acc + v.middle, 0);
}

function part2(_data: string) {
  return "todo";
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
  assertEquals(part2(testFile), "todo");
});
