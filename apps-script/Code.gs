/**
 * PS Daily Time Check-in — Google Apps Script backend.
 *
 * This script is meant to be bound to a Google Sheet:
 * open the Sheet → Extensions → Apps Script → paste this file,
 * then add an HTML file named "Index" with the contents of Index.html.
 * Deploy as a Web app (Execute as: Me, Who has access: Anyone).
 */

// Change this before deploying — it protects the "Responses" tab in the form.
const ADMIN_KEY = 'CHANGE-ME';

const SHEET_NAME = 'Responses';
const HEADERS = [
  'Submitted At', 'Date', 'Engineer', 'Project', 'Customer',
  'Billable Hrs', 'Non-Billable Hrs', 'Non-Billable Type',
  'Matched Schedule', 'Notes'
];

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('PS Daily Time Check-in')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function getSheet_() {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
  }
  return sh;
}

/** Called from the form. rec = {eng, date, projects:[{project,customer,bill,non,nbtype,match,notes}]} */
function submitTimesheet(rec) {
  if (!rec || !rec.eng || !rec.date || !Array.isArray(rec.projects) || rec.projects.length === 0) {
    throw new Error('Invalid submission');
  }
  const sh = getSheet_();
  const ts = new Date().toISOString();
  const rows = rec.projects.map(function (p) {
    return [
      ts,
      String(rec.date),
      String(rec.eng),
      String(p.project || ''),
      String(p.customer || ''),
      Number(p.bill) || 0,
      Number(p.non) || 0,
      p.nbtype === 'None' ? '' : String(p.nbtype || ''),
      String(p.match || ''),
      String(p.notes || '')
    ];
  });
  sh.getRange(sh.getLastRow() + 1, 1, rows.length, HEADERS.length).setValues(rows);
  return { ok: true };
}

/** Returns all submissions (flat, one entry per project row). Requires the admin key. */
function getResponses(key) {
  requireAdmin_(key);
  const sh = getSheet_();
  if (sh.getLastRow() < 2) return [];
  const values = sh.getRange(2, 1, sh.getLastRow() - 1, HEADERS.length).getValues();
  return values.map(function (r) {
    return {
      submittedAt: iso_(r[0]),
      date: dateStr_(r[1]),
      eng: String(r[2]),
      project: String(r[3]),
      customer: String(r[4]),
      bill: Number(r[5]) || 0,
      non: Number(r[6]) || 0,
      nbtype: String(r[7]),
      match: String(r[8]),
      notes: String(r[9])
    };
  });
}

/** Deletes all submission rows (keeps the header). Requires the admin key. */
function clearAllResponses(key) {
  requireAdmin_(key);
  const sh = getSheet_();
  if (sh.getLastRow() > 1) sh.deleteRows(2, sh.getLastRow() - 1);
  return { ok: true };
}

function requireAdmin_(key) {
  if (!key || key !== ADMIN_KEY) throw new Error('Invalid admin key');
}

function iso_(v) {
  return v instanceof Date ? v.toISOString() : String(v || '');
}

function dateStr_(v) {
  if (v instanceof Date) {
    return Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return String(v || '');
}
