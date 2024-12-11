import { assertEquals } from "@std/assert";

const decoder = new TextDecoder("utf-8");
const dataFile = decoder.decode(
  await Deno.readFile(import.meta.dirname + "/data.txt"),
);
const testFile = decoder.decode(
  await Deno.readFile(import.meta.dirname + "/test.txt"),
);

const compute = (n: number) => {
  //If the stone is engraved with the number 0, it is replaced by a stone engraved with the number 1.
  if (n === 0) return [1];
  //If the stone is engraved with a number that has an even number of digits, it is replaced by two stones. The left half of the digits are engraved on the new left stone, and the right half of the digits are engraved on the new right stone. (The new numbers don't keep extra leading zeroes: 1000 would become stones 10 and 0.)
  const digits = `${n}`.split("");
  if (digits.length % 2 === 0) {
    const n1 = digits.slice(0, digits.length / 2).join("");
    const n2 = digits.slice(digits.length / 2).join("");
    if (Number.isNaN(parseInt(n1)) || Number.isNaN(parseInt(n2))) {
      console.log(n1, n2, digits.length / 2);
      throw new Error("NANANANANNA");
    }
    return [parseInt(n1), parseInt(n2)];
  }
  //If none of the other rules apply, the stone is replaced by a new stone; the old stone's number multiplied by 2024 is engraved on the new stone.
  return [n * 2024];
};

const memory: { [key: string]: number } = {};

const computeRec = (n: number, max = 75): number => {
  const key = `${n}|${max}`;
  if (key in memory) return memory[key];
  //If the stone is engraved with the number 0, it is replaced by a stone engraved with the number 1.
  if (n === 0) {
    const res = max === 1 ? 1 : computeRec(1, max - 1);
    memory[key] = res;
    return res;
  }
  //If the stone is engraved with a number that has an even number of digits, it is replaced by two stones. The left half of the digits are engraved on the new left stone, and the right half of the digits are engraved on the new right stone. (The new numbers don't keep extra leading zeroes: 1000 would become stones 10 and 0.)
  const digits = `${n}`.split("");
  if (digits.length % 2 === 0) {
    const n1s = digits.slice(0, digits.length / 2).join("");
    const n2s = digits.slice(digits.length / 2).join("");
    const n1 = parseInt(n1s);
    const n2 = parseInt(n2s);
    if (Number.isNaN(n1) || Number.isNaN(n2)) {
      console.log(n1s, n2s, digits.length / 2);
      throw new Error("NANANANANNA");
    }
    const res = max === 1
      ? 2
      : computeRec(n1, max - 1) + computeRec(n2, max - 1);
    memory[key] = res;
    return res;
  }
  //If none of the other rules apply, the stone is replaced by a new stone; the old stone's number multiplied by 2024 is engraved on the new stone.
  const res = max === 1 ? 1 : computeRec(n * 2024, max - 1);
  memory[key] = res;
  return res;
};

function part1(data: string) {
  let numbers = data.trim().split(/\s+/i).map((v) => parseInt(v));

  for (let i = 0; i < 25; i++) {
    numbers = numbers.flatMap(compute);
  }

  return numbers.length;
}

function part2(data: string) {
  const numbers = data.trim().split(/\s+/i).map((v) => parseInt(v));

  const res = numbers.map((v) => computeRec(v));

  return res.reduce((acc, v) => acc + v, 0).toString();
}

export function solve() {
  return {
    part1: part1(dataFile),
    part2: part2(dataFile),
  };
}

Deno.test(function part1Test() {
  assertEquals(part1(testFile), 55312);
});

Deno.test(function part2Test() {
  assertEquals(part2(testFile), "65601038650482");
});
