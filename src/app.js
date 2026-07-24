import express from 'express';
import swaggerUi from 'swagger-ui-express';
import openApiDocument from '../openapi.json' with { type: 'json' };
import {
  createTask,
  deleteTask,
  getAllTasks,
  getTaskById,
  updateTask
} from './db.js';

const app = express();

app.use(express.json());

function parseTaskId(value) {
  const trimmedValue = String(value).trim();

  if (!/^\d+$/.test(trimmedValue)) {
    return null;
  }

  return Number.parseInt(trimmedValue, 10);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

app.get('/', (request, response) => {
  response.json({
    name: 'Task API',
    version: '1.0',
    endpoints: ['/health', '/tasks', '/tasks/:id', '/docs', '/openapi.json']
  });
});

app.get('/health', (request, response) => {
  response.json({ status: 'ok' });
});

app.get('/tasks', async (request, response) => {
  response.json(await getAllTasks());
});

app.get('/tasks/:id', async (request, response) => {
  const id = parseTaskId(request.params.id);
  const task = id === null ? undefined : await getTaskById(id);

  if (!task) {
    response.status(404).json({ error: `Task ${request.params.id} not found` });
    return;
  }

  response.json(task);
});

app.post('/tasks', async (request, response) => {
  const { body } = request;

  if (!isPlainObject(body) || !isNonEmptyString(body.title)) {
    response.status(400).json({ error: 'title is required and must not be empty' });
    return;
  }

  const task = await createTask(body.title.trim());
  response.status(201).json(task);
});

app.put('/tasks/:id', async (request, response) => {
  const id = parseTaskId(request.params.id);
  const existingTask = id === null ? undefined : await getTaskById(id);

  if (!existingTask) {
    response.status(404).json({ error: `Task ${request.params.id} not found` });
    return;
  }

  const { body } = request;

  if (!isPlainObject(body) || (body.title === undefined && body.done === undefined)) {
    response.status(400).json({ error: 'request body must include title and/or done' });
    return;
  }

  let title = existingTask.title;
  let done = existingTask.done;

  if (body.title !== undefined) {
    if (!isNonEmptyString(body.title)) {
      response.status(400).json({ error: 'title must not be empty' });
      return;
    }

    title = body.title.trim();
  }

  if (body.done !== undefined) {
    if (typeof body.done !== 'boolean') {
      response.status(400).json({ error: 'done must be a boolean' });
      return;
    }

    done = body.done;
  }

  const task = await updateTask(id, title, done);
  response.json(task);
});

app.delete('/tasks/:id', async (request, response) => {
  const id = parseTaskId(request.params.id);

  if (id === null || !(await deleteTask(id))) {
    response.status(404).json({ error: `Task ${request.params.id} not found` });
    return;
  }

  response.status(204).send();
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));
app.get('/openapi.json', (request, response) => {
  response.json(openApiDocument);
});

app.use((error, request, response, next) => {
  if (error instanceof SyntaxError && 'body' in error) {
    response.status(400).json({ error: 'invalid JSON body' });
    return;
  }

  next(error);
});

export { app };
