using DocumentPipeline.Abstractions;
using PaddleOCRSharp;

namespace DocumentPipeline.Ocr;

public sealed class PaddleOcrEngine : IOcrEngine, IDisposable
{
    private readonly PaddleOCREngine _engine;

    public PaddleOcrEngine(bool useGpu = true)
    {
        var config = new OCRModelConfig();
        var parameter = new OCRParameter
        {
            use_gpu = useGpu,
            enable_mkldnn = !useGpu,
            cpu_math_library_num_threads = Environment.ProcessorCount,
        };
        _engine = new PaddleOCREngine(config, parameter);
    }

    public string RecognizeImage(string imagePath)
    {
        var result = _engine.DetectText(imagePath);
        return result?.Text ?? string.Empty;
    }

    public string RecognizeImage(byte[] imageBytes)
    {
        var result = _engine.DetectText(imageBytes);
        return result?.Text ?? string.Empty;
    }

    public void Dispose() => _engine?.Dispose();
}