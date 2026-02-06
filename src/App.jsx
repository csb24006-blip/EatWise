import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, ChefHat, Activity, Info, X, Loader2, Sparkles, Leaf, PieChart, AlertCircle, ShieldCheck, AlertTriangle, Scale, EyeOff, Heart } from 'lucide-react';

// API//
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const fetchWithRetry = async (url, options, retries = 5, backoff = 1000) => {
  try {
    const response = await fetch(url, options);
    if ((response.status === 429 || response.status >= 500) && retries > 0) {
      await new Promise(resolve => setTimeout(resolve, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    return response;
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    throw error;
  }
};

/**
 * Food Analysis Logic - "Co-Pilot" Vision
 */
const analyzeFoodImage = async (base64Image, userMessage) => {
  const prompt = `
    You are a world-class AI food safety expert, nutritionist, and public health inspector.
    
    MISSION: Act as an AI-native consumer health co-pilot named EATWISE. Do not just show tables; explain what actually matters.
    Ingest the image and user intent: "${userMessage || "General Analysis"}"

    TASK:
    1. Identify food items.
    2. Infer user intent (health concerns, dietary preferences, risk sensitivity).
    3. Translate scientific data into human-level insights.
    4. Highlight unknowns clearly—if you are unsure, say so.
    5. Translate ingredient weights into visual measurements (e.g., "3 tablespoons of sugar" instead of "25g").

    Return ONLY a valid JSON object:
    {
      "food_items": ["item1", "item2"],
      "dishName": "Primary name for the UI",
      "freshness": "Very Fresh / Fresh / Questionable / Unsafe",
      "risk_level": "low | medium | high",
      "confidence_level": "0-100%",
      "explanation": "3-4 sentences of human-level insight.",
      "visual_translation": {
        "title": "Visual Breakdown",
        "description": "Simple visual measurement"
      },
      "health_risks": ["Risk warning"],
      "recommendations": ["Storage tips"],
      "safer_alternatives": ["Better options"],
      "calories": 0,
      "macros": { "protein": "0g", "carbs": "0g", "fats": "0g" },
      "healthScore": 5
    }

    RULES:
    - Choose safety over optimism.
    - No emojis. No markdown.
    - If unsure, clearly state the unknowns.
  `;

  try {
    const response = await fetchWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inlineData: { mimeType: "image/png", data: base64Image } }
            ]
          }],
          generationConfig: { responseMimeType: "application/json" }
        })
      }
    );

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    let text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("No response from AI.");

    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("Analysis Failed:", error);
    return { error: error.message.includes("quota") ? "EATWISE co-pilot is busy. Retrying..." : error.message };
  }
};

const generateRecipe = async (dishName) => {
  //  Explicitly asking for 'title' and 'steps' array
  const prompt = `
    Create a healthy recipe for "${dishName}".
    
    Return ONLY a valid JSON object with this exact structure:
    {
      "title": "Recipe Name",
      "steps": [
        "Step 1 instruction...",
        "Step 2 instruction...",
        "Step 3 instruction..."
      ]
    }
    
    Do not include markdown formatting or conversational text.
  `;
  
  try {
    const response = await fetchWithRetry(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      }
    );
    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0].content) {
      throw new Error("Invalid API response");
    }

    let text = data.candidates[0].content.parts[0].text;
    // Clean up potential markdown code blocks
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(text);
  } catch (error) { 
    console.error("Recipe Error:", error);
    // Return a fallback structure so the UI doesn't crash
    return { 
      title: "Recipe Unavailable", 
      steps: ["Sorry, we couldn't generate a recipe for this item right now."] 
    }; 
  }
};

// --- COMPONENTS ---

const Navigation = ({ activeTab, setActiveTab }) => (
  <nav className="fixed bottom-0 w-full bg-white/90 backdrop-blur-md border-t border-slate-200 p-4 pb-6 flex justify-around items-center z-50 md:sticky md:top-0 md:border-b md:border-t-0 md:h-20 md:pb-4">
    <button onClick={() => setActiveTab('scan')} className={`flex flex-col items-center gap-1 ${activeTab === 'scan' ? 'text-emerald-600' : 'text-slate-400'}`}>
      <Camera size={24} />
      <span className="text-xs font-medium uppercase font-bold tracking-tighter">Co-Pilot</span>
    </button>
    <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center gap-1 ${activeTab === 'history' ? 'text-emerald-600' : 'text-slate-400'}`}>
      <Activity size={24} />
      <span className="text-xs font-medium uppercase font-bold tracking-tighter">Insights</span>
    </button>
    <button onClick={() => setActiveTab('chef')} className={`flex flex-col items-center gap-1 ${activeTab === 'chef' ? 'text-emerald-600' : 'text-slate-400'}`}>
      <ChefHat size={24} />
      <span className="text-xs font-medium uppercase font-bold tracking-tighter">Chef AI</span>
    </button>
  </nav>
);

const MacroBadge = ({ label, value, color }) => (
  <div className="flex flex-col items-center bg-slate-50 p-2 rounded-xl flex-1 border border-slate-100">
    <span className={`text-[10px] font-black uppercase tracking-widest ${color}`}>{label}</span>
    <span className="text-sm font-bold text-slate-800">{value ?? '-'}</span>
  </div>
);

const AnalysisView = ({ result, image, onReset, onGenerateRecipe }) => {
  const [recipeLoading, setRecipeLoading] = useState(false);
  
  if (!result || result.error) return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4"><AlertCircle size={32} /></div>
      <h3 className="text-xl font-bold mb-2">Technical Pause</h3>
      <p className="text-slate-500 mb-6 text-sm">{result?.error || "Unknown Error Occurred"}</p>
      <button onClick={onReset} className="px-6 py-3 bg-slate-900 text-white rounded-xl">Retry Scan</button>
    </div>
  );

  // --- Gauge Logic ---
  const confidenceValue = parseInt(result.confidence_level) || 0;
  // Rotation: 0% = -90deg, 100% = 90deg
  const needleRotation = (confidenceValue / 100) * 180 - 90;
  const gaugeColor = confidenceValue > 80 ? '#10b981' : confidenceValue > 50 ? '#f59e0b' : '#ef4444';

  // Calculate health score visual
  const score = result.healthScore ?? 5;
  const scoreColor = score > 7 ? 'bg-emerald-500' : score > 4 ? 'bg-amber-500' : 'bg-rose-500';

  return (
    <div className="pb-24 animate-in slide-in-from-bottom-4 duration-500 h-full overflow-y-auto bg-slate-50">
      <div className="relative h-72 w-full">
        <img src={image} alt="Food" className="w-full h-full object-cover" />
        <button onClick={onReset} className="absolute top-4 left-4 bg-black/50 text-white p-2 rounded-full backdrop-blur-md"><X size={20} /></button>
        
        {/* Overlay Info with Gauge */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent p-6 pt-24 text-white">
          <div className="flex items-end justify-between gap-2">
            <div>
              <span className="px-2 py-0.5 bg-emerald-500 text-[10px] font-black uppercase rounded-md tracking-widest block w-fit mb-2">
                Co-Pilot Analysis
              </span>
              <h1 className="text-3xl font-black leading-tight max-w-[200px]">{result.dishName ?? 'Food Items'}</h1>
            </div>

            {/* --- Speedometer Component --- */}
            <div className="flex flex-col items-center mb-1">
              <div className="relative w-20 h-10 overflow-hidden">
                {/* Background Arc */}
                <div className="w-20 h-20 rounded-full border-[6px] border-slate-600/50" />
                
                {/* Active Colored Progress Arc with Masking */}
                <div 
                  className="absolute top-0 left-0 w-20 h-20 rounded-full border-[6px] border-transparent transition-all duration-1000 ease-out"
                  style={{
                    background: `conic-gradient(from -90deg, ${gaugeColor} ${confidenceValue}%, transparent 0)`,
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'destination-out',
                    maskComposite: 'exclude',
                  }}
                />

                {/* Needle */}
                <div 
                  className="absolute bottom-0 left-1/2 w-0.5 h-9 bg-white origin-bottom transition-transform duration-[1500ms] cubic-bezier(0.34, 1.56, 0.64, 1)"
                  style={{ transform: `translateX(-50%) rotate(${needleRotation}deg)` }}
                />
                
                {/* Center Pivot Point */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full border border-slate-900" />
              </div>
              <span className="text-[9px] font-bold mt-1 uppercase tracking-tighter opacity-90">
                {confidenceValue}% Confidence
              </span>
            </div>
            {/* ------------------------- */}
          </div>
        </div>
      </div>

      <div className="p-4 -mt-4 bg-white rounded-t-3xl relative z-10 space-y-4 shadow-xl">
        {/* Health Score Progress Bar */}
        <div className="bg-white border-2 border-slate-100 rounded-2xl p-4 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-black text-slate-900 flex items-center gap-2 text-xs uppercase tracking-widest">
              <Heart size={16} className="text-rose-500 fill-rose-500" /> EATWISE Health Score
            </h3>
            <span className="text-lg font-black text-slate-800">{score}/10</span>
          </div>
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ease-out ${scoreColor}`}
              style={{ width: `${score * 10}%` }}
            />
          </div>
        </div>

        {/* Freshness & Risk */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
             <h4 className="font-black text-slate-400 text-[10px] uppercase mb-1 flex items-center gap-1"><ShieldCheck size={12}/> Freshness</h4>
             <p className="font-bold text-slate-800 text-sm">{result.freshness ?? 'Not Assessed'}</p>
          </div>
          <div className={`p-3 rounded-2xl border ${result.risk_level?.toLowerCase().includes('high') ? 'bg-red-50 border-red-100 text-red-700' : 'bg-slate-50 border-slate-100'}`}>
             <h4 className="font-black text-[10px] uppercase mb-1 flex items-center gap-1"><AlertTriangle size={12}/> Risk Level</h4>
             <p className="font-bold text-sm uppercase">{result.risk_level ?? 'Unknown'}</p>
          </div>
        </div>

        {/* Co-Pilot Explanation */}
        <div className="bg-white border-2 border-slate-100 rounded-2xl p-4">
          <h3 className="font-black text-slate-900 flex items-center gap-2 mb-2 text-sm uppercase tracking-tight">
            <Sparkles size={18} className="text-amber-500" /> Human Insight
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">{result.explanation ?? 'No insight available for this scan.'}</p>
        </div>

        {/* Visual Translation Box */}
        {result.visual_translation && (
          <div className="bg-emerald-900 text-emerald-50 rounded-2xl p-4 shadow-lg shadow-emerald-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Scale size={64} /></div>
            <h3 className="font-black text-xs uppercase mb-1 flex items-center gap-2">
              <Scale size={16} /> {result.visual_translation.title ?? 'Visual Breakdown'}
            </h3>
            <p className="text-lg font-bold leading-tight">{result.visual_translation.description ?? '-'}</p>
          </div>
        )}

        {/* Macros */}
        <div className="flex gap-2">
          <MacroBadge label="Cal" value={result.calories} color="text-slate-400" />
          <MacroBadge label="Pro" value={result?.macros?.protein} color="text-emerald-600" />
          <MacroBadge label="Carb" value={result?.macros?.carbs} color="text-emerald-600" />
          <MacroBadge label="Fat" value={result?.macros?.fats} color="text-emerald-600" />
        </div>

        {/* Risks & Alternatives */}
        <div className="grid grid-cols-1 gap-4">
           {result.health_risks?.length > 0 && (
             <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100">
                <h3 className="font-black text-rose-900 mb-2 text-xs uppercase flex items-center gap-2"><AlertCircle size={16} /> Health Warnings</h3>
                <ul className="text-rose-800 text-xs space-y-1 list-disc list-inside font-bold">
                  {result.health_risks.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
             </div>
           )}

           {result.safer_alternatives?.length > 0 && (
             <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                <h3 className="font-black text-indigo-900 mb-2 text-xs uppercase flex items-center gap-2"><Leaf size={16} /> Better Alternatives</h3>
                <div className="flex flex-wrap gap-2">
                  {result.safer_alternatives?.map((a, i) => <span key={i} className="px-3 py-1 bg-white text-indigo-700 rounded-lg text-[10px] font-black border border-indigo-200">{a}</span>)}
                </div>
             </div>
           )}
        </div>

        <button 
          onClick={async () => {
            setRecipeLoading(true);
            await onGenerateRecipe(result.dishName);
            setRecipeLoading(false);
          }} 
          disabled={recipeLoading} 
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2"
        >
          {recipeLoading ? <Loader2 className="animate-spin" /> : <ChefHat />} Generate Recipe
        </button>
      </div>
    </div>
  );
};

const Scanner = ({ onScanComplete }) => {
  const [loading, setLoading] = useState(false);
  const [userText, setUserText] = useState("");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const processAnalysis = async (base64, dataUri) => {
    setLoading(true);
    const analysis = await analyzeFoodImage(base64, userText);
    setLoading(false);
    onScanComplete(dataUri, analysis);
  };

  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Please use 'Analyze Gallery'. Camera requires HTTPS and local permissions.");
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    const dataUri = canvas.toDataURL('image/jpeg');
    streamRef.current.getTracks().forEach(t => t.stop());
    setIsCameraActive(false);
    processAnalysis(dataUri.split(',')[1], dataUri);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center p-8">
      <div className="w-24 h-24 mb-6 relative">
        <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 animate-pulse"></div>
        <Loader2 size={96} className="text-emerald-500 animate-spin relative z-10" />
      </div>
      <h2 className="text-2xl font-black uppercase tracking-tighter">Consulting EATWISE...</h2>
      <p className="text-slate-500 text-sm mt-2">Translating scientific data into human insights</p>
    </div>
  );

  if (isCameraActive) return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <video ref={videoRef} autoPlay playsInline className="flex-1 object-cover" />
      <div className="absolute bottom-10 inset-x-0 flex justify-center gap-8 px-8">
        <button onClick={() => setIsCameraActive(false)} className="p-4 bg-white/20 rounded-full text-white backdrop-blur-xl"><X /></button>
        <button onClick={capturePhoto} className="w-20 h-20 bg-white rounded-full border-8 border-emerald-500 shadow-2xl" />
      </div>
    </div>
  );

  return (
    <div className="p-6 pt-12 flex flex-col h-full bg-white">
      <div className="mb-10">
        <h1 className="text-5xl font-black tracking-tighter italic leading-none">EATWISE<span className="text-emerald-500">.</span></h1>
        <p className="text-slate-400 font-bold uppercase text-[10px] mt-2 tracking-[0.2em]">Consumer Health Co-Pilot v1.1</p>
      </div>

      <div className="mb-8">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">What's your concern?</label>
        <textarea 
          value={userText} 
          onChange={(e) => setUserText(e.target.value)} 
          placeholder="I'm feeling bloated... Is this safe?" 
          className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[30px] text-sm font-medium focus:border-emerald-500 focus:bg-white transition-all outline-none shadow-inner" 
          rows={3} 
        />
      </div>

      <div className="flex-1 grid grid-cols-1 gap-4">
        <button onClick={startCamera} className="bg-emerald-500 text-white rounded-[40px] flex flex-col items-center justify-center gap-2 shadow-2xl shadow-emerald-200 group active:scale-95 transition-transform">
          <Camera size={40} className="group-hover:scale-110 transition-transform" /> 
          <span className="font-black uppercase tracking-widest text-xs">Live Health Scan</span>
        </button>
        <button onClick={() => document.getElementById('fileIn').click()} className="bg-slate-900 text-white rounded-[40px] flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform">
          <Upload size={32} /> 
          <span className="font-black uppercase tracking-widest text-xs">Analyze Gallery</span>
          <input id="fileIn" type="file" className="hidden" onChange={(e) => {
            const r = new FileReader();
            if (e.target.files[0]) {
              r.onload = (ev) => processAnalysis(ev.target.result.split(',')[1], ev.target.result);
              r.readAsDataURL(e.target.files[0]);
            }
          }} />
        </button>
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('scan');
  const [scanResult, setScanResult] = useState(null);
  const [showRecipe, setShowRecipe] = useState(null);

  const handleScanComplete = (image, data) => {
    setScanResult({ image, data });
  };

  const handleGenerateRecipe = async (dishName) => {
    const recipe = await generateRecipe(dishName);
    setShowRecipe(recipe);
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans flex items-center justify-center p-0 md:p-6">
      <div className="max-w-md w-full bg-white min-h-screen md:min-h-[850px] md:max-h-[900px] md:rounded-[60px] shadow-2xl relative overflow-hidden flex flex-col border-[8px] border-slate-900">
        <main className="flex-1 overflow-y-auto scrollbar-hide">
          {activeTab === 'scan' && (!scanResult ? (
            <Scanner onScanComplete={handleScanComplete} />
          ) : (
            <AnalysisView 
              image={scanResult.image} 
              result={scanResult.data} 
              onReset={() => setScanResult(null)} 
              onGenerateRecipe={handleGenerateRecipe} 
            />
          ))}
          {activeTab !== 'scan' && (
            <div className="p-12 text-center mt-20">
              <Activity size={48} className="mx-auto mb-4 text-slate-200" />
              <h3 className="font-black uppercase text-slate-300">Intelligent Insights Coming Soon</h3>
            </div>
          )}
        </main>
        {showRecipe && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-end md:items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-[40px] p-8 relative max-h-[80vh] overflow-y-auto">
              <button onClick={() => setShowRecipe(null)} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full"><X size={24}/></button>
              <h2 className="text-3xl font-black italic mb-6">{showRecipe.title ?? 'Healthy Recipe'}</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-black text-xs uppercase text-emerald-500 mb-4 tracking-widest">Co-Pilot Steps</h3>
                  <div className="space-y-4">
                    {showRecipe.steps?.map((s, i) => (
                      <p key={i} className="text-slate-600 text-sm font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <span className="font-black mr-2 text-emerald-500">{i+1}.</span> {s}
                      </p>
                    ))}
                    {!showRecipe.steps && <p className="text-slate-400">Unable to generate steps for this dish.</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {!scanResult && <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />}
      </div>
    </div>
  );
}