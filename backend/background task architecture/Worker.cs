using DocFlow.Api.Services;

namespace DocFlow.Api.Workers;

/// <summary>
/// Фоновый воркер: по одному читает id из очереди и "обрабатывает" документ.
/// </summary>
public class Worker : BackgroundService
{
    private readonly TaskQueue _queue;
    private readonly ILogger<Worker> _logger;

    public Worker(TaskQueue queue, ILogger<Worker> logger)
    {
        _queue = queue;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        await foreach (var id in _queue.ReadAllAsync(ct))
        {
            _queue.Update(id, t => t.Status = "Running");
            _logger.LogInformation("Task {Id} started", id);

            try
            {
                await Task.Delay(TimeSpan.FromSeconds(10), ct);   // mock-обработка

                _queue.Update(id, t =>
                {
                    t.Status = "Done";
                    t.FinishedAt = DateTime.UtcNow;
                });
                _logger.LogInformation("Task {Id} done", id);
            }
            catch (OperationCanceledException)
            {
                _queue.Update(id, t =>
                {
                    t.Status = "Error";
                    t.ErrorMessage = "Отменено";
                    t.FinishedAt = DateTime.UtcNow;
                });
                throw;
            }
            catch (Exception ex)
            {
                _queue.Update(id, t =>
                {
                    t.Status = "Error";
                    t.ErrorMessage = ex.Message;
                    t.FinishedAt = DateTime.UtcNow;
                });
                _logger.LogError(ex, "Task {Id} failed", id);
            }
        }
    }
}