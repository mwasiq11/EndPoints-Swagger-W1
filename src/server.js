import './config/environment.js';
import { app } from './app.js';
import { closeDatabase } from './db.js';

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Backend API listening on http://localhost:${port}`);
});

async function shutdown(signal) {
  console.log(`Received ${signal}. Shutting down gracefully.`);

  server.close(async () => {
    try {
      await closeDatabase();
    } finally {
      process.exit(0);
    }
  });
}

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});