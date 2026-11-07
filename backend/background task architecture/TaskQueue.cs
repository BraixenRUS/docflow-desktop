using System.Collections.Concurrent;
using System.Threading.Channels;
using DocFlow.Api.Models;

namespace DocFlow.Api.Services;

/// <summary>
/// In-memory очередь + хранилище статусов.
/// Регистрируется синглтоном — живёт всё время работы приложения.
/// </summary>
public class TaskQueue
{
    private readonly ConcurrentDictionary<Guid, DocumentTask> _tasks = new();
    private readonly Channel<Guid> _channel = Channel.CreateUnbounded<Guid>();

    public DocumentTask Create(string fileName)
    {
        var task = new DocumentTask
        {
            Id = Guid.NewGuid(),
            FileName = fileName,
            Status = "Queued",
            CreatedAt = DateTime.UtcNow
        };
        _tasks[task.Id] = task;
        _channel.Writer.TryWrite(task.Id);   // ставим в очередь
        return task;
    }

    public DocumentTask? Get(Guid id) =>
        _tasks.TryGetValue(id, out var t) ? t : null;

    public IReadOnlyCollection<DocumentTask> All() =>
        _tasks.Values.OrderByDescending(t => t.CreatedAt).ToList();

    // Чтение из канала — используется воркером
    public IAsyncEnumerable<Guid> ReadAllAsync(CancellationToken ct) =>
        _channel.Reader.ReadAllAsync(ct);

    // Метод обновления статуса — вызывается воркером
    public void Update(Guid id, Action<DocumentTask> mutate)
    {
        if (_tasks.TryGetValue(id, out var t))
        {
            mutate(t);
        }
    }
}