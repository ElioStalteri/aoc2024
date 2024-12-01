import * as aoc from "./src/index.ts";
// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  for (const [name, func] of Object.entries(aoc)) {
    console.log(name, func());
  }
}
