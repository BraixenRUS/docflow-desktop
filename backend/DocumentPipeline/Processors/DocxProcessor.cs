using System.Text;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using DocumentPipeline.Abstractions;

namespace DocumentPipeline.Processors;

public sealed class DocxProcessor : IDocumentProcessor
{
    public bool CanHandle(string filePath) =>
        Path.GetExtension(filePath).Equals(".docx", StringComparison.OrdinalIgnoreCase);

    public string ExtractText(string filePath)
    {
        var sb = new StringBuilder();
        using var doc = WordprocessingDocument.Open(filePath, false);
        var body = doc.MainDocumentPart?.Document?.Body;
        if (body is null) return string.Empty;

        foreach (var paragraph in body.Descendants<Paragraph>())
        {
            var text = paragraph.InnerText?.Trim();
            if (!string.IsNullOrEmpty(text))
                sb.AppendLine(text);
        }

        foreach (var table in body.Descendants<Table>())
        {
            foreach (var row in table.Descendants<TableRow>())
            {
                var cells = row.Descendants<TableCell>()
                               .Select(c => c.InnerText?.Trim() ?? string.Empty);
                sb.AppendLine(string.Join(" | ", cells));
            }
        }

        return sb.ToString();
    }
}