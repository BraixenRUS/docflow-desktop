const API_URL = '/api/tasks';

const statusMap = {
  Queued: 'queued',
  Running: 'processing',
  Done: 'completed',
  Error: 'error',
};

export async function fetchTasks() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error(`Ошибка API: ${response.status}`);
  }

  const tasks = await response.json();

  return tasks.map((task) => ({
    id: `api-${task.id}`,
    label: task.fileName,
    type: 'Другой',
    date: new Date(task.createdAt).toLocaleDateString('ru-RU'),
    description: task.errorMessage || 'Документ загружен для фоновой обработки.',
    status: statusMap[task.status] || 'queued',
    source: 'api',
  }));
}