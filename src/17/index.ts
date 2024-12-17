import { assertEquals } from "@std/assert";

const decoder = new TextDecoder("utf-8");
const dataFile = decoder.decode(
  await Deno.readFile(import.meta.dirname + "/data.txt"),
);
const testFile = decoder.decode(
  await Deno.readFile(import.meta.dirname + "/test.txt"),
);

function getProgram(a: number = 0, b: number = 0, c: number = 0, log = false) {
  const registers = {
    A: a,
    B: b,
    C: c,
  };

  const combo = {
    0: () => 0,
    1: () => 1,
    2: () => 2,
    3: () => 3,
    4: () => registers.A,
    5: () => registers.B,
    6: () => registers.C,
    7: () => {
      throw new Error("combo 7 doesnt exists");
    },
  };

  const optCodes = {
    0: (operator: keyof typeof combo) => {
      if (log) console.log("adv", operator);
      registers.A = Math.trunc(registers.A / Math.pow(2, combo[operator]()));
    },
    1: (operator: keyof typeof combo) => {
      if (log) console.log("bxl", operator);
      registers.B = registers.B ^ operator;
    },
    2: (operator: keyof typeof combo) => {
      if (log) console.log("bst", operator);
      registers.B = combo[operator]() % 8;
    },
    3: (operator: keyof typeof combo) => {
      if (log) console.log("jnz", operator);
      if (registers.A === 0) return;
      return { jump: operator };
    },
    4: (operator: keyof typeof combo) => {
      if (log) console.log("bxc", operator);
      registers.B = registers.B ^ registers.C;
    },
    5: (operator: keyof typeof combo) => {
      if (log) console.log("out", operator);
      return { out: combo[operator]() % 8 };
    },
    6: (operator: keyof typeof combo) => {
      if (log) console.log("bdv", operator);
      registers.B = Math.trunc(registers.A / Math.pow(2, combo[operator]()));
    },
    7: (operator: keyof typeof combo) => {
      if (log) console.log("cdv", operator);
      registers.C = Math.trunc(registers.A / Math.pow(2, combo[operator]()));
    },
  };
  return {
    registers,
    combo,
    optCodes,
  };
}

function part1(data: string) {
  const [registersStr, instructionsStr] = data.trim().split("\n\n").filter(
    Boolean,
  );
  const registers = registersStr.split("\n").filter(Boolean).reduce(
    (acc, r) => {
      const [desc, value] = r.split(":").map((v) => v.trim()).filter(Boolean);
      switch (desc) {
        case "Register A":
          return { ...acc, A: parseInt(value) };
        case "Register B":
          return { ...acc, B: parseInt(value) };
        case "Register C":
          return { ...acc, C: parseInt(value) };
        default:
          throw new Error("register not found");
      }
    },
    {} as { A: number; B: number; C: number },
  );
  const program = getProgram(registers.A, registers.B, registers.C);
  const instructions = instructionsStr.split(":")[1].trim().split(",").map((
    v,
  ) => parseInt(v) as keyof typeof program.optCodes);

  const out: number[] = [];
  let cursor = 0;
  while (cursor >= 0 && cursor < instructions.length - 1) {
    //console.log("cursor", cursor);
    //console.log("instruction", instructions[cursor], instructions[cursor + 1]);
    //console.log("register", program.registers);
    const res = program.optCodes[instructions[cursor]](
      instructions[cursor + 1],
    );
    //console.log("res", res);
    if (res && "out" in res) out.push(res.out);
    if (res && "jump" in res) {
      cursor = res.jump;
    } else {
      cursor += 2;
    }

    //console.log("next cursor", cursor);
  }

  return out.join(",");
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
  assertEquals(part1(testFile), "4,6,3,5,6,3,5,2,1,0");
});

Deno.test(function part2Test() {
  assertEquals(part2(testFile), "todo");
});
