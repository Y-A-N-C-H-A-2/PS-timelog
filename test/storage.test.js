const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { SubmissionStore } = require("../src/storage");

test("SubmissionStore add/list/clear", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "ps-timelog-store-"));
  const file = path.join(dir, "submissions.json");
  const store = new SubmissionStore(file);

  await store.add({
    eng: "Alice",
    date: "2026-06-11",
    projects: [{ project: "A", customer: "C", bill: 1, non: 0 }],
    submittedAt: "2026-06-11T10:00:00.000Z"
  });
  await store.add({
    eng: "Bob",
    date: "2026-06-11",
    projects: [{ project: "B", customer: "D", bill: 2, non: 0 }],
    submittedAt: "2026-06-11T11:00:00.000Z"
  });

  const list = await store.list();
  assert.equal(list.length, 2);
  assert.equal(list[0].eng, "Bob");
  assert.equal(list[1].eng, "Alice");

  await store.clear();
  const cleared = await store.list();
  assert.equal(cleared.length, 0);
});
