using System.Text;
using DocumentPipeline.Abstractions;
using PDFtoImage;
using SkiaSharp;
using UglyToad.PdfPig;

namespace DocumentPipeline.Processors;

public sealed class PdfProcessor : IDocumentProcessor
{
    private const int MinTextLayerLength = 20;
    private readonly IOcrEngine _ocr;
    private readonly int _ocrDpi;

    public PdfProcessor(IOcrEngine ocr, int ocrDpi = 200)
    {
        _ocr = ocr;
        _ocrDpi = ocrDpi;
    }

    public bool CanHandle(string filePath) =>
        Path.GetExtension(filePath).Equals(".pdf", StringComparison.OrdinalIgnoreCase);

    public string ExtractText(string filePath)
    {
        // Шаг 1. Достаём текстовый слой постранично.
        var pageTexts = new List<string>();
        using (var doc = PdfDocument.Open(filePath))
        {
            foreach (var page in doc.GetPages())
                pageTexts.Add(page.Text?.Trim() ?? string.Empty);
        }

        // Быстрый путь: во всех страницах есть текстовый слой.
        if (pageTexts.Count > 0 && pageTexts.All(t => t.Length > MinTextLayerLength))
            return string.Join("\n\n", pageTexts);

        // Шаг 2. Смешанный/сканированный PDF: где есть текст — берём напрямую,
        // иначе рендерим страницу и отдаём в OCR.
        var sb = new StringBuilder();
        using var fs = File.OpenRead(filePath);
        var pageIndex = 0;

        foreach (var bitmap in Conversion.ToImages(fs, options: new RenderOptions { Dpi = _ocrDpi }))
        {
            using (bitmap)
            {
                if (pageIndex < pageTexts.Count && pageTexts[pageIndex].Length > MinTextLayerLength)
                {
                    sb.AppendLine(pageTexts[pageIndex]);
                }
                else
                {
                    using var image = SKImage.FromBitmap(bitmap);
                    using var data = image.Encode(SKEncodedImageFormat.Png, 100);
                    sb.AppendLine(_ocr.RecognizeImage(data.ToArray()));
                }
            }
            pageIndex++;
        }

        return sb.ToString();
    }
}