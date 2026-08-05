import './config/environment.js';
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

let useInMemoryStore = false;
let memoryTasks = [
  { id: 1, title: 'Learn Express', done: false },
  { id: 2, title: 'Build CRUD API', done: false },
  { id: 3, title: 'Connect PostgreSQL Database', done: false }
];
let nextMemoryTaskId = 4;

function toTaskResponse(row) {
  return {
    id: Number(row.id),
    title: row.title,
    done: Boolean(row.done)
  };
}

async function initializeDatabase(retries = 3, delayMs = 500) {
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
        useInMemoryStore = true;
        console.warn('PostgreSQL unavailable; using in-memory task store for this session.');
        console.warn(error);
        return;
      }
      console.log(`Waiting for PostgreSQL... (attempt ${attempt}/${retries})`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

await initializeDatabase();

export async function getAllTasks() {
  if (useInMemoryStore) {
    return memoryTasks.map((task) => ({ ...task }));
  }

  const result = await pool.query('SELECT id, title, done FROM tasks ORDER BY id');
  return result.rows.map(toTaskResponse);
}

export async function getTaskById(id) {
  if (useInMemoryStore) {
    const task = memoryTasks.find((entry) => entry.id === id);
    return task ? { ...task } : null;
  }

  const result = await pool.query('SELECT id, title, done FROM tasks WHERE id = $1', [id]);
  return result.rows.length > 0 ? toTaskResponse(result.rows[0]) : null;
}

export async function createTask(title) {
  if (useInMemoryStore) {
    const task = { id: nextMemoryTaskId++, title, done: false };
    memoryTasks.push(task);
    return { ...task };
  }

  const result = await pool.query(
    'INSERT INTO tasks (title, done) VALUES ($1, $2) RETURNING *',
    [title, false]
  );
  return toTaskResponse(result.rows[0]);
}

export async function updateTask(id, title, done) {
  if (useInMemoryStore) {
    const task = memoryTasks.find((entry) => entry.id === id);

    if (!task) {
      return null;
    }

    task.title = title;
    task.done = Boolean(done);
    return { ...task };
  }

  const result = await pool.query(
    'UPDATE tasks SET title = $1, done = $2 WHERE id = $3 RETURNING *',
    [title, Boolean(done), id]
  );
  return result.rows.length > 0 ? toTaskResponse(result.rows[0]) : null;
}

export async function deleteTask(id) {
  if (useInMemoryStore) {
    const index = memoryTasks.findIndex((entry) => entry.id === id);

    if (index === -1) {
      return false;
    }

    memoryTasks.splice(index, 1);
    return true;
  }

  const result = await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
  return result.rowCount > 0;
}

export async function closeDatabase() {
  if (!useInMemoryStore) {
    await pool.end();
  }
}

export default pool;
