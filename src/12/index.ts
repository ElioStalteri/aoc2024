import { assertEquals } from "@std/assert";

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

function findPos(pos: POS[], p: POS) {
  const idx = pos.findIndex(({ x, y }) => p.x === x && p.y === y);
  return { exists: idx !== -1, idx };
}

interface ADIACENT {
  adiacent: boolean;
  edge: boolean;
  alone: boolean;
  edges: number;
  curr: number;
  currPos: POS;
  adiacents: number[];
  edgeDetail: {
    top: boolean;
    bottom: boolean;
    left: boolean;
    right: boolean;
  };
}

function checkAdiacent(pos: POS[], p: POS): ADIACENT {
  const curr = findPos(pos, p);
  const top = findPos(pos, { ...p, y: p.y - 1 });
  const bottom = findPos(pos, { ...p, y: p.y + 1 });
  const left = findPos(pos, { ...p, x: p.x - 1 });
  const right = findPos(pos, { ...p, x: p.x + 1 });
  const edges = (!top.exists ? 1 : 0) +
    (!bottom.exists ? 1 : 0) +
    (!left.exists ? 1 : 0) +
    (!right.exists ? 1 : 0);
  //if (p.x === 8 && p.y === 1) console.log(edges, top, bottom, left, right);
  return {
    adiacent: !!top || !!bottom || !!left || !!right,
    edge: edges > 0,
    alone: edges === 4,
    edgeDetail: {
      top: !top.exists,
      bottom: !bottom.exists,
      left: !left.exists,
      right: !right.exists,
    },
    edges,
    curr: curr.idx,
    currPos: p,
    adiacents: [top.idx, bottom.idx, left.idx, right.idx, curr.idx].filter((
      v,
    ) => v !== -1),
  };
}

type REGION = ADIACENT[];

function getRegions(pos: POS[]): REGION[] {
  const adiacents = pos.map((p) => checkAdiacent(pos, p));

  const regionPositionsIdx = adiacents.reduce((acc, v) => {
    if (acc.length === 0) return [v.adiacents];
    const found = acc.filter((adjs) =>
      v.adiacents.some((idx) => adjs.includes(idx))
    );
    if (found.length === 0) return [...acc, v.adiacents];
    const rest = acc.filter((adjs) =>
      !v.adiacents.some((idx) => adjs.includes(idx))
    );
    const merged = found.reduce((m, a) => m.concat(a), [] as number[]);
    const res = Array.from(new Set([...merged, ...v.adiacents]));
    return [...rest, res];
  }, [] as number[][]);

  return regionPositionsIdx.map((idxs) => idxs.map((idx) => adiacents[idx]));
}

function getFencePrice(reagion: REGION) {
  const area = reagion.length;
  const perimeter = reagion.reduce((acc, p) => acc + p.edges, 0);
  return area * perimeter;
}

function part1(data: string) {
  const garden = data.trim().split("\n")
    .map((r) => r.trim().split(""));
  const positionsByPlant = garden.reduce((acc, line, y) => {
    const newAcc = { ...acc };
    for (let x = 0; x < line.length; x++) {
      const plant = line[x];
      newAcc[plant] = [...(newAcc[plant] || []), { x, y }];
    }
    return newAcc;
  }, {} as { [key: string]: POS[] });

  //console.log(positionsByPlant["C"]);

  const regionsByPlant = Object.entries(positionsByPlant).reduce(
    (acc, [plant, positions]) => {
      const regions = getRegions(positions);
      const fencePrice = regions.map((r) => getFencePrice(r)).reduce(
        (acc, v) => acc + v,
        0,
      );
      //if (plant === "C") {
      //  console.log(regions);
      //}

      return ({ ...acc, [plant]: { fencePrice } });
    },
    {} as {
      [plant: string]: {
        fencePrice: number;
        regions?: ReturnType<typeof getRegions>;
      };
    },
  );
  //console.log(regionsByPlant);
  return Object.values(regionsByPlant).reduce(
    (acc, r) => acc + r.fencePrice,
    0,
  );
}

function countContigous(
  _pos: POS[],
  key: keyof POS,
  level: keyof POS,
  plant?: string,
) {
  const pos = _pos.toSorted((a, b) => a[key] - b[key]);
  const levels = Array.from(new Set(pos.map((p) => p[level])));
  //if (plant === "F") console.log(pos);
  let count = 0;
  for (const l of levels) {
    count++;
    const toCheck = pos.filter((p) => p[level] === l);
    for (let i = 0; i < toCheck.length - 1; i++) {
      //if (plant === "F") {
      //  console.log(
      //    key,
      //    toCheck[i],
      //    toCheck[i + 1],
      //    level,
      //    l,
      //  );
      //}
      if (
        toCheck[i][key] + 1 !== toCheck[i + 1][key]
      ) count++;
    }
  }
  //if (plant === "F") console.log(count);
  return count;
}

function getEdgesWithDiscount(r: REGION, plant?: string) {
  const edges = r.filter((ad) => ad.edge);
  const tops = countContigous(
    edges.filter((ed) => ed.edgeDetail.top).map((ed) => ed.currPos),
    "x",
    "y",
    plant,
  );
  const botts = countContigous(
    edges.filter((ed) => ed.edgeDetail.bottom).map((ed) => ed.currPos),
    "x",
    "y",
    plant,
  );
  const rights = countContigous(
    edges.filter((ed) => ed.edgeDetail.right).map((ed) => ed.currPos),
    "y",
    "x",
    plant,
  );
  const lefts = countContigous(
    edges.filter((ed) => ed.edgeDetail.left).map((ed) => ed.currPos),
    "y",
    "x",
    plant,
  );
  //if (plant === "F") console.log(tops, botts, lefts, rights);
  return tops + botts + lefts + rights;
}

function getFencePriceDisc(reagion: REGION, plant?: string) {
  const area = reagion.length;
  const perimeter = getEdgesWithDiscount(reagion, plant);
  //if (plant === "F") console.log(area, perimeter);
  return area * perimeter;
}

function part2(data: string) {
  const garden = data.trim().split("\n")
    .map((r) => r.trim().split(""));
  const positionsByPlant = garden.reduce((acc, line, y) => {
    const newAcc = { ...acc };
    for (let x = 0; x < line.length; x++) {
      const plant = line[x];
      newAcc[plant] = [...(newAcc[plant] || []), { x, y }];
    }
    return newAcc;
  }, {} as { [key: string]: POS[] });

  //console.log(positionsByPlant["C"]);

  const regionsByPlant = Object.entries(positionsByPlant).reduce(
    (acc, [plant, positions]) => {
      const regions = getRegions(positions);

      const fencePrice = regions.map((r) => getFencePriceDisc(r, plant));
      //if (plant === "F") {
      //  console.log(fencePrice);
      //}

      return ({
        ...acc,
        [plant]: {
          fencePrice: fencePrice.reduce(
            (acc, v) => acc + v,
            0,
          ),
        },
      });
    },
    {} as {
      [plant: string]: {
        fencePrice: number;
        regions?: ReturnType<typeof getRegions>;
      };
    },
  );
  //console.log(regionsByPlant);
  return Object.values(regionsByPlant).reduce(
    (acc, r) => acc + r.fencePrice,
    0,
  );
}

export function solve() {
  return {
    part1: part1(dataFile),
    part2: part2(dataFile),
  };
}

Deno.test(function part1Test() {
  assertEquals(part1(testFile), 1930);
});

Deno.test(function part2Test() {
  assertEquals(part2(testFile), 1206);
});
