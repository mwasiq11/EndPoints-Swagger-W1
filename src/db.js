import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '..', '.env');

if (!process.env.DATABASE_URL && fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...values] = trimmed.split('=');
      process.env[key.trim()] = values.join('=').trim();
    }
  }
}

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:dev@localhost:5432/tasks'
});

function toTaskResponse(row) {
  return {
    id: Number(row.id),
    title: row.title,
    done: Boolean(row.done)
  };
}

async function initializeDatabase(retries = 10, delayMs = 2000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS tasks (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          done BOOLEAN NOT NULL DEFAULT false
        )
      `);

      const countResult = await pool.query('SELECT COUNT(*) AS count FROM tasks');
      const count = Number.parseInt(countResult.rows[0].count, 10);

      if (count === 0) {
        await pool.query('INSERT INTO tasks (title, done) VALUES ($1, $2)', ['Learn Express', false]);
        await pool.query('INSERT INTO tasks (title, done) VALUES ($1, $2)', ['Build CRUD API', false]);
        await pool.query('INSERT INTO tasks (title, done) VALUES ($1, $2)', ['Connect PostgreSQL Database', false]);
      }
      return;
    } catch (error) {
      if (attempt === retries) {
        console.error('Failed to connect to PostgreSQL database:', error);
        throw error;
      }
      console.log(`Waiting for PostgreSQL... (attempt ${attempt}/${retries})`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

await initializeDatabase();

export async function getAllTasks() {
  const result = await pool.query('SELECT id, title, done FROM tasks ORDER BY id');
  return result.rows.map(toTaskResponse);
}

export async function getTaskById(id) {
  const result = await pool.query('SELECT id, title, done FROM tasks WHERE id = $1', [id]);
  return result.rows.length > 0 ? toTaskResponse(result.rows[0]) : null;
}

export async function createTask(title) {
  const result = await pool.query(
    'INSERT INTO tasks (title, done) VALUES ($1, $2) RETURNING *',
    [title, false]
  );
  return toTaskResponse(result.rows[0]);
}

export async function updateTask(id, title, done) {
  const result = await pool.query(
    'UPDATE tasks SET title = $1, done = $2 WHERE id = $3 RETURNING *',
    [title, Boolean(done), id]
  );
  return result.rows.length > 0 ? toTaskResponse(result.rows[0]) : null;
}

export async function deleteTask(id) {
  const result = await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
  return result.rowCount > 0;
}

export async function closeDatabase() {
  await pool.end();
}

export default pool;
