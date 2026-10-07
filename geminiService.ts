import { GoogleGenAI, Type } from "@google/genai";
import { AIRecommendation, Workout, Exercise, EquipmentPiece, QuizQuestion } from "./types";

// Note: Guideline recommends creating a new GoogleGenAI instance right before making an API call 
// to ensure the most up-to-date API key is used, especially for models like gemini-3-pro-image-preview.

export const generateExerciseProfile = async (name: string): Promise<Partial<Exercise>> => {
  /* Fix: Instantiate GoogleGenAI inside function for fresh API key context */
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Architect a professional athletic training drill for: "${name}". 
               Provide a complete biomechanical profile, procedural execution steps, and a concise technical description highlighting the primary benefits and tactical purpose for elite performance.`,
    config: {
      systemInstruction: "You are Victor, an elite S&C Specialist and Classical Pilates Master. Generate highly technical, science-backed exercise data in JSON format. If the exercise is Pilates-based, emphasize spinal articulation, spring-as-feedback, and the specific apparatus order. Classify by association: Pilates, VBT, Calisthenics, Traditional, Olympic, Plyometric, Conjugate Strength, Complex Training, French Contrast, Dog Crap Training, Bodybuilding, HiiT Training, or HIT Training. The 'description' property should specifically summarize the exercise's physiological benefits and its purpose in a high-performance program.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING, description: 'Strength, Hypertrophy, Power, Endurance, or Mobility' },
          association: { type: Type.STRING, description: 'Pilates, VBT, Calisthenics, Traditional, Olympic, Plyometric, Conjugate Strength, Complex Training, French Contrast, Dog Crap Training, Bodybuilding, HiiT Training, or HIT Training' },
          primaryMuscle: { type: Type.STRING },
          secondaryMuscles: { type: Type.ARRAY, items: { type: Type.STRING } },
          equipment: { type: Type.STRING, description: 'Barbell, Dumbbell, Kettlebell, Machine, Bodyweight, Bands, Cable, Reformer, Cadillac, Wunda Chair, Ladder Barrel, Spine Corrector, or Pedi-Pole' },
          difficulty: { type: Type.STRING, description: 'Beginner, Intermediate, or Advanced' },
          movementPattern: { type: Type.STRING, description: 'Push, Pull, Squat, Hinge, Lunge, Core, Carry, Cardio, Articulation, or Integration' },
          description: { type: Type.STRING, description: 'Concise summary of benefits and purpose.' },
          instructions: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const generateAdaptiveQuizQuestions = async (topic: string, count: number = 3, startDifficulty: number = 5): Promise<QuizQuestion[]> => {
  /* Fix: Instantiate GoogleGenAI inside function for fresh API key context */
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate ${count} high-quality technical quiz questions about: "${topic}". 
               The initial difficulty level should be around ${startDifficulty}/10. 
               Ensure questions cover biomechanical principles, physiological adaptations, and tactical deployment.`,
    config: {
      systemInstruction: "You are Victor, an elite performance analyst. Create challenging multiple-choice questions for athletes and coaches. Each question must include a technical 'explanation' that reinforces learning after the answer is revealed. Return JSON.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Exactly 4 options." },
            correctIndex: { type: Type.NUMBER, description: "0-3" },
            explanation: { type: Type.STRING },
            difficulty: { type: Type.NUMBER }
          },
          required: ["id", "question", "options", "correctIndex", "explanation", "difficulty"]
        }
      }
    }
  });
  return JSON.parse(response.text || '[]');
};

export const scrapeEquipmentFromWebsite = async (url: string): Promise<Omit<EquipmentPiece, 'id'>[]> => {
  // Use gemini-3-pro-image-preview for tool access and high quality info
  /* Fix: Instantiate GoogleGenAI inside function for fresh API key context (required for pro models) */
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: `Examine the manufacturer's website at ${url}. 
               Identify 5-10 primary professional strength and conditioning equipment pieces sold by this manufacturer.
               For each piece, provide:
               - name: The specific product name.
               - manufacturer: The name of the company (from the URL).
               - category: Barbell, Dumbbell, Kettlebell, Machine, Reformer, or General.
               - imageUrl: A valid public URL to a product image from their site or a high-quality representative image.
               - videoUrl: A link to a demo or instructional video if available (e.g. YouTube).
               - tags: A few conceptual tags like 'POWER', 'RACK', 'FREE_WEIGHT'.
               - usageInstructions: 3-4 bullet points on how to safely and effectively use this specific piece of equipment.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            manufacturer: { type: Type.STRING },
            category: { type: Type.STRING },
            imageUrl: { type: Type.STRING },
            videoUrl: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            usageInstructions: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["name", "manufacturer", "category"]
        }
      }
    }
  });

  const text = response.text || '[]';
  return JSON.parse(text);
};

export const summarizeBook = async (title: string, content: string): Promise<string> => {
  /* Fix: Instantiate GoogleGenAI inside function for fresh API key context */
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Summarize the athletic and training implications of the following text from the book "${title}":\n\n${content}`,
    config: {
      systemInstruction: "You are Victor, a high-performance athletic analyst. Provide a dense, tactical summary of the training principles mentioned. Focus on application for elite athletes. Use bold headers and bullet points. Mention biomechanical advantages and physiological adaptations."
    }
  });
  return response.text || "Summary unavailable.";
};

export const getWorkoutRecommendation = async (
  goal: string, 
  sport: string, 
  style: string, 
  level: string,
  exerciseLibrary: Exercise[]
): Promise<AIRecommendation> => {
  const libraryContext = exerciseLibrary.map(ex => ({ id: ex.id, name: ex.name, category: ex.category, association: ex.association })).slice(0, 100);

  /* Fix: Instantiate GoogleGenAI inside function for fresh API key context */
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a high-performance workout routine for an athlete.
               
               ATHLETE PROFILE:
               - Sport: ${sport}
               - Goal: ${goal}
               - Methodology: ${style}
               - Difficulty: ${level}

               AVAILABLE EXERCISE ASSETS (Try to use these IDs if they fit, or suggest new ones if necessary):
               ${JSON.stringify(libraryContext)}
               
               Return the data in a nested block format where exercises can be grouped into blocks (Straight, Superset, or Circuit).
               Format your response as valid JSON matching the provided schema.`,
    config: {
      systemInstruction: "You are Victor, an elite Tactical Strength and Conditioning Specialist and Classical Pilates Master. Provide science-backed athletic training routines. When generating Pilates sequences, adhere strictly to the Classical Order (e.g. Footwork series first on Reformer, Mat Hundred first on Mat). Integrate Pilates apparatus work with traditional force production drills for a hybrid athletic roadmap.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          reasoning: { type: Type.STRING },
          workout: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              blocks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    name: { type: Type.STRING },
                    type: { type: Type.STRING, description: 'Straight, Superset, or Circuit' },
                    exercises: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          exerciseId: { type: Type.STRING },
                          restPeriodSeconds: { type: Type.NUMBER },
                          sets: {
                            type: Type.ARRAY,
                            items: {
                              type: Type.OBJECT,
                              properties: {
                                reps: { type: Type.NUMBER },
                                weight: { type: Type.NUMBER },
                                completed: { type: Type.BOOLEAN },
                                type: { type: Type.STRING }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  const jsonStr = response.text || '{}';
  return JSON.parse(jsonStr);
};

export const parseWorkoutFromVoice = async (transcript: string, exerciseLibrary: any[]): Promise<Partial<Workout>> => {
  /* Fix: Instantiate GoogleGenAI inside function for fresh API key context */
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Convert the following voice transcript into a structured workout JSON.
               Transcript: "${transcript}"
               
               Available Exercise Library (match by name or ID if possible):
               ${JSON.stringify(exerciseLibrary.map(ex => ({id: ex.id, name: ex.name})))}

               Rules:
               - If an exercise mentioned isn't in the library, use a generic ID like '1' but keep the intended name in your reasoning or comments.
               - Structure into blocks (Straight, Superset, or Circuit).
               - Guess appropriate reps/sets/rest if not specified.`,
    config: {
      systemInstruction: "You are an AI S&C assistant and Pilates expert. Parse natural language into structured workout data. Recognize Pilates apparatus names like Reformer, Wunda Chair, and Cadillac.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          blocks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                type: { type: Type.STRING },
                exercises: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      exerciseId: { type: Type.STRING },
                      restPeriodSeconds: { type: Type.NUMBER },
                      sets: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            reps: { type: Type.NUMBER },
                            weight: { type: Type.NUMBER },
                            completed: { type: Type.BOOLEAN }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const analyzePerformance = async (logs: any[]): Promise<string> => {
  /* Fix: Instantiate GoogleGenAI inside function for fresh API key context */
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze these recent workout logs and readiness data, and provide 3 actionable insights for improvement: ${JSON.stringify(logs)}`,
    config: {
      systemInstruction: "You are Victor, an elite performance analyst and Pilates specialist. Correlate wellness data with training volume. Mention pelvic stability and spinal health if performance markers show fatigue."
    }
  });
  return response.text || '';
};