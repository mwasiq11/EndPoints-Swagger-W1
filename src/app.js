import express from 'express';
import swaggerUi from 'swagger-ui-express';
import openApiDocument from '../openapi.json' with { type: 'json' };

const app = express();

app.use(express.json());

const initialTasks = [
  { id: 1, title: 'Buy milk', done: false },
  { id: 2, title: 'Finish homework', done: true },
  { id: 3, title: 'Walk the dog', done: false }
];

let tasks = initialTasks.map((task) => ({ ...task }));

function nextTaskId() {
  return tasks.length === 0 ? 1 : Math.max(...tasks.map((task) => task.id)) + 1;
}

function findTaskById(id) {
  return tasks.find((task) => task.id === id);
}

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

function normalizeTask(task) {
  return {
    id: task.id,
    title: task.title,
    done: task.done
  };
}

app.get('/', (request, response) => {
  response.json({
    name: 'Task API',
    version: '1.0',
    endpoints: ['/tasks']
  });
});

app.get('/health', (request, response) => {
  response.json({ status: 'ok' });
});

app.get('/tasks', (request, response) => {
  response.json(tasks.map(normalizeTask));
});

app.get('/tasks/:id', (request, response) => {
  const id = parseTaskId(request.params.id);
  const task = id === null ? undefined : findTaskById(id);

  if (!task) {
    response.status(404).json({ error: `Task ${request.params.id} not found` });
    return;
  }

  response.json(normalizeTask(task));
});

app.post('/tasks', (request, response) => {
  const { body } = request;

  if (!isPlainObject(body) || !isNonEmptyString(body.title)) {
    response.status(400).json({ error: 'title is required and must not be empty' });
    return;
  }

  const task = {
    id: nextTaskId(),
    title: body.title.trim(),
    done: false
  };

  tasks.push(task);
  response.status(201).json(normalizeTask(task));
});

app.put('/tasks/:id', (request, response) => {
  const id = parseTaskId(request.params.id);
  const task = id === null ? undefined : findTaskById(id);

  if (!task) {
    response.status(404).json({ error: `Task ${request.params.id} not found` });
    return;
  }

  const { body } = request;

  if (!isPlainObject(body) || (body.title === undefined && body.done === undefined)) {
    response.status(400).json({ error: 'request body must include title and/or done' });
    return;
  }

  if (body.title !== undefined) {
    if (!isNonEmptyString(body.title)) {
      response.status(400).json({ error: 'title must not be empty' });
      return;
    }

    task.title = body.title.trim();
  }

  if (body.done !== undefined) {
    if (typeof body.done !== 'boolean') {
      response.status(400).json({ error: 'done must be a boolean' });
      return;
    }

    task.done = body.done;
  }

  response.json(normalizeTask(task));
});

app.delete('/tasks/:id', (request, response) => {
  const id = parseTaskId(request.params.id);
  const index = id === null ? -1 : tasks.findIndex((task) => task.id === id);

  if (index === -1) {
    response.status(404).json({ error: `Task ${request.params.id} not found` });
    return;
  }

  tasks.splice(index, 1);
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
