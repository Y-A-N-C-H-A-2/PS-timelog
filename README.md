# PS-timelog

Daily time check-in form for the Professional Services team. Engineers open a
link, log what they worked on, and hit Submit. Every submission is stored as
rows in a Google Sheet owned by you, so you always have the data in your own
Google account — nothing is hosted locally.

The app is hosted for free on **Google Apps Script** (the form is served from a
`script.google.com` link) and the data lives in a **Google Sheet**.

## Repository contents

| File | Purpose |
|------|---------|
| `apps-script/Code.gs` | Server code: serves the form and reads/writes the Google Sheet |
| `apps-script/Index.html` | The form itself (UI + client logic) |

## One-time setup (~5 minutes)

1. **Create the Sheet** — go to [sheets.new](https://sheets.new) while signed in
   to your Google account and name it e.g. `PS Time Check-ins`.

2. **Open the script editor** — in the Sheet: **Extensions → Apps Script**.

3. **Add the server code** — replace the contents of the default `Code.gs`
   with [`apps-script/Code.gs`](apps-script/Code.gs).
   **Change the `ADMIN_KEY` value at the top** to a password of your choice —
   it protects the "Responses" tab in the form.

4. **Add the form** — in the script editor click **+ → HTML**, name the file
   exactly `Index`, and replace its contents with
   [`apps-script/Index.html`](apps-script/Index.html).

5. **Deploy** — click **Deploy → New deployment → ⚙ Select type → Web app**:
   - Description: anything, e.g. `v1`
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy**, authorize the script when asked, and copy the
     **Web app URL** (`https://script.google.com/macros/s/…/exec`).

6. **Share the Web app URL with the engineers.** That's the link they click —
   no sign-in, just fill in and submit.

## Where the responses go

- Every submission appends rows to the **Responses** tab of your Sheet
  (one row per project entry), so you can analyse/filter/pivot there directly.
- The form's own **Responses** tab shows totals, a table, and a CSV download —
  it asks for the `ADMIN_KEY` you set in step 3, so engineers can't see each
  other's entries.

## Updating the form later

Edit the files here in the repo, copy the changes into the Apps Script editor,
then **Deploy → Manage deployments → ✏ Edit → Version: New version → Deploy**.
The link stays the same.

> Note: "Who has access: Anyone" means anyone who has the (unguessable) link
> can submit. If your team uses Google Workspace you can choose
> "Anyone with Google account" or restrict to your domain instead.
