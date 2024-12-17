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

function computePathScore(path: string[]) {
  let score = 0;
  const [prevs, ...rest] = path;
  let prev = prevs.split(",");
  const dir = { x: 1, y: 0 };
  for (const p of rest) {
    if (p === "E") break;
    const curr = p.split(",");
    const [px, py] = [parseInt(prev[0]), parseInt(prev[1])];
    const [cx, cy] = [parseInt(curr[0]), parseInt(curr[1])];
    const newD = {
      x: cx - px,
      y: cy - py,
    };
    if (newD.x > 0 && dir.x > 0 || newD.x < 0 && dir.x < 0) {
      score += 1;
    } else if ((newD.x > 0 && dir.x < 0) || (newD.x < 0 && dir.x > 0)) {
      score += 2001;
    } else if (newD.y > 0 && dir.y > 0 || newD.y < 0 && dir.y < 0) {
      score += 1;
    } else if ((newD.y > 0 && dir.y < 0) || (newD.y < 0 && dir.y > 0)) {
      score += 2001;
    } else {
      score += 1001;
    }
    dir.x = newD.x;
    dir.y = newD.y;
    prev = curr;
  }
  return score;
}

function filterBestPath(paths: string[][]) {
  const bestPaths: string[][] = [];

  const checked: string[] = [];
  for (const p of paths) {
    const last = p[p.length - 1];
    if (checked.includes(last)) continue;
    checked.push(last);
    const sameEnds = paths.filter((_p) => _p[_p.length - 1] === last);
    sameEnds.sort((a, b) => computePathScore(a) - computePathScore(b));
    bestPaths.push(sameEnds[0]);
  }
  //console.log("bestPaths", bestPaths.length, checked);
  return bestPaths;
}

function computePaths(
  tree: MazeTree,
  start: { x: number; y: number },
): string[][] {
  let finished: string[][] = [];
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
    paths = filterBestPath(newPaths);
    finished = filterBestPath(finished);
    if (finished.length > 0) {
      const bestPathScore = computePathScore(finished[0]);
      paths = paths.filter((p) => computePathScore(p) <= bestPathScore);
    }

    console.log("number of paths to check", paths.length);
    console.log("finished", finished.length);
  }
  return finished;
}

function printMap(
  _map: string[][],
  found: { x: number; y: number; v: string }[],
) {
  const map: string[][] = JSON.parse(JSON.stringify(_map));
  if (found.length > 0) {
    for (const { x, y, v } of found) {
      map[y][x] = v === "S" || v === "E" ? v : "\u001b[31m$\u001b[0m";
    }
  }
  console.clear();
  console.log("\n");
  console.log(map.map((r) => r.join("")).join("\n"));
}

function printMapString(
  _map: string[][],
  found: string[],
) {
  const map: string[][] = JSON.parse(JSON.stringify(_map));
  if (found.length > 0) {
    for (const str of found) {
      if (str === "S" || str === "E") continue;
      const [x, y] = str.split(",");
      map[parseInt(y)][parseInt(x)] = "\u001b[31m$\u001b[0m";
    }
  }
  console.clear();
  console.log("\n");
  console.log(map.map((r) => r.join("")).join("\n"));
}

function part1(data: string) {
  const map = data.trim().split("\n").filter(Boolean)
    .map((r) => r.trim().split("").filter(Boolean));

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

  const ps = computePaths(mazeTree, start);

  return computePathScore(ps[0]);
}

function computeAlternativePath(tree: MazeTree, bestPath: string[]) {
  // todo

  return [bestPath];
}

function part2(data: string) {
  const map = data.trim().split("\n").filter(Boolean)
    .map((r) => r.trim().split("").filter(Boolean));

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

  const ps = computePaths(mazeTree, start);

  const alternatives = computeAlternativePath(mazeTree, ps[0]);

  const tiles = new Set(alternatives.flatMap((p) => p.map((v) => v)));
  return tiles.size;
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
  assertEquals(part2(testFile), 45);
});
