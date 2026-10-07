
import React, { useState, useEffect, useRef } from 'react';
/* Added Type to @google/genai import as per guidelines for tool definitions */
import { GoogleGenAI, LiveServerMessage, Modality, Type } from '@google/genai';
/* Removed Type from local types import as it is not defined there */
import { Exercise, WorkoutBlock, Microcycle, Mesocycle, Macrocycle, BlockType } from '../types';

// Audio Utility Functions as per Guidelines
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createBlob(data: Float32Array): { data: string; mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

interface VictorLiveCoachProps {
  onSaveExercise: (ex: Exercise) => void;
  onSaveBlock: (block: any) => void;
  onSaveMicrocycle: (cycle: Microcycle) => void;
  onSaveMesocycle: (meso: Mesocycle) => void;
  onSaveMacrocycle: (macro: Macrocycle) => void;
}

export const VictorLiveCoach: React.FC<VictorLiveCoachProps> = ({
  onSaveExercise,
  onSaveBlock,
  onSaveMicrocycle,
  onSaveMesocycle,
  onSaveMacrocycle
}) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState<{ user: string; victor: string }[]>([]);
  const [currentVictorText, setCurrentVictorText] = useState('');
  const [currentUserText, setCurrentUserText] = useState('');
  const [drafts, setDrafts] = useState<any[]>([]);
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsActive(false);
    setIsConnecting(false);
  };

  const startSession = async () => {
    setIsConnecting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = inputCtx.createMediaStreamSource(stream);
      const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          systemInstruction: `You are Victor, an elite Strength & Conditioning Architect and Classical Pilates Master. 
          You help users develop technical drills, training blocks, and full periodization cycles (Micro, Meso, Macro). 
          When you draft an object, use your tools. Be technical, authoritative, yet encouraging. 
          Explain the biomechanical reasoning for your choices. 
          Use 'draftExercise' for individual drills.
          Use 'draftBlock' for supersets or circuits.
          Use 'draftMicrocycle' for weekly plans.`,
          tools: [{
            functionDeclarations: [
              {
                name: 'draftExercise',
                description: 'Draft a technical training drill/exercise.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    primaryMuscle: { type: Type.STRING },
                    equipment: { type: Type.STRING },
                    difficulty: { type: Type.STRING, enum: ['Beginner', 'Intermediate', 'Advanced'] },
                    description: { type: Type.STRING },
                    instructions: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ['name', 'primaryMuscle', 'instructions']
                }
              },
              {
                name: 'draftBlock',
                description: 'Draft a workout block (Superset, Circuit, or Straight sets).',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    type: { type: Type.STRING, enum: ['Straight', 'Superset', 'Circuit'] },
                    exerciseNames: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ['name', 'type', 'exerciseNames']
                }
              }
            ]
          }]
        },
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsActive(true);
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Transcription
            if (message.serverContent?.outputTranscription) {
              setCurrentVictorText(prev => prev + message.serverContent!.outputTranscription!.text);
            }
            if (message.serverContent?.inputTranscription) {
              setCurrentUserText(prev => prev + message.serverContent!.inputTranscription!.text);
            }
            if (message.serverContent?.turnComplete) {
              setTranscript(prev => [...prev, { user: currentUserText, victor: currentVictorText }]);
              setCurrentUserText('');
              setCurrentVictorText('');
            }

            // Handle Tools
            if (message.toolCall) {
              for (const fc of message.toolCall.functionCalls) {
                setDrafts(prev => [...prev, { type: fc.name, data: fc.args, id: Math.random().toString(36).substr(2, 9) }]);
                sessionPromise.then(s => s.sendToolResponse({
                  functionResponses: { id: fc.id, name: fc.name, response: { status: 'staged_in_ui' } }
                }));
              }
            }

            // Handle Audio
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), outputCtx, 24000, 1);
              const audioSource = outputCtx.createBufferSource();
              audioSource.buffer = buffer;
              audioSource.connect(outputCtx.destination);
              audioSource.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(audioSource);
              audioSource.onended = () => sourcesRef.current.delete(audioSource);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
            }
          },
          onclose: () => stopSession(),
          onerror: (e) => console.error('Live API Error:', e)
        }
      });

      scriptProcessor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        sessionPromise.then(s => s.sendRealtimeInput({ media: createBlob(inputData) }));
      };

      sessionRef.current = await sessionPromise;
    } catch (e) {
      console.error(e);
      setIsConnecting(false);
      alert('Failed to establish neural uplink.');
    }
  };

  const commitDraft = (draft: any) => {
    if (draft.type === 'draftExercise') {
      onSaveExercise({ ...draft.data, id: draft.id, category: 'Strength', association: 'Traditional', secondaryMuscles: [], movementPattern: 'Squat', createdAt: Date.now() });
    }
    setDrafts(prev => prev.filter(d => d.id !== draft.id));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
      {/* Interaction Side */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[500px]">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
          
          {!isActive && !isConnecting ? (
            <div className="text-center space-y-8">
              <div className="w-32 h-32 bg-blue-600/10 border-2 border-blue-500/20 rounded-full flex items-center justify-center mx-auto group cursor-pointer hover:border-blue-500/50 transition-all" onClick={startSession}>
                <svg className="w-12 h-12 text-blue-500 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
              </div>
              <div>
                <h3 className="text-3xl font-black italic uppercase text-white tracking-tighter mb-2">Initialize Victor Uplink</h3>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Real-time voice-to-protocol development</p>
              </div>
              <button onClick={startSession} className="px-12 py-5 bg-blue-600 text-white font-black uppercase italic rounded-2xl shadow-xl shadow-blue-600/20 hover:bg-blue-500 transition-all tracking-widest text-xs">Establish Link</button>
            </div>
          ) : isConnecting ? (
            <div className="text-center space-y-6">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-blue-400 font-black uppercase text-xs tracking-[0.3em] animate-pulse">Syncing Neural Nodes...</p>
            </div>
          ) : (
            <div className="w-full flex flex-col h-full space-y-8">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Link Operational</span>
                </div>
                <button onClick={stopSession} className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:text-red-400 transition-colors">Terminate Link</button>
              </div>

              {/* Voice Visualizer Mock */}
              <div className="flex-1 flex items-center justify-center">
                <div className="relative w-48 h-48">
                   <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
                   <div className="absolute inset-4 border-2 border-blue-500/30 rounded-full animate-[ping_3s_linear_infinite]"></div>
                   <div className="absolute inset-8 border-2 border-indigo-500/40 rounded-full animate-[ping_2s_linear_infinite]"></div>
                   <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-blue-600 rounded-full shadow-[0_0_50px_rgba(59,130,246,0.8)] flex items-center justify-center">
                        <span className="text-white font-black italic text-2xl">V</span>
                      </div>
                   </div>
                </div>
              </div>

              <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-6 min-h-[120px] max-h-[200px] overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                  {transcript.map((t, i) => (
                    <div key={i} className="space-y-1">
                      <p className="text-[9px] font-black text-slate-500 uppercase">Coach Victor</p>
                      <p className="text-sm text-slate-300 italic">"{t.victor}"</p>
                    </div>
                  ))}
                  {currentVictorText && (
                    <div className="space-y-1">
                      <p className="text-[9px] font-black text-blue-500 uppercase">Coach Victor <span className="animate-pulse">...</span></p>
                      <p className="text-sm text-white italic">"{currentVictorText}"</p>
                    </div>
                  )}
                  {currentUserText && (
                    <div className="space-y-1 text-right">
                      <p className="text-[9px] font-black text-slate-600 uppercase">Intercepting Voice...</p>
                      <p className="text-sm text-slate-400 italic">"{currentUserText}"</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Drafts Sidebar */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-8 shadow-2xl h-full flex flex-col">
          <h3 className="text-xl font-black italic uppercase text-white tracking-tighter mb-8 flex items-center gap-3">
             <span className="w-2 h-6 bg-indigo-600 rounded-full"></span>
             Tactical Staging Area
          </h3>

          <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            {drafts.map(draft => (
              <div key={draft.id} className="bg-slate-850 border border-slate-700 p-6 rounded-[2rem] space-y-4 animate-in slide-in-from-right-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[8px] font-black bg-indigo-600 text-white px-2 py-0.5 rounded uppercase tracking-widest">{draft.type === 'draftExercise' ? 'Drill' : 'Block'} Draft</span>
                    <h4 className="text-lg font-black uppercase text-white mt-1 italic">{draft.data.name}</h4>
                  </div>
                  <button onClick={() => setDrafts(prev => prev.filter(d => d.id !== draft.id))} className="text-slate-600 hover:text-red-500">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                <div className="space-y-2">
                   <p className="text-[10px] text-slate-400 leading-relaxed italic">{draft.data.description}</p>
                   {draft.data.instructions && (
                     <div className="space-y-1">
                        {draft.data.instructions.slice(0, 2).map((ins: string, idx: number) => (
                          <p key={idx} className="text-[9px] text-slate-500">• {ins}</p>
                        ))}
                     </div>
                   )}
                </div>

                <button 
                  onClick={() => commitDraft(draft)}
                  className="w-full py-3 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white font-black uppercase italic rounded-xl transition-all text-[9px] tracking-widest border border-indigo-500/20"
                >
                  Commit to Vault
                </button>
              </div>
            ))}

            {drafts.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full opacity-20 text-center py-20">
                <svg className="w-16 h-16 mb-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                <p className="text-xs font-black uppercase tracking-widest text-slate-600">No objects currently staged.<br/>Speak to Victor to begin synthesis.</p>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800">
             <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center font-black text-slate-700">?</div>
                <div>
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Instruction</p>
                   <p className="text-[10px] text-slate-600 italic">"Victor, let's design a new plyometric drill for Sarah's vertical jump."</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
