namespace DocFlow.Api.Models;

public class DocumentTask
{
    public Guid Id { get; set; }
    public string FileName { get; set; } = default!;
    public string Status { get; set; } = "Queued";   // Queued | Running | Done | Error
    public string? ErrorMessage { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? FinishedAt { get; set; }
}