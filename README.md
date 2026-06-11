# PS-timelog

Minimal backend repository for storing Daily Time Check-in form submissions.

## Run

```bash
npm test
npm start
```

Server defaults to `http://localhost:3000`.

## API

- `POST /api/submissions`  
  Saves one submission payload from the form.
- `GET /api/submissions`  
  Returns all stored submissions (newest first).
- `DELETE /api/submissions`  
  Clears all submissions.

Data is persisted to `data/submissions.json` (or `DATA_FILE` env var).

## Form integration

Replace the form's storage calls with API calls:

- Save: `POST /api/submissions` with `{ eng, date, projects }`
- Load: `GET /api/submissions`
- Clear all: `DELETE /api/submissions`