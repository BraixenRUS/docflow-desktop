using DocumentPipeline.Abstractions;
using DocumentPipeline.Factory;

namespace DocumentPipeline.Pipeline;

public sealed class DocumentExtractionPipeline : IDisposable
{
    private readonly ProcessorFactory _factory;
    private readonly IOcrEngine _ocr;

    public DocumentExtractionPipeline(IOcrEngine ocr)
    {
        _ocr = ocr;
        _factory = new ProcessorFactory(ocr);
    }

    public string Process(string filePath)
    {
        if (!File.Exists(filePath))
            throw new FileNotFoundException("Файл не найден", filePath);

        return _factory.Get(filePath).ExtractText(filePath);
    }

    public void Dispose()
    {
        if (_ocr is IDisposable disposable) disposable.Dispose();
    }
}