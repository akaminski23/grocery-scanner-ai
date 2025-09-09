import { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw'; // Import rehypeRaw
import './App.css';
import { GoogleGenerativeAI } from '@google/generative-ai';

// --- TYPE DEFINITIONS ---
interface HistoryItem {
  id: string;
  imageSrc: string | null; // Allow imageSrc to be null to fix build error
  analysisResult: string;
  timestamp: string;
}

// --- API SETUP ---
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("VITE_GEMINI_API_KEY is not defined. Please check your .env file.");
}
const genAI = new GoogleGenerativeAI(apiKey);

// --- HELPER FUNCTIONS ---
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

const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result as string);
  reader.onerror = error => reject(error);
});

// --- MAIN APP COMPONENT ---
function App() {
  // --- STATE MANAGEMENT ---
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string>('Analysis results will appear here...');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // --- EFFECTS ---
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('groceryScannerHistory');
      if (savedHistory && savedHistory !== 'undefined') {
        const parsedHistory = JSON.parse(savedHistory);
        if (Array.isArray(parsedHistory)) {
          setHistory(parsedHistory);
        }
      }
    } catch (error) {
      console.error("Failed to load or parse history, resetting it.", error);
      localStorage.setItem('groceryScannerHistory', '[]');
    }
  }, []);

  // --- CORE FUNCTIONS ---
  const analyzeImage = async (file: File) => {
    setIsLoading(true);
    setAnalysisResult('Analyzing, please wait...');

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const imagePart = await fileToGenerativePart(file);
      const imageForStorage = await toBase64(file);

      // Final prompt with assertive instructions and formatting rules
      const prompt = `You are a world-class expert nutritionist. Your task is to analyze the food item in the image.

      **Analysis Rules:**
      1.  **Identify Foods:** State your primary identification of each food item as a fact. 
      2.  **Be Decisive and Confident:** You MUST act as an expert. DO NOT use words of uncertainty like 'probably', 'it seems', 'it might be', 'it looks like'. Present your best assessment directly and factually.
      3.  **No Doubts:** Do not express any uncertainty or mention alternative possibilities.
      4.  **Health Score:** Present the health score as: <span class="health-score">Health Score: X/10</span>. For example: <span class="health-score">Health Score: 7/10</span>.
      5.  **Suggestions:** Explain if it's a healthy choice and suggest a better alternative if applicable.
      6.  **Formatting:** Format your entire response using simple paragraphs. Use bold text for titles (e.g., **Analysis:**, **Health Assessment:**, **Better Alternative:**).
      7.  **Language:** Respond in English.`;

      const result = await model.generateContent([prompt, imagePart]);
      const response = result.response;
      const text = response.text();

      setAnalysisResult(text);

      const newHistoryItem: HistoryItem = {
        id: new Date().toISOString(),
        imageSrc: imageForStorage,
        analysisResult: text,
        timestamp: new Date().toLocaleString('pl-PL'),
      };

      setHistory(prevHistory => {
        const updatedHistory = [newHistoryItem, ...prevHistory];
        localStorage.setItem('groceryScannerHistory', JSON.stringify(updatedHistory));
        return updatedHistory;
      });

    } catch (error) {
      console.error("Error analyzing image:", error);
      setAnalysisResult('Sorry, an error occurred during analysis. Please check the console for details.');
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

  // --- RENDER ---
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
            {isLoading && <p>Analyzing, please wait...</p>}
            {!isLoading && analysisResult && <ReactMarkdown rehypePlugins={[rehypeRaw]}>{analysisResult}</ReactMarkdown>}
            {!isLoading && !analysisResult && <p>Analysis results will appear here...</p>}
          </div>
        </div>

        <div className="history-section">
          <h2>Analysis History</h2>
          {history.length > 0 ? (
            <div className="history-list">
              {history
                .filter(item => item && item.id && item.imageSrc && item.analysisResult && item.timestamp)
                .map((item) => (
                <div key={item.id} className="history-item">
                  <img src={item.imageSrc} alt="Historic analysis" />
                  <div className="history-item-content">
                    <p><strong>Date:</strong> {item.timestamp}</p>
                    <ReactMarkdown rehypePlugins={[rehypeRaw]}>{item.analysisResult.substring(0, 100)}...</ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>Your past analyses will appear here.</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;