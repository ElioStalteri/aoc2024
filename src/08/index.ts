import { assertEquals } from "@std/assert";

const decoder = new TextDecoder("utf-8");
const dataFile = decoder.decode(
  await Deno.readFile(import.meta.dirname + "/data.txt"),
);
const testFile = decoder.decode(
  await Deno.readFile(import.meta.dirname + "/test.txt"),
);

interface P {
  x: number;
  y: number;
  c: string;
}

interface DIST {
  x: number;
  y: number;
}

interface DIR {
  x: 1 | -1;
  y: 1 | -1;
}

const distance = (p1: P, p2: P): DIST => ({
  x: Math.abs(p1.x - p2.x),
  y: Math.abs(p1.y - p2.y),
});

const direction = (p1: P, p2: P): DIR => ({
  x: (p1.x - p2.x) / Math.abs(p1.x - p2.x) as unknown as (1 | -1),
  y: (p1.y - p2.y) / Math.abs(p1.y - p2.y) as unknown as (1 | -1),
});

const antinode = (d: DIR, distance: DIST, p: P): P => ({
  x: d.x * distance.x + p.x,
  y: d.y * distance.y + p.y,
  c: "#",
});

const getAntinodes = (p1: P, p2: P): P[] => {
  const d = distance(p1, p2);
  const dP1P2 = direction(p1, p2);
  const dP2P1 = direction(p2, p1);
  const aP1P2 = antinode(dP1P2, d, p1);
  const aP2P1 = antinode(dP2P1, d, p2);
  return [aP1P2, aP2P1];
};

const getAntinodesFullField = (fieldD: DIST, p1: P, p2: P): P[] => {
  const d = distance(p1, p2);
  const dP1P2 = direction(p1, p2);
  const dP2P1 = direction(p2, p1);
  const amount = Math.ceil(
    Math.sqrt(Math.pow(fieldD.x, 2) + Math.pow(fieldD.y, 2)) /
      Math.sqrt(Math.pow(d.x, 2) + Math.pow(d.y, 2)),
  );
  const res: P[] = [];
  for (let i = 1; i <= amount; i++) {
    res.push(antinode(dP1P2, { x: d.x * i, y: d.y * i }, p1));
  }
  for (let i = 1; i <= amount; i++) {
    res.push(antinode(dP2P1, { x: d.x * i, y: d.y * i }, p2));
  }
  return res;
};

const updateField = (_field: string[][], antinodes: P[]) => {
  const field: string[][] = JSON.parse(JSON.stringify(_field));
  antinodes.forEach((an) => {
    if (field?.[an.y]?.[an.x] !== undefined) {
      field[an.y][an.x] = an.c;
    }
  });
  return field;
};

const updateFieldKeepNodes = (_field: string[][], antinodes: P[]) => {
  const field: string[][] = JSON.parse(JSON.stringify(_field));
  antinodes.forEach((an) => {
    if (field?.[an.y]?.[an.x] === ".") {
      field[an.y][an.x] = an.c;
    }
  });
  return field;
};

const formatField = (field: string[][]) =>
  field.map((r) => r.join("")).join("\n");

function part1(data: string) {
  const field = data.trim().split("\n").filter(Boolean).map((v) =>
    v.trim().split("").filter(Boolean)
  );
  const nodes = field
    .flatMap((v, y) => v.map((c, x) => ({ c, x, y }) as P))
    .reduce((acc, p) => ({
      ...acc,
      ...(p.c !== "." ? { [p.c]: [...(acc[p.c] || []), p] } : {}),
    }), {} as { [key: string]: P[] });

  const antinodes = Object.values(nodes).flatMap((ns) => {
    let res: P[] = [];
    for (let i = 0; i < ns.length - 1; i++) {
      for (let j = i + 1; j < ns.length; j++) {
        res = res.concat(getAntinodes(ns[i], ns[j]));
      }
    }
    return res;
  });
  const fieldWithAntinodes = updateField(field, antinodes);

  return fieldWithAntinodes.flat().filter((v) => v === "#").length;
}

function part2(data: string) {
  const field = data.trim().split("\n").filter(Boolean).map((v) =>
    v.trim().split("").filter(Boolean)
  );
  const nodes = field
    .flatMap((v, y) => v.map((c, x) => ({ c, x, y }) as P))
    .reduce((acc, p) => ({
      ...acc,
      ...(p.c !== "." ? { [p.c]: [...(acc[p.c] || []), p] } : {}),
    }), {} as { [key: string]: P[] });

  const antinodes = Object.values(nodes).flatMap((ns) => {
    let res: P[] = [];
    for (let i = 0; i < ns.length - 1; i++) {
      for (let j = i + 1; j < ns.length; j++) {
        res = res.concat(
          getAntinodesFullField(
            { x: field[0].length, y: field.length },
            ns[i],
            ns[j],
          ),
        );
      }
    }
    return res;
  })
    .filter((n) => field?.[n.y]?.[n.x] !== undefined);

  const fieldWithAntinodes = updateField(field, antinodes);

  return fieldWithAntinodes.flat().filter((v) => v !== ".").length;
}

export function solve() {
  return {
    part1: part1(dataFile),
    part2: part2(dataFile),
  };
}

Deno.test(function part1Test() {
  assertEquals(part1(testFile), 14);
});

Deno.test(function part2Test() {
  assertEquals(part2(testFile), 34);
});
