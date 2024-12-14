import { assertEquals } from "@std/assert";

const decoder = new TextDecoder("utf-8");
const dataFile = decoder.decode(
  await Deno.readFile(import.meta.dirname + "/data.txt"),
);
const testFile = decoder.decode(
  await Deno.readFile(import.meta.dirname + "/test.txt"),
);

let W = 101;
let H = 103;

function getMiddleIdx(length: number) {
  if (length % 2 === 0) throw new Error("wrong array length");
  return Math.floor(length / 2);
}

const simSteps = 100;

interface COORD {
  x: number;
  y: number;
}

function moveRobot(r: ROBOT) {
  const { p, v } = r;
  const newP: COORD = { x: p.x + v.x, y: p.y + v.y };
  if (newP.x >= W) newP.x = newP.x - W;
  if (newP.x < 0) newP.x = W + newP.x;
  if (newP.y >= H) newP.y = newP.y - H;
  if (newP.y < 0) newP.y = H + newP.y;
  return { ...r, p: newP };
}

interface ROBOT {
  p: COORD;
  v: COORD;
}

function printMap(r: ROBOT[], print = true) {
  const map = new Array(H).fill(0).map(() => new Array(W).fill("."));
  for (const { p } of r) {
    try {
      map[p.y][p.x] = map[p.y][p.x] === "." ? 1 : map[p.y][p.x] + 1;
    } catch (e) {
      console.log("error position -> ", p);
      throw e;
    }
  }
  if (print) {
    console.log("\n\n");
    console.log(map.map((r) => r.join("")).join("\n"));
    console.log("\n\n");
  }
  return map.map((r) => r.join("")).join("\n");
}

function computeScore(robots: ROBOT[]) {
  const hm = getMiddleIdx(H);
  const wm = getMiddleIdx(W);

  const q1 = robots.filter(({ p }) => p.x < wm && p.y < hm);
  //printMap(q1);
  const q2 = robots.filter(({ p }) => p.x > wm && p.y < hm);
  //printMap(q2);
  const q3 = robots.filter(({ p }) => p.x < wm && p.y > hm);
  //printMap(q3);
  const q4 = robots.filter(({ p }) => p.x > wm && p.y > hm);
  //printMap(q4);

  return q1.length * q2.length * q3.length * q4.length;
}

function part1(data: string) {
  //console.log("W", W);
  //console.log("H", H);
  let robots: ROBOT[] = data.trim().split("\n")
    .map((r) => {
      const [ps, vs] = r.trim().split(" ", 2);
      const [px, py] = ps.split("=", 2)[1].split(",");
      const [vx, vy] = vs.split("=", 2)[1].split(",");
      return {
        p: {
          x: parseInt(px),
          y: parseInt(py),
        },
        v: {
          x: parseInt(vx),
          y: parseInt(vy),
        },
      };
    });

  for (let i = 0; i < simSteps; i++) {
    robots = robots.map(moveRobot);
  }

  return computeScore(robots);
}

function part2(data: string) {
  let robots: ROBOT[] = data.trim().split("\n")
    .map((r) => {
      const [ps, vs] = r.trim().split(" ", 2);
      const [px, py] = ps.split("=", 2)[1].split(",");
      const [vx, vy] = vs.split("=", 2)[1].split(",");
      return {
        p: {
          x: parseInt(px),
          y: parseInt(py),
        },
        v: {
          x: parseInt(vx),
          y: parseInt(vy),
        },
      };
    });

  let score = Infinity;
  const frames: { print: string; score: number; frame: number }[] = [];
  for (let i = 0; i < 9000; i++) {
    robots = robots.map(moveRobot);

    const nscore = computeScore(robots);
    if (nscore <= score) {
      frames.push({
        print: printMap(robots, false),
        score: nscore,
        frame: i + 1,
      });
      score = nscore;
    }
  }

  const bestFrame =
    frames.filter((f) => f.score === score).sort((a, b) =>
      a.frame - b.frame
    )[0];

  return bestFrame.frame;
}

export function solve() {
  return {
    part1: part1(dataFile),
    part2: part2(dataFile),
  };
}

Deno.test(function part1Test() {
  W = 11;
  H = 7;
  assertEquals(part1(testFile), 12);
});

Deno.test(function part2Test() {
  W = 11;
  H = 7;
  assertEquals(part2(testFile), 5);
});
