namespace DocumentPipeline.Abstractions;

/// <summary>
/// Абстракция OCR-движка. Позволяет менять Tesseract на PaddleOCR
/// (или на любой другой бэкенд) без изменения обработчиков форматов.
/// </summary>
public interface IOcrEngine
{
    string RecognizeImage(string imagePath);
    string RecognizeImage(byte[] imageBytes);
}