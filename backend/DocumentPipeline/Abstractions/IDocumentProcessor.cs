namespace DocumentPipeline.Abstractions;

/// <summary>
/// Единый контракт для любого обработчика формата документа.
/// </summary>
public interface IDocumentProcessor
{
    /// <summary>Поддерживает ли процессор указанный файл.</summary>
    bool CanHandle(string filePath);

    /// <summary>Извлекает текст из файла.</summary>
    string ExtractText(string filePath);
}