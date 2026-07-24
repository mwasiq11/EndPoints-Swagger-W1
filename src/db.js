import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'tasks.db');

let database;
let useBetterSqlite = false;

try {
  const betterSqlite3Module = await import('better-sqlite3');
  const BetterSqlite3 = betterSqlite3Module.default || betterSqlite3Module;
  database = new BetterSqlite3(dbPath);
  useBetterSqlite = true;
} catch (error) {
  database = new sqlite3.Database(dbPath);
}

function closeDatabase() {
  if (useBetterSqlite) {
    database.close();
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    database.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

function runSql(sql, params = []) {
  if (useBetterSqlite) {
    return Promise.resolve(database.prepare(sql).run(...params));
  }

  return new Promise((resolve, reject) => {
    database.run(sql, params, function runCallback(error) {
      if (error) {
        reject(error);
        return;
      }

      resolve(this);
    });
  });
}

function getSql(sql, params = []) {
  if (useBetterSqlite) {
    return Promise.resolve(database.prepare(sql).get(...params));
  }

  return new Promise((resolve, reject) => {
    database.get(sql, params, (error, row) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(row);
    });
  });
}

function allSql(sql, params = []) {
  if (useBetterSqlite) {
    return Promise.resolve(database.prepare(sql).all(...params));
  }

  return new Promise((resolve, reject) => {
    database.all(sql, params, (error, rows) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(rows);
    });
  });
}

async function initializeDatabase() {
  await runSql(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      done INTEGER
    )
  `);

  const seedCountRow = await getSql('SELECT COUNT(*) AS count FROM tasks');

  if (seedCountRow.count === 0) {
    await runSql('INSERT INTO tasks (title, done) VALUES (?, ?)', ['Learn Express', 0]);
    await runSql('INSERT INTO tasks (title, done) VALUES (?, ?)', ['Build CRUD API', 0]);
    await runSql('INSERT INTO tasks (title, done) VALUES (?, ?)', ['Connect SQLite Database', 0]);
  }
}

function toTaskResponse(row) {
  return {
    id: row.id,
    title: row.title,
    done: row.done === 1
  };
}

function toDatabaseDone(value) {
  return value ? 1 : 0;
}

await initializeDatabase();

export async function getAllTasks() {
  const rows = await allSql('SELECT id, title, done FROM tasks ORDER BY id');
  return rows.map(toTaskResponse);
}

export async function getTaskById(id) {
  const row = await getSql('SELECT id, title, done FROM tasks WHERE id = ?', [id]);
  return row ? toTaskResponse(row) : null;
}

export async function createTask(title) {
  const result = await runSql('INSERT INTO tasks (title, done) VALUES (?, ?)', [title, 0]);
  const insertId = useBetterSqlite ? result.lastInsertRowid : result.lastID;
  return getTaskById(insertId);
}

export async function updateTask(id, title, done) {
  await runSql('UPDATE tasks SET title = ?, done = ? WHERE id = ?', [title, toDatabaseDone(done), id]);
  return getTaskById(id);
}

export async function deleteTask(id) {
  const result = await runSql('DELETE FROM tasks WHERE id = ?', [id]);
  const changes = useBetterSqlite ? result.changes : result.changes;
  return changes > 0;
}

export { closeDatabase };
export default database;
