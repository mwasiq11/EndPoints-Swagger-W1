import { app } from './app.js';
import { closeDatabase } from './db.js';

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Task API listening on http://localhost:${port}`);
});

process.on('SIGINT', async () => {
  server.close(async () => {
    await closeDatabase();
    process.exit(0);
  });
});