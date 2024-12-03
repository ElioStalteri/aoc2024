// deno-lint-ignore-file no-fallthrough
import { assertEquals } from "@std/assert";

const decoder = new TextDecoder("utf-8");
const dataFile = decoder.decode(
  await Deno.readFile(import.meta.dirname + "/data.txt"),
);
const testFile = decoder.decode(
  await Deno.readFile(import.meta.dirname + "/test.txt"),
);

function part1(data: string) {
  const chars = data.trim().split("");
  const numbers = "0123456789";

  const state: {
    prev: null | string;
    number: null | string;
    res: number[][];
    tmp: number[];
  } = {
    number: null,
    prev: null,
    tmp: [],
    res: [],
  };

  for (const c of chars) {
    switch (c) {
      case "m":
        state.prev = "m";
        break;
      case "u":
        if (state.prev === "m") {
          state.prev = "u";
          break;
        }
      case "l":
        if (state.prev === "u") {
          state.prev = "l";
          break;
        }
      case "(":
        if (state.prev === "l") {
          state.prev = "(";
          break;
        }
      case ",":
        if (state.number && state.prev !== null) {
          state.prev = c;
          const num = parseInt(state.number);
          state.number = null;
          state.tmp.push(num);
          break;
        }
      case ")":
        if (state.number && state.prev !== null) {
          const num = parseInt(state.number);
          state.tmp.push(num);
          state.res.push(state.tmp);
          state.prev = null;
          state.number = null;
          state.tmp = [];
        }
      case "0":
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9":
        if (
          (state.prev && numbers.includes(state.prev)) ||
          state.prev === "(" ||
          state.prev === ","
        ) {
          state.prev = c;
          state.number = (state.number || "") + c;
          break;
        }
      default:
        state.prev = null;
        state.number = null;
        state.tmp = [];
    }
  }

  return state.res.map(([a, b]) => a * b).reduce((acc, v) => acc + v, 0);
}

function part2(data: string) {
  const chars = data.trim().split("");
  const numbers = "0123456789";

  const state: {
    prev: null | string;
    number: null | string;
    res: number[][];
    tmp: number[];
    do: boolean;
    enabled: boolean;
  } = {
    enabled: true,
    do: true,
    number: null,
    prev: null,
    tmp: [],
    res: [],
  };

  for (const c of chars) {
    switch (c) {
      case "m":
        if (state.enabled) {
          state.prev = "m";
          break;
        }
      case "u":
        if (state.prev === "m") {
          state.prev = "u";
          break;
        }
      case "l":
        if (state.prev === "u") {
          state.prev = "l";
          break;
        }
      case "(":
        if (state.prev && ["l", "t", "o"].includes(state.prev)) {
          state.prev = "(";
          break;
        }
      case ",":
        if (state.number && state.prev !== null) {
          state.prev = c;
          const num = parseInt(state.number);
          state.number = null;
          state.tmp.push(num);
          break;
        }
      case "0":
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9":
        if (
          (state.prev && numbers.includes(state.prev)) ||
          state.prev === "(" ||
          state.prev === ","
        ) {
          state.prev = c;
          state.number = (state.number || "") + c;
          break;
        }
      case ")":
        if (state.number && state.prev !== null) {
          const num = parseInt(state.number);
          state.tmp.push(num);
          state.res.push(state.tmp);
        }
        if (state.prev === "(") {
          state.enabled = state.do;
        }
      case "d":
        state.prev = "d";
        state.number = null;
        state.tmp = [];
        break;
      case "o":
        if (state.prev === "d") {
          state.prev = "o";
          state.do = true;
          break;
        }
      case "n":
        if (state.prev === "o") {
          state.prev = "n";
          break;
        }
      case "'":
        if (state.prev === "n") {
          state.prev = "'";
          break;
        }
      case "t":
        if (state.prev === "'") {
          state.prev = "t";
          state.do = false;
          break;
        }
      default:
        state.prev = null;
        state.number = null;
        state.tmp = [];
    }
  }

  return state.res.map(([a, b]) => a * b).reduce((acc, v) => acc + v, 0);
}

export function solve() {
  return {
    part1: part1(dataFile),
    part2: part2(dataFile),
  };
}

Deno.test(function part1Test() {
  assertEquals(part1(testFile), 161);
});

Deno.test(function part2Test() {
  assertEquals(part2(testFile), 48);
});
