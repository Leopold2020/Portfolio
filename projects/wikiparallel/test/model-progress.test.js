import { test } from "node:test";
import assert from "node:assert/strict";

import { createModelProgress } from "../src/model-progress.js";

test("returns null until the first progress event", () => {
  const progress = createModelProgress();
  assert.equal(progress.update({ status: "initiate", file: "model.onnx" }), null);
  assert.equal(progress.update({ status: "download", file: "model.onnx" }), null);
});

test("reports the mean percentage across the files seen so far", () => {
  const progress = createModelProgress();
  assert.equal(progress.update({ status: "progress", file: "model.onnx", progress: 20 }), 20);
  assert.equal(progress.update({ status: "progress", file: "tokenizer.json", progress: 40 }), 30);
  assert.equal(progress.update({ status: "progress", file: "tokenizer.json", progress: 100 }), 60);
  assert.equal(progress.update({ status: "progress", file: "model.onnx", progress: 100 }), 100);
});

test("never moves backwards when a new file registers mid-download", () => {
  const progress = createModelProgress();
  assert.equal(progress.update({ status: "progress", file: "model.onnx", progress: 40 }), 40);
  // tokenizer.json appears at 0% — the raw mean would be 20, but the bar holds.
  assert.equal(progress.update({ status: "progress", file: "tokenizer.json", progress: 0 }), 40);
  assert.equal(progress.update({ status: "progress", file: "tokenizer.json", progress: 50 }), 45);
});

test("clamps out-of-range or missing progress values", () => {
  assert.equal(
    createModelProgress().update({ status: "progress", file: "a", progress: 150 }),
    100,
  );
  assert.equal(
    createModelProgress().update({ status: "progress", file: "a", progress: -5 }),
    0,
  );
  assert.equal(createModelProgress().update({ status: "progress", file: "a" }), 0);
});
