import { assertEquals } from "@std/assert";

const decoder = new TextDecoder("utf-8");
const dataFile = decoder.decode(
  await Deno.readFile(import.meta.dirname + "/data.txt"),
);
const testFile = decoder.decode(
  await Deno.readFile(import.meta.dirname + "/test.txt"),
);

const tokens = {
  A: 3,
  B: 1,
};

const maxPresses = 100;

interface MACHINE {
  A: { x: number; y: number };
  B: { x: number; y: number };
  PRIZE: { x: number; y: number };
}

function strip(number: number, precision: number = 12) {
  return parseFloat(number.toPrecision(precision));
}

function checkSolution(
  { PRIZE: p, A: a, B: b }: MACHINE,
  sola: number,
  solb: number,
) {
  return p.y === a.y * sola + b.y * solb && p.x === a.x * sola + b.x * solb;
}

// ax * SA + bx * SB = pricex
// SA  = (pricex - bx * SB) / ax
// ay * SA + by * SB = pricey
// SB = ( pricey - ay * ( (pricex - bx * SB) / ax ) ) / by
// SB = ( pricey / by -  ay * pricex / ( ax * by ) ) / ( 1 -  ay * bx / ( ax * by ) )
// SA < 100
// SB < 100
// min(SA * 3 + SB)

const computeB = ({ PRIZE: p, A: a, B: b }: MACHINE) =>
  ((p.y / b.y) - (a.y * p.x) / (a.x * b.y)) / (1 - (a.y * b.x / (a.x * b.y)));

const computeA = ({ PRIZE: p, A: a, B: b }: MACHINE, bsol: number) =>
  (p.x - (b.x * bsol)) / a.x;

const getTokensUsed = (
  m: MACHINE,
  sola: number,
  solb: number,
  _precision: number = 12,
) => {
  //const sa = sola % 1 > 0.9999999999999
  //  ? Math.ceil(sola)
  //  : (sola % 1 < .0000000000001 ? Math.floor(sola) : sola);
  //const sb = solb % 1 > 0.9999999999999
  //  ? Math.ceil(solb)
  //  : (solb % 1 < .0000000000001 ? Math.floor(solb) : solb);
  const sa = sola;
  const sb = solb;
  //if (sa > 100 || sb > 100) return 0;
  if (sa < 0 || sb < 0) return 0;
  if (sa !== Math.trunc(sa) || sb !== Math.trunc(sb)) {
    const saC = Math.ceil(sa);
    const saF = Math.floor(sa);
    const sbC = Math.ceil(sb);
    const sbF = Math.floor(sb);
    if (checkSolution(m, saC, sbC)) return getTokensUsed(m, saC, sbC);
    if (checkSolution(m, saC, sbF)) return getTokensUsed(m, saC, sbF);
    if (checkSolution(m, saF, sbC)) return getTokensUsed(m, saF, sbC);
    if (checkSolution(m, saF, sbF)) return getTokensUsed(m, saF, sbF);
    return 0;
  }
  return sa * tokens.A + sb * tokens.B;
};

function part1(data: string) {
  const machines = data.trim().split("\n\n").filter(Boolean)
    .map((m) =>
      m.trim().split("\n").map((instruction) => {
        const [inst, value] = instruction.split(":", 2);
        switch (inst) {
          case "Button A": {
            const [x, y] = value.split(",", 2).map((v) =>
              parseInt(v.trim().split("+", 2)[1])
            );
            return { A: { x, y } };
          }
          case "Button B": {
            const [x, y] = value.split(",", 2).map((v) =>
              parseInt(v.trim().split("+", 2)[1])
            );
            return { B: { x, y } };
          }
          case "Prize": {
            const [x, y] = value.split(",", 2).map((v) =>
              parseInt(v.trim().split("=", 2)[1])
            );
            return { PRIZE: { x, y } };
          }
          default:
            throw new Error("wrong instruction");
        }
      }).reduce(
        (acc, v) => ({ ...acc, ...v }),
        {} as MACHINE,
      )
    );

  const solution = machines.map((m) => {
    const solb = computeB(m);
    const sola = computeA(m, solb);
    return {
      ...m,
      sola,
      solb,
      tokens: getTokensUsed(m, sola, solb),
    };
  });

  // 33921
  return solution.reduce((acc, v) => acc + v.tokens, 0);
}

function part2(data: string) {
  const machines = data.trim().split("\n\n").filter(Boolean)
    .map((m) =>
      m.trim().split("\n").map((instruction) => {
        const [inst, value] = instruction.split(":", 2);
        switch (inst) {
          case "Button A": {
            const [x, y] = value.split(",", 2).map((v) =>
              parseInt(v.trim().split("+", 2)[1])
            );
            return { A: { x, y } };
          }
          case "Button B": {
            const [x, y] = value.split(",", 2).map((v) =>
              parseInt(v.trim().split("+", 2)[1])
            );
            return { B: { x, y } };
          }
          case "Prize": {
            const [x, y] = value.split(",", 2).map((v) =>
              parseInt(v.trim().split("=", 2)[1]) + 10000000000000
            );
            return { PRIZE: { x, y } };
          }
          default:
            throw new Error("wrong instruction");
        }
      }).reduce(
        (acc, v) => ({ ...acc, ...v }),
        {} as MACHINE,
      )
    );

  const solution = machines.map((m) => {
    const solb = computeB(m);
    const sola = computeA(m, solb);
    return {
      ...m,
      sola,
      solb,
      tokens: getTokensUsed(m, sola, solb, 4),
    };
  });

  // 82261957837868
  return solution.reduce((acc, v) => acc + v.tokens, 0);
}

export function solve() {
  return {
    part1: part1(dataFile),
    part2: part2(dataFile),
  };
}

Deno.test(function part1Test() {
  assertEquals(part1(testFile), 480);
});

Deno.test(function part2Test() {
  assertEquals(part2(testFile), 875318608908);
});
