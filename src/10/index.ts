import { assertEquals } from "@std/assert";

const decoder = new TextDecoder("utf-8");
const dataFile = decoder.decode(
  await Deno.readFile(import.meta.dirname + "/data.txt"),
);
const testFile = decoder.decode(
  await Deno.readFile(import.meta.dirname + "/test.txt"),
);

const directions = [
  { x: 0, y: 1 },
  { x: 0, y: -1 },
  { x: 1, y: 0 },
  { x: -1, y: 0 },
];

interface P {
  x: number;
  y: number;
}

const positionsStorage: {
  [key: string]: P[];
} = {};

function checkPos(arr: number[][], p: P, nines: P[] = []) {
  const curr = arr?.[p.y]?.[p.x];
  if (curr === undefined) return nines;
  if (curr === 9) {
    const found = nines.find(({ x, y }) => p.x === x && p.y === y);
    if (found) return nines;
    return [...nines, p];
  }
  if (`${p.x},${p.y}` in positionsStorage) {
    return [...nines, ...positionsStorage[`${p.x},${p.y}`]];
  }
  return nines;
}

function allowedNext(arr: number[][], currP: P, nextP: P) {
  const curr = arr?.[currP.y]?.[currP.x];
  const next = arr?.[nextP.y]?.[nextP.x];
  return curr !== undefined && next !== undefined && curr + 1 === next;
}

function dedupeNines(n1: P[], n2: P[]) {
  const newN = [...n1];
  for (const p of n2) {
    const found = newN.find(({ x, y }) => p.x === x && p.y === y);
    if (found) continue;
    newN.push(p);
  }
  return newN;
}

function search(arr: number[][], p: P, nines: P[] = []) {
  const nn = checkPos(arr, p, nines);
  if (nn.length > nines.length) return nn;
  let newNines: P[] = [];
  for (const d of directions) {
    const newP = { x: p.x + d.x, y: p.y + d.y };
    if (!allowedNext(arr, p, newP)) continue;
    newNines = search(arr, { x: p.x + d.x, y: p.y + d.y }, newNines);
  }
  positionsStorage[`${p.x},${p.y}`] = newNines;
  return dedupeNines(nn, newNines);
}

function part1(data: string) {
  const trails = data.trim().split("\n").map((r) =>
    r.trim().split("").map((v) => parseInt(v))
  ).filter(Boolean);
  const zeros = trails.flatMap((r, y) =>
    r.map((v, x) => v === 0 ? { x, y } : false).filter(Boolean)
  ) as P[];

  const correctTrails = zeros.map((p) => search(trails, p));

  //console.log(correctTrails);
  return correctTrails.map((t) => t.length).reduce((acc, v) => acc + v, 0);
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
  assertEquals(part1(testFile), 36);
});

Deno.test(function part2Test() {
  assertEquals(part2(testFile), "todo");
});
