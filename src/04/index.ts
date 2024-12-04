import { assertEquals } from "@std/assert";

const decoder = new TextDecoder("utf-8");
const dataFile = decoder.decode(
  await Deno.readFile(import.meta.dirname + "/data.txt"),
);
const testFile = decoder.decode(
  await Deno.readFile(import.meta.dirname + "/test.txt"),
);

function part1(data: string) {
  const WORD = "XMAS";
  const matrix = data.trim().split("\n").filter(Boolean).map((r) =>
    r.trim().split("")
  );
  const firstLetterPos = matrix.flatMap((r, y) =>
    r.map((letter, x) => letter === WORD.at(0) ? [x, y] : undefined)
  ).filter(Boolean) as [number, number][];

  const lastLetterPos = matrix.flatMap((r, y) =>
    r.map((letter, x) =>
      letter === WORD.at(WORD.length - 1) ? [x, y] : undefined
    )
  ).filter(Boolean) as [number, number][];

  const candidates: {
    start: [number, number];
    end: [number, number];
  }[] = [];

  for (const [fx, fy] of firstLetterPos) {
    for (const [lx, ly] of lastLetterPos) {
      if (
        (Math.abs(lx - fx) === WORD.length - 1 &&
          Math.abs(ly - fy) === WORD.length - 1) ||
        (Math.abs(lx - fx) === 0 && Math.abs(ly - fy) === WORD.length - 1) ||
        (Math.abs(lx - fx) === WORD.length - 1 && Math.abs(ly - fy) === 0)
      ) {
        candidates.push({
          start: [fx, fy],
          end: [lx, ly],
        });
      }
    }
  }

  let count = 0;

  for (const { start: [fx, fy], end: [lx, ly] } of candidates) {
    let correct = true;
    for (let i = 1; i < WORD.length - 1; i++) {
      if (Math.abs(ly - fy) === 0) {
        // horizontal
        const direction = (lx - fx) / Math.abs(lx - fx);
        if (matrix[fy][fx + (i * direction)] !== WORD.at(i)) {
          correct = false;
          break;
        }
      } else if (Math.abs(lx - fx) === 0) {
        // vertical
        const direction = (ly - fy) / Math.abs(ly - fy);
        if (matrix[fy + (i * direction)][fx] !== WORD.at(i)) {
          correct = false;
          break;
        }
      } else {
        // diagonal
        const directionX = (lx - fx) / Math.abs(lx - fx);
        const directionY = (ly - fy) / Math.abs(ly - fy);
        if (
          matrix[fy + (i * directionY)][fx + (i * directionX)] !== WORD.at(i)
        ) {
          correct = false;
          break;
        }
      }
    }
    if (correct) count++;
  }

  return count;
}

function part2(data: string) {
  const CENTER = "A";
  const CORNERS = ["M", "S"];
  const matrix = data.trim().split("\n").filter(Boolean).map((r) =>
    r.trim().split("")
  );
  const centerPos = matrix.flatMap((r, y) =>
    r.map((letter, x) =>
      letter === CENTER && x !== 0 && y !== 0 && x !== r.length - 1 &&
        y !== matrix.length - 1
        ? [x, y]
        : undefined
    )
  ).filter(Boolean) as [number, number][];

  return centerPos.filter(([x, y]) =>
    ((matrix[y - 1][x - 1] == "M" && matrix[y + 1][x + 1] == "S") ||
      (matrix[y - 1][x - 1] == "S" && matrix[y + 1][x + 1] == "M")) &&
    ((matrix[y - 1][x + 1] == "M" && matrix[y + 1][x - 1] == "S") ||
      (matrix[y - 1][x + 1] == "S" && matrix[y + 1][x - 1] == "M"))
  ).length;
}

export function solve() {
  return {
    part1: part1(dataFile),
    part2: part2(dataFile),
  };
}

Deno.test(function part1Test() {
  assertEquals(part1(testFile), 18);
});

Deno.test(function part2Test() {
  assertEquals(part2(testFile), 9);
});
