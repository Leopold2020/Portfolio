import { test } from "node:test";
import assert from "node:assert/strict";

import { sortByCloseness, groupByField, PAGE_SIZE } from "../src/grouping.js";
import { makeParallel as parallel } from "./helpers.js";

test("PAGE_SIZE is six", () => {
  assert.equal(PAGE_SIZE, 6);
});

test("sortByCloseness orders by Closeness descending, breaking ties by title", () => {
  const out = sortByCloseness([
    parallel({ title: "B", closeness: 70 }),
    parallel({ title: "A", closeness: 90 }),
    parallel({ title: "D", closeness: 70 }),
    parallel({ title: "C", closeness: 70 }),
  ]);
  assert.deepEqual(out.map((p) => p.title), ["A", "B", "C", "D"]);
});

test("sortByCloseness does not mutate its input", () => {
  const input = [parallel({ title: "B", closeness: 1 }), parallel({ title: "A", closeness: 2 })];
  const snapshot = input.map((p) => p.title);
  sortByCloseness(input);
  assert.deepEqual(input.map((p) => p.title), snapshot);
});

test("groupByField buckets Parallels by Field and sorts each bucket by Closeness", () => {
  const groups = groupByField([
    parallel({ title: "sci-low", field: "Science", closeness: 40 }),
    parallel({ title: "art-hi", field: "Arts", closeness: 95 }),
    parallel({ title: "sci-hi", field: "Science", closeness: 80 }),
    parallel({ title: "art-low", field: "Arts", closeness: 30 }),
  ]);

  const science = groups.find((g) => g.field === "Science");
  const arts = groups.find((g) => g.field === "Arts");
  assert.deepEqual(science?.parallels.map((p) => p.title), ["sci-hi", "sci-low"]);
  assert.deepEqual(arts?.parallels.map((p) => p.title), ["art-hi", "art-low"]);
});

test("groupByField orders groups by canonical Field order, not by Closeness", () => {
  const groups = groupByField([
    parallel({ field: "Science", closeness: 50 }),
    parallel({ field: "Arts", closeness: 99 }),
    parallel({ field: "History", closeness: 70 }),
  ]);
  // Canonical Field order runs History, Arts, Science regardless of Closeness.
  assert.deepEqual(groups.map((g) => g.field), ["History", "Arts", "Science"]);
});

test("groupByField follows a supplied Field order", () => {
  const parallels = [
    parallel({ field: "Science", closeness: 50 }),
    parallel({ field: "Arts", closeness: 99 }),
    parallel({ field: "History", closeness: 70 }),
  ];
  const groups = groupByField(parallels, ["Arts", "Science", "History"]);
  assert.deepEqual(groups.map((g) => g.field), ["Arts", "Science", "History"]);
});

test("groupByField keeps a Field missing from the order after the listed ones", () => {
  const groups = groupByField(
    [parallel({ field: "Mystery", closeness: 99 }), parallel({ field: "Arts", closeness: 10 })],
    ["Arts", "Science"],
  );
  assert.deepEqual(groups.map((g) => g.field), ["Arts", "Mystery"]);
});
