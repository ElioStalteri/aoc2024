import { assertEquals } from "@std/assert";

const decoder = new TextDecoder("utf-8");
const dataFile = decoder.decode(
  await Deno.readFile(import.meta.dirname + "/data.txt"),
);
const testFile = decoder.decode(
  await Deno.readFile(import.meta.dirname + "/test.txt"),
);

const MIN_CHANGE = 1;
const MAX_CHANGE = 3;

function part1(data: string) {
  let lines = data.split("\n");
  lines = lines.filter(Boolean);
  const reports = lines.map((l) => l.trim().split(" ").map((n) => parseInt(n)));
  return reports.map((r) => {
    const is_increasing = r[r.length - 1] - r[0] > 0;
    for (let i = 1; i < r.length; i++) {
      const change = r[i] - r[i - 1];
      const is_change_incresing = change > 0;
      const too_large = Math.abs(change) > MAX_CHANGE;
      const too_small = Math.abs(change) < MIN_CHANGE;
      if (
        is_change_incresing !== is_increasing || too_large || too_small
      ) {
        return false;
      }
    }
    return true;
  }).filter(Boolean).length;
}

function check_bad_level(is_increasing: boolean, a: number, b: number) {
  const change = a - b;
  const is_change_incresing = change > 0;
  const too_large = Math.abs(change) > MAX_CHANGE;
  const too_small = Math.abs(change) < MIN_CHANGE;
  return is_change_incresing !== is_increasing || too_large || too_small;
}

function part2(data: string) {
  let lines = data.split("\n");
  lines = lines.filter(Boolean);
  const reports = lines.map((l) => l.trim().split(" ").map((n) => parseInt(n)));
  return reports.map((_r) => {
    const r = _r;
    let tollerance = 1;
    const is_increasing = r[r.length - 1] - r[0] > 0;
    for (let i = 1; i < r.length; i++) {
      const bad = check_bad_level(is_increasing, r[i], r[i - 1]);
      if (bad) {
        if (tollerance == 1) {
          const prev_bad = i == 1
            ? false
            : check_bad_level(is_increasing, r[i], r[i - 2]);
          const curr_bad = r.length - 1 === i
            ? false
            : check_bad_level(is_increasing, r[i + 1], r[i - 1]);

          if (i === 1) {
            if (!curr_bad) {
              r.splice(i, 1);
              i--;
              tollerance--;
              continue;
            }
            if (!prev_bad) {
              r.splice(i - 1, 1);
              i--;
              tollerance--;
              continue;
            }
          } else {
            if (!prev_bad) {
              r.splice(i - 1, 1);
              i--;
              tollerance--;
              continue;
            }
            if (!curr_bad) {
              r.splice(i, 1);
              i--;
              tollerance--;
              continue;
            }
          }
        }
        return false;
      }
    }
    return true;
  }).filter(Boolean).length;
}

export function solve() {
  return {
    part1: part1(dataFile),
    part2: part2(dataFile),
  };
}

Deno.test(function part1Test() {
  assertEquals(part1(testFile), 2);
});

Deno.test(function part2Test() {
  assertEquals(part2(testFile), 8);
});
