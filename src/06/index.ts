import { assertEquals } from "@std/assert";
import { delay } from "https://deno.land/x/delay@v0.2.0/mod.ts";

const decoder = new TextDecoder("utf-8");
const dataFile = decoder.decode(
  await Deno.readFile(import.meta.dirname + "/data.txt"),
);
const testFile = decoder.decode(
  await Deno.readFile(import.meta.dirname + "/test.txt"),
);

interface POS {
  x: number;
  y: number;
}

interface DIRECTION {
  x: 1 | 0 | -1;
  y: 1 | 0 | -1;
}

enum TYPE {
  EMPTY = ".",
  OBSTACLE = "#",
  GUARD = "^",
  VISITED = "X",
}

function findTypePos(type: TYPE, layout: TYPE[][]) {
  const positions: POS[] = [];
  for (let y = 0; y < layout.length; y++) {
    const row = layout[y];
    for (let x = 0; x < row.length; x++) {
      if (row[x] === type) {
        positions.push({ x, y });
      }
    }
  }
  return positions;
}

function rotateGuardDirection({ x, y }: DIRECTION): DIRECTION {
  if (y < 0) return { x: 1, y: 0 };
  if (x > 0) return { x: 0, y: 1 };
  if (y > 0) return { x: -1, y: 0 };
  if (x < 0) return { x: 0, y: -1 };
  throw new Error(`wrong guard direction x:${x} y:${y}`);
}

function closestObstacle({ x, y }: POS, others: POS[]) {
  if (others.length === 0) return;
  const [closest] = others.toSorted((
    { x: xa, y: ya },
    { x: xb, y: yb },
  ) =>
    Math.abs(x - xa) + Math.abs(y - ya) -
    (Math.abs(x - xb) + Math.abs(y - yb))
  );
  return closest;
}

function walkGuard(guardPos: POS, { x, y }: DIRECTION, obstacles: POS[]) {
  if (y < 0) {
    const candidateObst = obstacles.filter(({ x: ox, y: oy }) =>
      ox === guardPos.x && oy < guardPos.y
    );
    const obstacle = closestObstacle(guardPos, candidateObst);
    if (!obstacle) return;
    return { x: guardPos.x, y: obstacle.y + 1 };
  }
  if (x > 0) {
    const candidateObst = obstacles.filter(({ x: ox, y: oy }) =>
      ox > guardPos.x && oy === guardPos.y
    );
    const obstacle = closestObstacle(guardPos, candidateObst);
    if (!obstacle) return;
    return { x: obstacle.x - 1, y: guardPos.y };
  }
  if (y > 0) {
    const candidateObst = obstacles.filter(({ x: ox, y: oy }) =>
      ox === guardPos.x && oy > guardPos.y
    );
    const obstacle = closestObstacle(guardPos, candidateObst);
    if (!obstacle) return;
    return { x: guardPos.x, y: obstacle.y - 1 };
  }
  if (x < 0) {
    const candidateObst = obstacles.filter(({ x: ox, y: oy }) =>
      ox < guardPos.x && oy === guardPos.y
    );
    const obstacle = closestObstacle(guardPos, candidateObst);
    if (!obstacle) return;
    return { x: obstacle.x + 1, y: guardPos.y };
  }
}

function updateLayout(
  oldL: TYPE[][],
  { x: x1, y: y1 }: POS,
  { x: x2, y: y2 }: POS,
) {
  const layout = [...oldL];
  if (x1 === x2) {
    const start = y1 < y2 ? y1 : y2;
    const end = y1 < y2 ? y2 : y1;
    for (let i = start; i <= end; i++) {
      layout[i][x1] = TYPE.VISITED;
    }
  } else {
    const start = x1 < x2 ? x1 : x2;
    const end = x1 < x2 ? x2 : x1;
    for (let i = start; i <= end; i++) {
      layout[y1][i] = TYPE.VISITED;
    }
  }
  return layout;
}

function updateLayoutFinal(
  oldL: TYPE[][],
  { x: x, y: y }: POS,
  { x: xd, y: yd }: DIRECTION,
): TYPE[][] {
  const layout = [...oldL];
  if (yd > 0) {
    const start = y;
    const end = layout.length - 1;
    for (let i = start; i <= end; i++) {
      layout[i][x] = TYPE.VISITED;
    }
    return layout;
  }
  if (yd < 0) {
    const start = 0;
    const end = y;
    for (let i = start; i <= end; i++) {
      layout[i][x] = TYPE.VISITED;
    }
    return layout;
  }
  if (xd > 0) {
    const start = x;
    const end = layout[0].length - 1;
    for (let i = start; i <= end; i++) {
      layout[y][i] = TYPE.VISITED;
    }
    return layout;
  }
  if (xd < 0) {
    const start = 0;
    const end = x;
    for (let i = start; i <= end; i++) {
      layout[y][i] = TYPE.VISITED;
    }
    return layout;
  }
  throw new Error(`failed to update layout wrong direction x:${x} y:${y}`);
}

function printLayout(layout: TYPE[][]) {
  //await delay(500);
  //console.clear();
  console.log(layout.map((r) => r.join("")).join("\n"));
}

function part1(data: string) {
  let layout = data.trim().split("\n")
    .map((r) => r.trim().split("")) as TYPE[][];
  let [guardPos] = findTypePos(TYPE.GUARD, layout);
  const obstacles = findTypePos(TYPE.OBSTACLE, layout);
  let guardDirection: DIRECTION = { x: 0, y: -1 };
  let newPos: POS | undefined = guardPos;
  while (newPos !== undefined) {
    newPos = walkGuard(guardPos, guardDirection, obstacles);
    if (newPos) {
      const newDir = rotateGuardDirection(guardDirection);
      layout = updateLayout(layout, guardPos, newPos);
      guardPos = newPos;
      guardDirection = newDir;
    } else {
      layout = updateLayoutFinal(layout, guardPos, guardDirection);
    }
  }
  return layout.flat().filter((v) => v === TYPE.VISITED).length;
}

interface PATH {
  start: POS;
  end: POS;
}

interface PATHS {
  UP: PATH[];
  DOWN: PATH[];
  LEFT: PATH[];
  RIGHT: PATH[];
}

function storePath(
  layout: TYPE[][],
  paths: PATHS,
  { x, y }: DIRECTION,
  start: POS,
  _end?: POS,
): PATHS {
  if (y < 0) {
    const end = _end ? _end : { ...start, y: 0 };
    return { ...paths, UP: [...paths.UP, { start, end }] };
  }
  if (x > 0) {
    const end = _end ? _end : { ...start, x: layout[0].length - 1 };
    return { ...paths, RIGHT: [...paths.RIGHT, { start, end }] };
  }
  if (y > 0) {
    const end = _end ? _end : { ...start, y: layout.length - 1 };
    return { ...paths, DOWN: [...paths.DOWN, { start, end }] };
  }
  if (x < 0) {
    const end = _end ? _end : { ...start, x: 0 };
    return { ...paths, LEFT: [...paths.LEFT, { start, end }] };
  }
  throw new Error("error storing paths");
}

function intersect(left: POS, top: POS, right: POS, down: POS, dir: DIRECTION) {
  const point = {
    x: top.x + dir.x,
    y: left.y + dir.y,
  };
  const res = {
    point,
    intersect: left.x > top.x && right.x < top.x && left.y > top.y &&
      left.y < down.y,
    dir,
    left,
    right,
    down,
    top,
  };
  if (res.intersect) console.log(res, left, top, right, down, dir);
  return res;
}

function doesPathsIntersect(origin: PATH, destination: PATH) {
  const originYDelta = origin.start.y - origin.end.y;
  const originXDelta = origin.start.x - origin.end.x;
  const destinationYDelta = destination.start.y - destination.end.y;
  const destinationXDelta = destination.start.x - destination.end.x;
  if (
    (originXDelta === 0 && destinationXDelta === 0) ||
    (originYDelta === 0 && destinationYDelta === 0)
  ) {
    return {
      intersect: false,
    };
  }
  if (originXDelta > 0 && destinationYDelta > 0) { // RIGHT DOWN
    return intersect(
      origin.start,
      destination.start,
      origin.end,
      destination.end,
      { x: 1, y: 0 },
    );
  }
  if (originXDelta < 0 && destinationYDelta > 0) { // LEFT DOWN
    return { intersect: false };
  }
  if (originXDelta > 0 && destinationYDelta < 0) { // RIGHT UP
    return { intersect: false };
  }
  if (originXDelta < 0 && destinationYDelta < 0) { // LEFT UP
    return intersect(
      origin.end,
      destination.end,
      origin.start,
      destination.start,
      { x: -1, y: 0 },
    );
  }

  if (originYDelta > 0 && destinationXDelta > 0) { // DOWN RIGHT
    return { intersect: false };
  }
  if (originYDelta < 0 && destinationXDelta > 0) { // UP RIGHT
    return intersect(
      destination.start,
      origin.end,
      destination.end,
      origin.start,
      { x: 0, y: -1 },
    );
  }
  if (originYDelta > 0 && destinationXDelta < 0) { // DOWN LEFT
    return intersect(
      destination.end,
      origin.start,
      destination.start,
      origin.end,
      { x: 0, y: 1 },
    );
  }
  if (originYDelta < 0 && destinationXDelta < 0) { // UP LEFT
    return { intersect: false };
  }
}

function comparePaths(paths: PATHS, curr: PATH) {
  const allPaths: PATH[] = Object.values(paths).flat();
  return allPaths.map((p) => doesPathsIntersect(p, curr));
}

function part2(data: string) {
  let layout = data.trim().split("\n")
    .map((r) => r.trim().split("")) as TYPE[][];
  let [guardPos] = findTypePos(TYPE.GUARD, layout);
  const initialPos = { ...guardPos };
  const obstacles = findTypePos(TYPE.OBSTACLE, layout);
  let guardDirection: DIRECTION = { x: 0, y: -1 };
  let paths: PATHS = {
    UP: [],
    DOWN: [],
    LEFT: [],
    RIGHT: [],
  };
  let newPos: POS | undefined = guardPos;
  while (newPos !== undefined) {
    newPos = walkGuard(guardPos, guardDirection, obstacles);
    if (newPos) {
      console.log(comparePaths(paths, { start: guardPos, end: newPos }));
      paths = storePath(layout, paths, guardDirection, guardPos, newPos);
      const newDir = rotateGuardDirection(guardDirection);
      layout = updateLayout(layout, guardPos, newPos);
      guardPos = newPos;
      guardDirection = newDir;
    } else {
      paths = storePath(layout, paths, guardDirection, guardPos);
      layout = updateLayoutFinal(layout, guardPos, guardDirection);
    }
  }

  console.log(paths);
  printLayout(layout);
  return 0;
}

export function solve() {
  return {
    part1: part1(dataFile),
    part2: part2(dataFile),
  };
}

Deno.test(function part1Test() {
  assertEquals(part1(testFile), 41);
});

Deno.test(function part2Test() {
  assertEquals(part2(testFile), 6);
});
