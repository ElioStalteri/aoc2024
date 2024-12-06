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

async function printLayout(layout: TYPE[][]) {
  //await delay(500);
  //console.clear();
  //console.log(layout.map((r) => r.join("")).join("\n"));
}

function part1(data: string) {
  let layout = data.trim().split("\n")
    .map((r) => r.trim().split("")) as TYPE[][];
  let [guardPos] = findTypePos(TYPE.GUARD, layout);
  const obstacles = findTypePos(TYPE.OBSTACLE, layout);
  let guardDirection: DIRECTION = { x: 0, y: -1 };
  //console.log(obstacles.find(({ x, y }) => x === 40 && y === 16)); //y:16,x:40
  //console.log(obstacles.find(({ x, y }) => x === 39 && y === 15)); //y:16,x:40
  //console.log(obstacles.find(({ x, y }) => x === 39 && y === 16)); //y:16,x:40
  //return 0;
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
    //await printLayout(layout);
  }
  // 268 too low
  return layout.flat().filter((v) => v === TYPE.VISITED).length;
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
  assertEquals(part1(testFile), 41);
});

Deno.test(function part2Test() {
  assertEquals(part2(testFile), "todo");
});
