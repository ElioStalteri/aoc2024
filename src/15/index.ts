import { assertEquals } from "@std/assert";
import { delay } from "https://deno.land/x/delay@v0.2.0/mod.ts";

const decoder = new TextDecoder("utf-8");
const dataFile = decoder.decode(
  await Deno.readFile(import.meta.dirname + "/data.txt"),
);
const testFile = decoder.decode(
  await Deno.readFile(import.meta.dirname + "/test.txt"),
);

enum Type {
  empty = ".",
  robot = "@",
  wall = "#",
  box = "O",
}

type Map = Type[][];

type LargeMap = LargeType[][];

enum Mov {
  UP = "^",
  DOWN = "v",
  LEFT = "<",
  RIGHT = ">",
}

interface Pos {
  x: number;
  y: number;
}

function findRobotPos(map: Map | LargeMap): Pos {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[0].length; x++) {
      if (map[y][x] === Type.robot) return { x, y };
    }
  }
  throw new Error("robot not found");
}

function getNewPositions(
  map: Map,
  p: Pos,
  d: Pos,
): { old: Pos; new: Pos }[] | false {
  const newP = { x: p.x + d.x, y: p.y + d.y };
  const obj = map?.[newP.y]?.[newP.x];
  if (obj === undefined) throw new Error("new pos not found");
  if (obj === Type.wall) return false;
  if (obj === Type.box) {
    const next = getNewPositions(map, newP, d);
    if (next === false) return false;
    return [{ old: p, new: newP }, ...next];
  }
  if (obj === Type.empty) return [{ old: p, new: newP }];
  throw new Error("check free space didnt find a correct value -> " + obj);
}

function applyNewPositions(map: Map, pos: { old: Pos; new: Pos }[]) {
  const newMap: Map = JSON.parse(JSON.stringify(map));
  for (const p of pos) {
    const old = map[p.old.y][p.old.x];
    if (old === Type.robot) newMap[p.old.y][p.old.x] = Type.empty;
    newMap[p.new.y][p.new.x] = old;
  }
  return newMap;
}

function getDirection(d: Mov): Pos {
  switch (d) {
    case Mov.UP:
      return { x: 0, y: -1 };
    case Mov.DOWN:
      return { x: 0, y: 1 };
    case Mov.LEFT:
      return { x: -1, y: 0 };
    case Mov.RIGHT:
      return { x: 1, y: 0 };
    default:
      throw new Error("Mov not found -> " + d);
  }
}

function printMap(map: Map | LargeMap, clear = true) {
  if (clear) console.clear();
  console.log("\n");
  console.log(map.map((r) => r.join("")).join("\n"));
  console.log("\n");
}

function getBoxsesPosition(map: Map) {
  return map.flatMap((r, y) =>
    r.map((v, x) => v === Type.box ? { x, y } : undefined)
  ).filter(Boolean) as Pos[];
}

function calculateBoxScore(p: Pos) {
  return p.y * 100 + p.x;
}

function part1(data: string) {
  const [mapStr, movementsStr] = data.trim().split("\n\n");

  let map = mapStr.trim().split("\n").filter(Boolean)
    .map((r) => r.trim().split("").filter(Boolean) as Type[]);

  const movements = movementsStr.trim().split("\n").filter(Boolean)
    .flatMap((r) => r.trim().split("").filter(Boolean) as Mov[])
    .map(getDirection);

  let robotPos = findRobotPos(map);

  for (const m of movements) {
    //printMap(map);
    const newPos = getNewPositions(map, robotPos, m);
    if (newPos !== false) {
      map = applyNewPositions(map, newPos);
      robotPos = findRobotPos(map);
    }
  }

  const boxesScore = getBoxsesPosition(map).map(calculateBoxScore);

  return boxesScore.reduce((acc, v) => acc + v, 0);
}

enum LargeType {
  empty = ".",
  robot = "@",
  wall = "#",
  boxL = "[",
  boxR = "]",
}

function replaceBoxVerticalMove(
  map: LargeMap,
  b: [Pos, Pos],
  p: Pos,
): { old: undefined | Pos; new: Pos }[] {
  const [l, r] = b;
  if (l.x === p.x) {
    if (map[p.y][p.x] === LargeType.boxL) {
      return [
        { old: p, new: l },
        { old: { ...p, x: p.x + 1 }, new: r },
      ];
    }
    if (map[p.y][p.x] === LargeType.boxR) {
      return [
        { old: undefined, new: r },
      ];
    }
    if (map[p.y][p.x] === LargeType.robot) {
      return [
        { old: p, new: l },
        { old: undefined, new: r },
      ];
    }
  }

  if (r.x === p.x) {
    if (map[p.y][p.x] === LargeType.boxR) {
      return [
        { old: { ...p, x: p.x - 1 }, new: l },
        { old: p, new: r },
      ];
    }
    if (map[p.y][p.x] === LargeType.boxL) {
      return [
        { old: undefined, new: l },
      ];
    }
    if (map[p.y][p.x] === LargeType.robot) {
      return [
        { old: p, new: r },
        { old: undefined, new: l },
      ];
    }
  }
  throw new Error("cannot move");
}

function getNewPositionsLargeMap(
  map: LargeMap,
  p: Pos,
  d: Pos,
): { old: undefined | Pos; new: Pos }[] | false {
  const newP = { x: p.x + d.x, y: p.y + d.y };
  const obj = map?.[newP.y]?.[newP.x];
  if (obj === undefined) {
    console.log(map.length, map[0].length);
    throw new Error("new pos not found --> " + JSON.stringify(newP));
  }
  if (obj === LargeType.wall) return false;
  if (obj === LargeType.empty) return [{ old: p, new: newP }];
  if (obj === LargeType.boxR) {
    const boxPos: [Pos, Pos] = [{ ...newP, x: newP.x - 1 }, newP];
    const newBoxPos = boxPos.map((ps) => ({ x: ps.x + d.x, y: ps.y + d.y }));
    const [l, r] = boxPos;
    if (d.x === 0) {
      const newL = getNewPositionsLargeMap(map, l, d);
      const newR = getNewPositionsLargeMap(map, r, d);
      if (newL === false || newR === false) return false;
      return [
        ...replaceBoxVerticalMove(map, boxPos, p),
        { old: boxPos[0], new: newBoxPos[0] },
        { old: boxPos[1], new: newBoxPos[1] },
        ...newL,
        ...newR,
      ];
    } else if (d.x < 0) {
      const newL = getNewPositionsLargeMap(map, l, d);
      if (newL === false) return false;
      return [
        { old: p, new: boxPos[1] },
        { old: boxPos[0], new: newBoxPos[0] },
        { old: boxPos[1], new: newBoxPos[1] },
        ...newL,
      ];
    }
  }

  if (obj === LargeType.boxL) {
    const boxPos: [Pos, Pos] = [newP, { ...newP, x: newP.x + 1 }];
    const newBoxPos = boxPos.map((ps) => ({ x: ps.x + d.x, y: ps.y + d.y }));
    const [l, r] = boxPos;
    if (d.x === 0) {
      const newL = getNewPositionsLargeMap(map, l, d);
      const newR = getNewPositionsLargeMap(map, r, d);
      if (newL === false || newR === false) return false;
      return [
        ...replaceBoxVerticalMove(map, boxPos, p),
        { old: boxPos[0], new: newBoxPos[0] },
        { old: boxPos[1], new: newBoxPos[1] },
        ...newL,
        ...newR,
      ];
    } else if (d.x > 0) {
      const newR = getNewPositionsLargeMap(map, r, d);
      if (newR === false) return false;
      return [
        { old: p, new: boxPos[0] },
        { old: boxPos[0], new: newBoxPos[0] },
        { old: boxPos[1], new: newBoxPos[1] },
        ...newR,
      ];
    }
  }
  throw new Error("check free space didnt find a correct value -> " + obj);
}

function applyNewPositionsLargeMap(
  map: LargeMap,
  pos: { old: undefined | Pos; new: Pos }[],
) {
  const newMap: LargeMap = JSON.parse(JSON.stringify(map));
  const copied: string[] = [];
  for (const p of pos) {
    //const toSkip = !p.old &&
    //  pos.find((ps) => ps?.old?.y === p.new.y && ps.old.x === p.new.x);
    //if (p.new.x === 12) {
    //  console.log(
    //    toSkip,
    //    p,
    //    pos.find((ps) => ps?.old?.y === p.new.y && ps.old.x === p.new.x),
    //  );
    //}
    //if (toSkip) continue;
    const old = p.old ? map[p.old.y][p.old.x] : LargeType.empty;
    if (
      old === LargeType.robot && p.old
    ) {
      newMap[p.old.y][p.old.x] = LargeType.empty;
    }

    if (!copied.includes(`${p.new.y},${p.new.x}`)) {
      copied.push(`${p.new.y},${p.new.x}`);
      newMap[p.new.y][p.new.x] = old;
    }
  }
  return newMap;
}

function checkMap(map: LargeMap) {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[0].length; x++) {
      if (map[y][x] === LargeType.boxL && map[y][x + 1] !== LargeType.boxR) {
        return false;
      }
      if (map[y][x - 1] !== LargeType.boxL && map[y][x] === LargeType.boxR) {
        return false;
      }
    }
  }
  return true;
}

async function part2(data: string) {
  const [mapStr, movementsStr] = data.trim().split("\n\n");

  let map = mapStr.trim().split("\n").filter(Boolean)
    .map((r) =>
      r.trim().split("")
        .flatMap((v) => {
          switch (v) {
            case Type.box:
              return [LargeType.boxL, LargeType.boxR];
            case Type.empty:
              return [LargeType.empty, LargeType.empty];
            case Type.robot:
              return [LargeType.robot, LargeType.empty];
            case Type.wall:
              return [LargeType.wall, LargeType.wall];
            default:
              throw new Error("type not found");
          }
        })
        .filter(Boolean) as LargeType[]
    );

  const movements = movementsStr.trim().split("\n").filter(Boolean)
    .flatMap((r) => r.trim().split("").filter(Boolean) as Mov[])
    .map(getDirection);

  let robotPos = findRobotPos(map);

  printMap(map);
  for (const m of movements) {
    printMap(map);
    console.log(m);
    const newPos = getNewPositionsLargeMap(map, robotPos, m);
    if (newPos !== false) {
      map = applyNewPositionsLargeMap(map, newPos);
      console.log(newPos);
      robotPos = findRobotPos(map);
      if (!checkMap(map)) {
        printMap(map, false);
        throw new Error("map broken");
      }
    }
    await delay(1);
  }

  //const boxesScore = getBoxsesPosition(map).map(calculateBoxScore);
  //
  //return boxesScore.reduce((acc, v) => acc + v, 0);
  return 0;
}

export function solve() {
  return {
    part1: part1(dataFile),
    part2: part2(dataFile),
  };
}

Deno.test(function part1Test() {
  assertEquals(part1(testFile), 10092);
});

Deno.test(async function part2Test() {
  assertEquals(await part2(testFile), 9021);
});
