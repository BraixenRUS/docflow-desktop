using DocumentPipeline.Abstractions;
using DocumentPipeline.Processors;

namespace DocumentPipeline.Factory;

public sealed class ProcessorFactory
{
    private readonly IReadOnlyList<IDocumentProcessor> _processors;

    public ProcessorFactory(IOcrEngine ocr)
    {
        _processors = new List<IDocumentProcessor>
        {
            new PdfProcessor(ocr),
            new DocxProcessor(),
            new ImageProcessor(ocr),
            // Чтобы добавить новый формат — добавьте одну строку сюда:
            // new PptxProcessor(),
        };
    }

    public IDocumentProcessor Get(string filePath)
    {
        var processor = _processors.FirstOrDefault(p => p.CanHandle(filePath));
        return processor
            ?? throw new NotSupportedException(
                $"Нет обработчика для формата: {Path.GetExtension(filePath)}");
    }
}