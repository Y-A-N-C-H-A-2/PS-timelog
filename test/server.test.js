const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { createServer } = require("../src/server");

async function startServer() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "ps-timelog-server-"));
  const dataFile = path.join(dir, "submissions.json");
  const server = createServer({ dataFile });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const addr = server.address();
  const baseUrl = `http://127.0.0.1:${addr.port}`;

  return { server, baseUrl };
}

test("POST then GET submissions", async (t) => {
  const { server, baseUrl } = await startServer();
  t.after(() => server.close());

  const payload = {
    eng: "Alice",
    date: "2026-06-11",
    projects: [{ project: "Migration", customer: "CCU", bill: 3, non: 0, nbtype: "None", match: "Yes, as scheduled", notes: "" }]
  };

  const postRes = await fetch(`${baseUrl}/api/submissions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  assert.equal(postRes.status, 201);

  const getRes = await fetch(`${baseUrl}/api/submissions`);
  assert.equal(getRes.status, 200);
  const body = await getRes.json();
  assert.equal(body.records.length, 1);
  assert.equal(body.records[0].eng, "Alice");
});

test("invalid payload is rejected", async (t) => {
  const { server, baseUrl } = await startServer();
  t.after(() => server.close());

  const postRes = await fetch(`${baseUrl}/api/submissions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eng: "", date: "bad", projects: [] })
  });
  assert.equal(postRes.status, 400);
});
