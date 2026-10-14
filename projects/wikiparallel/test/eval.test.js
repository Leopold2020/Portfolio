import { test } from "node:test";
import assert from "node:assert/strict";

import { CHALLENGES, formatChallengeReport } from "../build/eval.mjs";
import { isField } from "../src/fields.js";
import { makeParallel } from "./helpers.js";

test("the Challenge set has eight entries including the surge-of-users example", () => {
  assert.equal(CHALLENGES.length, 8);
  assert.equal(
    CHALLENGES.some((c) => c.challenge === "handling a sudden surge of users"),
    true,
  );
});

test("every Challenge is paired with a real Field as its Home Field", () => {
  for (const { challenge, homeField } of CHALLENGES) {
    assert.ok(challenge.length > 0);
    assert.equal(isField(homeField), true, `${homeField} is a Field`);
  }
});

test("formatChallengeReport prints the Challenge, Home Field and each Parallel", () => {
  const groups = [
    {
      field: "Science",
      parallels: [
        makeParallel({ title: "Homeostasis", field: "Science", closeness: 71, leadSection: "In biology, homeostasis is the state of steady internal conditions.\nMore text." }),
      ],
    },
    {
      field: "Society and social sciences",
      parallels: [makeParallel({ title: "Bank run", field: "Society and social sciences", closeness: 64 })],
    },
  ];

  const report = formatChallengeReport("handling a sudden surge of users", "Technology", groups);

  assert.match(report, /Challenge:\s+handling a sudden surge of users/);
  assert.match(report, /Home Field:\s+Technology/);
  assert.match(report, /Science/);
  assert.match(report, /\[71\] Homeostasis/);
  assert.match(report, /In biology, homeostasis/);
  assert.match(report, /\[64\] Bank run/);
  // The first line only — text after the first newline is dropped.
  assert.doesNotMatch(report, /More text\./);
});

test("formatChallengeReport clamps a long first line", () => {
  const long = "x".repeat(400);
  const report = formatChallengeReport("c", "Science", [
    { field: "Arts", parallels: [makeParallel({ field: "Arts", leadSection: long })] },
  ]);
  const preview = report.split("\n").find((l) => l.includes("x"));
  assert.ok(preview && preview.trim().length <= 151, "clamped to ~150 chars plus ellipsis");
  assert.match(report, /…/);
});

test("formatChallengeReport handles a Challenge with no Parallels", () => {
  const report = formatChallengeReport("c", "Science", []);
  assert.match(report, /\(no Parallels\)/);
});
