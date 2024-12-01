import { assertEquals } from "@std/assert";

const decoder = new TextDecoder("utf-8");
const dataFile = decoder.decode(
  await Deno.readFile(import.meta.dirname + "/data.txt"),
);
const testFile = decoder.decode(
  await Deno.readFile(import.meta.dirname + "/test.txt"),
);

function part1(data: string) {
  const lines = data.split("\n");
  const [list1, list2] = lines.filter(Boolean).reduce(
    ([list1, list2], line) => {
      const [n1, n2] = line.trim().split(/\s+/, 2);
      return [
        [...list1, parseInt(n1)],
        [...list2, parseInt(n2)],
      ];
    },
    [[], []] as [number[], number[]],
  );

  list1.sort();
  list2.sort();

  return list1.reduce((sum, _, i) => sum + Math.abs(list2[i] - list1[i]), 0);
}

function part2(data: string) {
  const lines = data.split("\n");
  const [list1, list2] = lines.filter(Boolean).reduce(
    ([list1, list2], line) => {
      const [n1, n2] = line.trim().split(/\s+/, 2);
      return [
        [...list1, parseInt(n1)],
        [...list2, parseInt(n2)],
      ];
    },
    [[], []] as [number[], number[]],
  );

  const list1Set = new Set(list1);
  const list1Map = new Map();
  list1Set.forEach((key) =>
    list1Map.set(key, list2.filter((v) => v === key).length)
  );

  return list1.reduce((acc, key) => acc + (key * list1Map.get(key)), 0);
}

export function solve() {
  return {
    part1: part1(dataFile),
    part2: part2(dataFile),
  };
}

Deno.test(function part1Test() {
  assertEquals(part1(testFile), 11);
});

Deno.test(function part2Test() {
  assertEquals(part2(testFile), 31);
});
