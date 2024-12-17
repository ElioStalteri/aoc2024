import { assertEquals } from "@std/assert";

const decoder = new TextDecoder("utf-8");
const dataFile = decoder.decode(
  await Deno.readFile(import.meta.dirname + "/data.txt"),
);
const testFile = decoder.decode(
  await Deno.readFile(import.meta.dirname + "/test.txt"),
);

type OPTCODES = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

interface REGISTERS {
  A: bigint;
  B: bigint;
  C: bigint;
}

function getProgram(
  a: bigint = BigInt(0),
  b: bigint = BigInt(0),
  c: bigint = BigInt(0),
  log = false,
) {
  const registers = {
    A: a,
    B: b,
    C: c,
  };

  const combo = {
    0: () => BigInt(0),
    1: () => BigInt(1),
    2: () => BigInt(2),
    3: () => BigInt(3),
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
      registers.A = BigInt(
        registers.A / (BigInt(2) ** combo[operator]()),
      );
    },
    1: (operator: keyof typeof combo) => {
      if (log) console.log("bxl", operator);
      registers.B = registers.B ^ BigInt(operator);
    },
    2: (operator: keyof typeof combo) => {
      if (log) console.log("bst", operator);
      registers.B = combo[operator]() % BigInt(8);
    },
    3: (operator: keyof typeof combo) => {
      if (log) console.log("jnz", operator);
      if (registers.A === BigInt(0)) return;
      return { jump: operator };
    },
    4: (operator: keyof typeof combo) => {
      if (log) console.log("bxc", operator);
      registers.B = registers.B ^ registers.C;
    },
    5: (operator: keyof typeof combo) => {
      if (log) console.log("out", operator);
      return { out: combo[operator]() % BigInt(8) };
    },
    6: (operator: keyof typeof combo) => {
      if (log) console.log("bdv", operator);
      registers.B = registers.A / (BigInt(2) ** combo[operator]());
    },
    7: (operator: keyof typeof combo) => {
      if (log) console.log("cdv", operator);
      registers.C = registers.A / (BigInt(2) ** combo[operator]());
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
          return { ...acc, A: BigInt(value) };
        case "Register B":
          return { ...acc, B: BigInt(value) };
        case "Register C":
          return { ...acc, C: BigInt(value) };
        default:
          throw new Error("register not found");
      }
    },
    {} as REGISTERS,
  );
  const program = getProgram(registers.A, registers.B, registers.C);
  const instructions = instructionsStr.split(":")[1].trim().split(",").map((
    v,
  ) => parseInt(v) as OPTCODES);

  const out: bigint[] = [];
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

function runProgram(registers: REGISTERS, instructions: OPTCODES[]) {
  const program = getProgram(registers.A, registers.B, registers.C);

  const out: bigint[] = [];
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

    //if (!instructions.join(",").includes(out.join(","))) return out;
  }
  return out;
}

function part2(data: string) {
  const [registersStr, instructionsStr] = data.trim().split("\n\n").filter(
    Boolean,
  );
  const registers = registersStr.split("\n").filter(Boolean).reduce(
    (acc, r) => {
      const [desc, value] = r.split(":").map((v) => v.trim()).filter(Boolean);
      switch (desc) {
        case "Register A":
          return { ...acc, A: BigInt(value) };
        case "Register B":
          return { ...acc, B: BigInt(value) };
        case "Register C":
          return { ...acc, C: BigInt(value) };
        default:
          throw new Error("register not found");
      }
    },
    {} as REGISTERS,
  );
  const instructions = instructionsStr.split(":")[1].trim().split(",").map((
    v,
  ) => parseInt(v) as OPTCODES);

  let out = "";
  let A = BigInt(-1);
  //do {
  //  A += BigInt(14);
  //for (let i = 18_639_548; i < 18_639_560; i++) {
  //    //console.log("A", A);
  const numberStr = (BigInt(8) ** BigInt(instructions.length - 1)).toString()
    .split("").map((v) => parseInt(v));
  numberStr[0] += 0;
  //numberStr[numberStr.length - 2] = 0;
  const number = BigInt(
    numberStr.join(""),
  );
  const o = runProgram(
    {
      ...registers,
      A: number,
    },
    instructions,
  );
  out = o.join(",");
  //console.clear();
  console.log(
    "bxl length",
    number,
    //BigInt(8) ** BigInt(instructions.length - 1) + BigInt(i),
    "\n",
    //"bxl i",
    //i,
    //"\n",
    "bxl          end",
    out,
    "\n",
    "bxl instructions",
    instructions.join(","),
  );
  //if (out === instructions.join(",")) {
  //A = (BigInt(8) ** BigInt(instructions.length - 1)) + BigInt(i);
  //break;
  //}
  //    if (o.length > 7) {
  //      console.log("out", out);
  //      console.log("A", A, i);
  //    }
  //}
  //} while (out !== instructions.join(","));

  return A;
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
  assertEquals(
    part2(`Register A: 2024
Register B: 0
Register C: 0

Program: 0,3,5,4,3,0`),
    BigInt(117440),
  );
});
