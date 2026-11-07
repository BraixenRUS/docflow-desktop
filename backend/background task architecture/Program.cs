using DocFlow.Api.Services;
using DocFlow.Api.Workers;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddSingleton<TaskQueue>();
builder.Services.AddHostedService<Worker>();   // запускает воркер при старте

var app = builder.Build();

app.MapControllers();
app.Run();