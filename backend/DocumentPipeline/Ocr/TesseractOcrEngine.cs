using DocumentPipeline.Abstractions;
using Tesseract;

namespace DocumentPipeline.Ocr;

public sealed class TesseractOcrEngine : IOcrEngine, IDisposable
{
    private readonly TesseractEngine _engine;

    public TesseractOcrEngine(string tessDataPath, string lang = "rus+eng")
    {
        if (!Directory.Exists(tessDataPath))
            throw new DirectoryNotFoundException($"Папка tessdata не найдена: {tessDataPath}");

        _engine = new TesseractEngine(tessDataPath, lang, EngineMode.Default);
    }

    public string RecognizeImage(string imagePath)
    {
        using var img = Pix.LoadFromFile(imagePath);
        using var page = _engine.Process(img);
        return page.GetText();
    }

    public string RecognizeImage(byte[] imageBytes)
    {
        using var img = Pix.LoadFromMemory(imageBytes);
        using var page = _engine.Process(img);
        return page.GetText();
    }

    public void Dispose() => _engine.Dispose();
}