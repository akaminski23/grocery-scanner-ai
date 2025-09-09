import { useState, useRef } from 'react';
import './App.css';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw'; // Import rehypeRaw


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
      // Final, most assertive prompt
      const prompt = `You are a world-class expert nutritionist. Your task is to analyze the food in the image with maximum confidence.

      **Analysis Rules:**
      1.  **Identify Foods:** State your primary identification of each food item as a fact. 
      2.  **Be Decisive and Confident:** You MUST act as an expert. DO NOT use words of uncertainty like 'probably', 'it seems', 'it might be', 'it looks like'. Present your best assessment directly and factually.
      3.  **No Doubts:** Do not express any uncertainty or mention alternative possibilities. Make your best determination and state it as fact.
      4.  **Health Score:** Provide a health score from 1 to 10 (1 being very unhealthy, 10 being extremely healthy). Present it as: <span class="health-score">Health Score: X/10</span>. Briefly explain your score.
      5.  **Suggestions:** Explain if it's a healthy choice and suggest a better alternative if applicable.
      6.  **Formatting:** Format your entire response using simple paragraphs. Use bold text for titles (e.g., **Analysis:**, **Health Assessment:**, **Suggestions:**).
      7.  **Language:** Respond in English.`;

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
            capture="environment"
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
            <ReactMarkdown rehypePlugins={[rehypeRaw]}>{analysisResult}</ReactMarkdown>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;