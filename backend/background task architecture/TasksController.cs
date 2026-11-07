using DocFlow.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace DocFlow.Api.Controllers;

[ApiController]
[Route("api/tasks")]
public class TasksController : ControllerBase
{
    private readonly TaskQueue _queue;
    public TasksController(TaskQueue queue) => _queue = queue;

    // POST /api/tasks — загрузка, постановка в очередь
    [HttpPost]
    public IActionResult Create(IFormFile file)
    {
        var task = _queue.Create(file.FileName);
        return Accepted(new { task.Id, task.Status });
    }

    // GET /api/tasks/{id} — актуальный статус
    [HttpGet("{id:guid}")]
    public IActionResult Get(Guid id)
    {
        var task = _queue.Get(id);
        if (task is null) return NotFound();
        return Ok(task);
    }

    // GET /api/tasks — список (для отладки)
    [HttpGet]
    public IActionResult List() => Ok(_queue.All());
}