import { assertEquals } from "@std/assert";

const decoder = new TextDecoder("utf-8");
const dataFile = decoder.decode(
  await Deno.readFile(import.meta.dirname + "/data.txt"),
);
const testFile = decoder.decode(
  await Deno.readFile(import.meta.dirname + "/test.txt"),
);

function part1(data: string) {
  let filesLength = 0;
  const memory = data.trim().split("").flatMap((v, i) => {
    const amount = parseInt(v);
    filesLength += i % 2 === 0 ? amount : 0;
    return new Array(amount).fill(i % 2 === 0 ? `${i / 2}` : ".");
  });

  for (let i = 0; i <= filesLength; i++) {
    const val = memory[i];
    if (val === ".") {
      for (let j = memory.length - 1; j > i; j--) {
        if (memory[j] !== ".") {
          memory[i] = memory[j];
          memory[j] = ".";
          break;
        }
      }
    }
  }

  return memory.filter((v) => v !== ".").map((v, i) => parseInt(v) * i).reduce(
    (acc, v) => acc + v,
    0,
  );
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
  assertEquals(part1(testFile), 1928);
});

Deno.test(function part2Test() {
  assertEquals(part2(testFile), "todo");
});
