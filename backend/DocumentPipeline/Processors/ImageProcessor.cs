using DocumentPipeline.Abstractions;

namespace DocumentPipeline.Processors;

public sealed class ImageProcessor : IDocumentProcessor
{
    private static readonly HashSet<string> SupportedExtensions =
        new(StringComparer.OrdinalIgnoreCase) { ".jpg", ".jpeg", ".png" };

    private readonly IOcrEngine _ocr;

    public ImageProcessor(IOcrEngine ocr) => _ocr = ocr;

    public bool CanHandle(string filePath) =>
        SupportedExtensions.Contains(Path.GetExtension(filePath));

    public string ExtractText(string filePath) => _ocr.RecognizeImage(filePath);
}