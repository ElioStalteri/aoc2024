import * as aoc from "./src/index.ts";
// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  const files = Object.entries(aoc).sort((a, b) =>
    parseInt(a[0].split("day")[1]) - parseInt(b[0].split("day")[1])
  );
  for (const [name, func] of files) {
    if (name === "template") continue;
    console.log(name, func());
  }
}
