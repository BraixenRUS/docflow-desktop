using DocumentPipeline.Abstractions;
using DocumentPipeline.Ocr;
using Microsoft.Extensions.Configuration;

var config = new ConfigurationBuilder()
    .SetBasePath(AppContext.BaseDirectory)
    .AddJsonFile("appsettings.json", optional: false)
    .Build();

var tessDataPath = Path.Combine(
    AppContext.BaseDirectory,
    config["Ocr:TessDataPath"] ?? "tessdata");

IOcrEngine ocr = config["Ocr:Backend"] switch
{
    "Paddle" => new PaddleOcrEngine(useGpu: bool.Parse(config["Ocr:UseGpu"] ?? "false")),
    _        => new TesseractOcrEngine(tessDataPath, config["Ocr:Language"] ?? "rus+eng"),
};

using var pipeline = new DocumentPipeline.Pipeline.DocumentExtractionPipeline(ocr);

var files = args.Length > 0
    ? args
    : new[] { "sample.pdf", "sample.docx", "sample.jpg", "sample.png" };

foreach (var file in files)
{
    Console.WriteLine($"=== {file} ===");
    try
    {
        var text = pipeline.Process(file);
        Console.WriteLine(text.Length > 0 ? text : "[пустой результат]");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[ОШИБКА] {ex.Message}");
    }
    Console.WriteLine();
}
