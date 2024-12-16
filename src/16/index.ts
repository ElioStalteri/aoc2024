import { assertEquals } from "@std/assert";

const decoder = new TextDecoder("utf-8");
const dataFile = decoder.decode(
  await Deno.readFile(import.meta.dirname + "/data.txt"),
);
const testFile = decoder.decode(
  await Deno.readFile(import.meta.dirname + "/test.txt"),
);

interface MazeValue {
  x: number;
  y: number;
  v: "." | "S" | "E";
  childs?: string[];
}

interface MazeTree {
  [key: string]: MazeValue;
}

function closest({ x, y }: MazeValue) {
  return [
    { x: x + 1, y: y },
    { x: x - 1, y: y },
    { x: x, y: y + 1 },
    { x: x, y: y - 1 },
  ];
}
function key({ x, y }: { x: number; y: number }) {
  return `${x},${y}`;
}

function computePaths(
  tree: MazeTree,
  start: { x: number; y: number },
): string[][] {
  const finished: string[][] = [];
  let paths: string[][] = [[key(start)]];

  while (paths.length > 0) {
    const newPaths: string[][] = [];
    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];
      const k = path[path.length - 1];
      const childs = tree[k].childs?.filter((v) =>
        v !== k && !path.includes(v)
      ) || [];
      for (const c of childs) {
        if (tree[c].v === "E") {
          finished.push([...path, c, "E"]);
        } else {
          newPaths.push([...path, c]);
        }
      }
    }
    paths = newPaths;

    console.log("number of paths to check", paths.length);
    console.log("finished", finished.length);
  }
  return finished;
}

function removeDeadEnd(tree: MazeTree) {
  const dead = Object.values(tree).filter(({ childs, v }) =>
    v !== "S" && v !== "E" && childs && childs.length < 2
  );
  if (dead.length === 0) return tree;
  for (const d of dead) {
    delete tree[key(d)];
    const childs = d?.childs || [];
    for (const c of childs) {
      tree[c].childs = tree[c]?.childs?.filter((v) => v !== key(d)) || [];
    }
  }
  return removeDeadEnd(tree);
}

function part1(data: string) {
  const mazePaths = data.trim().split("\n").filter(Boolean)
    .flatMap((r, y) =>
      r.trim().split("")
        .map((v, x) =>
          v === "." || v === "E" || v === "S" ? { x, y, v } : undefined
        )
        .filter(Boolean)
    ) as { x: number; y: number; v: "." | "S" | "E" }[];

  const start = mazePaths.find((p) => p.v === "S");
  if (!start) throw new Error("start not found");
  const mazeTree: MazeTree = mazePaths.reduce(
    (acc, v) => ({ ...acc, [key(v)]: v }),
    {} as MazeTree,
  );

  for (const p of Object.values(mazeTree)) {
    mazeTree[key(p)].childs = closest(p).map(key).filter((v) => v in mazeTree);
  }

  removeDeadEnd(mazeTree);

  const ps = computePaths(mazeTree, start);

  console.log(ps);
  return 0;
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
  assertEquals(part1(testFile), 7036);
});

Deno.test(function part2Test() {
  assertEquals(part2(testFile), "todo");
});
