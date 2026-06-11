const http = require("node:http");
const path = require("node:path");
const { SubmissionStore } = require("./storage");

const DEFAULT_FILE = path.join(process.cwd(), "data", "submissions.json");

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(body);
}

function validateSubmission(input) {
  if (!input || typeof input !== "object") return "Payload must be an object.";
  if (!String(input.eng || "").trim()) return "eng is required.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(input.date || ""))) return "date must be YYYY-MM-DD.";
  if (!Array.isArray(input.projects) || input.projects.length === 0) return "projects must contain at least one item.";
  if (input.projects.length > 5) return "projects cannot exceed 5 items.";

  for (let i = 0; i < input.projects.length; i += 1) {
    const p = input.projects[i] || {};
    const name = String(p.project || "").trim();
    const customer = String(p.customer || "").trim();
    const bill = Number(p.bill);
    const non = Number(p.non);
    if (!name || !customer) return `projects[${i}] requires project and customer.`;
    if (!Number.isFinite(bill) || !Number.isFinite(non) || bill < 0 || non < 0) {
      return `projects[${i}] bill/non must be numbers >= 0.`;
    }
    if (bill === 0 && non === 0) return `projects[${i}] must log billable or non-billable hours.`;
  }

  return null;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error("Payload too large"));
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function createServer({ dataFile = DEFAULT_FILE } = {}) {
  const store = new SubmissionStore(dataFile);
  return http.createServer(async (req, res) => {
    if (req.method === "OPTIONS") return sendJson(res, 204, {});

    if (req.url === "/api/submissions" && req.method === "GET") {
      const records = await store.list();
      return sendJson(res, 200, { records });
    }

    if (req.url === "/api/submissions" && req.method === "DELETE") {
      await store.clear();
      return sendJson(res, 200, { ok: true });
    }

    if (req.url === "/api/submissions" && req.method === "POST") {
      try {
        const raw = await readBody(req);
        const payload = JSON.parse(raw || "{}");
        const err = validateSubmission(payload);
        if (err) return sendJson(res, 400, { error: err });
        const record = {
          ...payload,
          submittedAt: new Date().toISOString()
        };
        await store.add(record);
        return sendJson(res, 201, { record });
      } catch (error) {
        const message = error instanceof SyntaxError ? "Invalid JSON body." : "Could not save submission.";
        return sendJson(res, 400, { error: message });
      }
    }

    return sendJson(res, 404, { error: "Not found." });
  });
}

if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  const server = createServer({ dataFile: process.env.DATA_FILE || DEFAULT_FILE });
  server.listen(port, () => {
    console.log(`PS timelog API listening on http://localhost:${port}`);
  });
}

module.exports = { createServer, validateSubmission };
