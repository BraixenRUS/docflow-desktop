README — Фоновая обработка документов (DocFlow.Api)
Минимальный бэкенд на ASP.NET Core (.NET 10): очередь обработки файлов + эндпоинт опроса статуса. Без БД, без внешних брокеров, без сторонних пакетов.

Архитектура
Компонент	Реализация
Очередь	System.Threading.Channels.Channel<Guid> (in-memory)
Хранилище статусов	ConcurrentDictionary<Guid, DocumentTask>
Воркер	BackgroundService, обрабатывает строго по одному
Mock-обработка	Task.Delay(10s)
Статусы: Queued → Running → Done / Error

Структура
text
DocFlow.Api/
├── DocFlow.Api.csproj
├── Program.cs
├── Models/DocumentTask.cs
├── Services/TaskQueue.cs      # очередь + хранилище
├── Services/Worker.cs         # фоновый воркер
└── Controllers/TasksController.cs
