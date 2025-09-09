import { useState, useRef } from 'react';
import './App.css';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown'; // Import ReactMarkdown

// Get the API key from the .env file
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("VITE_GEMINI_API_KEY is not defined. Please check your .env file.");
}

const genAI = new GoogleGenerativeAI(apiKey);

async function fileToGenerativePart(file: File) {
  const base64EncodedDataPromise = new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      data: await base64EncodedDataPromise as string,
      mimeType: file.type,
    },
  };
}

function App() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string>('Analysis results will appear here...');
  const [isLoading, setIsLoading] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const analyzeImage = async (file: File) => {
    setIsLoading(true);
    setAnalysisResult('Analyzing, please wait...');

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const imagePart = await fileToGenerativePart(file);
      // Updated prompt for English and specific formatting
      const prompt = `You are an expert nutritionist. Analyze the food item in the image and provide a simple, clear nutritional analysis. Explain if it's a healthy choice and suggest a better alternative if applicable. 

      **IMPORTANT: Respond in English.**
      **Formatting:** Use bold text for titles (e.g., **Analysis:**, **Health Assessment:**, **Better Alternative:**). Do NOT use Markdown headings (#) or bullet points (*) for lists. Use simple paragraphs.`;

      const result = await model.generateContent([prompt, imagePart]);
      const response = result.response;
      const text = response.text();
      setAnalysisResult(text);
    } catch (error) {
      console.error("Error analyzing image:", error);
      setAnalysisResult('Sorry, an error occurred during analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setImageSrc(imageUrl);
      analyzeImage(file);
    }
  };

  const triggerCamera = () => {
    cameraInputRef.current?.click();
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Grocery Scanner AI</h1>
        <p>Take a picture of a product to get an AI-powered analysis.</p>
      </header>
      <main>
        <div className="camera-container">
          <button onClick={triggerCamera} className="scan-button" disabled={isLoading}>
            {isLoading ? 'Analyzing...' : 'Scan Product'}
          </button>
          <input
            type="file"
            accept="image/*"
            ref={cameraInputRef}
            onChange={handleImageCapture}
            style={{ display: 'none' }}
            disabled={isLoading}
          />
        </div>
        <div className="results-container">
          <div className="image-preview">
            {imageSrc ? (
              <img src={imageSrc} alt="Captured product" />
            ) : (
              <div className="placeholder">Image preview will appear here</div>
            )}
          </div>
          <div className="analysis-output">
            <h2>AI Analysis</h2>
            <ReactMarkdown>{analysisResult}</ReactMarkdown>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
