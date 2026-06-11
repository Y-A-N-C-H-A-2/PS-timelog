const fs = require("node:fs/promises");
const path = require("node:path");

class SubmissionStore {
  constructor(filePath) {
    this.filePath = filePath;
  }

  async ensureFile() {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    try {
      await fs.access(this.filePath);
    } catch {
      await fs.writeFile(this.filePath, "[]", "utf8");
    }
  }

  async readAll() {
    await this.ensureFile();
    const raw = await fs.readFile(this.filePath, "utf8");
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  async writeAll(records) {
    await this.ensureFile();
    await fs.writeFile(this.filePath, JSON.stringify(records, null, 2), "utf8");
  }

  async add(submission) {
    const all = await this.readAll();
    all.push(submission);
    await this.writeAll(all);
    return submission;
  }

  async list() {
    const all = await this.readAll();
    return [...all].sort((a, b) => (b.submittedAt || "").localeCompare(a.submittedAt || ""));
  }

  async clear() {
    await this.writeAll([]);
  }
}

module.exports = { SubmissionStore };
