import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '30mb' }));

  // API Health Check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      service: 'MedLens Clinical Intelligence Backend'
    });
  });

  // STEP 4 — Gemini AI Medical Report Extraction Endpoint
  app.post('/api/extract', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          success: false,
          error: 'GEMINI_API_KEY is not configured in the server environment. Please set GEMINI_API_KEY in the Settings > Secrets panel.'
        });
      }

      const { fileName, fileType, textContent, inlineData } = req.body;

      // Lazy initialization of GoogleGenAI SDK with required user-agent header
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      // Strict Clinical Information Extraction Prompt enforcing all 15 rules
      const systemInstruction = `You are a clinical information extraction engine for MedLens.
Extract ONLY structured information explicitly present in the provided medical report.
CRITICAL EXTRACTION RULES:
1. Extract only information present in the source document.
2. Never invent missing information.
3. Never invent reference ranges.
4. Preserve the exact reported value.
5. Preserve the exact unit.
6. Preserve the reference range exactly as shown in the report.
7. If a reference range is not present in the document, return null for referenceRange.
8. If a value is unclear, return null or mark it as uncertain.
9. Do not diagnose diseases.
10. Do not recommend treatments.
11. Do not recommend medication changes.
12. Do not interpret a laboratory result as a medical diagnosis.
13. Do not assume missing patient information.
14. Identify the source file for extracted information.
15. Return ONLY valid JSON matching the predefined schema.
Do NOT calculate or decide whether a result is normal, low, or high. Only extract the exact reported values and ranges.`;

      const promptText = `Please extract all laboratory tests, measurements, analytes, and report metadata from this document.
Source File: ${fileName || 'Medical_Report'}
Document Type: ${fileType || 'Medical Record'}

Document Content:
${textContent || 'Please extract all visible clinical and laboratory information from the attached document.'}`;

      let contents: any = promptText;

      // Multimodal support: if image or PDF inlineData is provided
      if (inlineData && inlineData.data && inlineData.mimeType) {
        contents = {
          parts: [
            {
              inlineData: {
                mimeType: inlineData.mimeType,
                data: inlineData.data
              }
            },
            {
              text: promptText
            }
          ]
        };
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              report: {
                type: Type.OBJECT,
                properties: {
                  fileName: { type: Type.STRING },
                  reportDate: { type: Type.STRING },
                  reportType: { type: Type.STRING },
                  source: { type: Type.STRING },
                  facility: { type: Type.STRING },
                },
                required: ['fileName', 'reportDate', 'reportType', 'source'],
              },
              results: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    testName: { type: Type.STRING },
                    value: { type: Type.STRING },
                    unit: { type: Type.STRING },
                    referenceRange: { type: Type.STRING },
                    date: { type: Type.STRING },
                    observation: { type: Type.STRING },
                    source: { type: Type.STRING },
                    confidence: { type: Type.NUMBER },
                  },
                  required: ['testName', 'value', 'unit', 'source', 'confidence'],
                },
              },
            },
            required: ['report', 'results'],
          },
          systemInstruction,
        }
      });

      const responseText = response.text;
      if (!responseText) {
        return res.status(500).json({
          success: false,
          error: 'Gemini model returned an empty response.'
        });
      }

      let parsedJson: any;
      try {
        parsedJson = JSON.parse(responseText);
      } catch (e: any) {
        return res.status(500).json({
          success: false,
          error: `Malformed JSON returned by Gemini: ${e.message}`,
          rawText: responseText
        });
      }

      return res.json({
        success: true,
        data: parsedJson
      });
    } catch (err: any) {
      console.error('Gemini extraction error in server:', err);
      return res.status(500).json({
        success: false,
        error: err.message || 'An unexpected error occurred while communicating with the Gemini API.'
      });
    }
  });

  // STEP 5 / PRODUCTION — Patient-Friendly AI Summary Endpoint
  app.post('/api/summarize', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          success: false,
          error: 'GEMINI_API_KEY is not configured in the server environment. Please set GEMINI_API_KEY in Settings > Secrets.'
        });
      }

      const { patient, structuredLabs, reportCount } = req.body;

      if (!patient) {
        return res.status(400).json({
          success: false,
          error: 'Patient information is required for summary generation.'
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const summarySystemInstruction = `You are MedLens Clinical Information Intelligence, an AI-powered information organization and patient communication tool.
Your purpose is to synthesize structured clinical and laboratory facts into a clear, easily understandable summary for the patient to prepare for discussions with their physician.

MANDATORY CLINICAL SAFETY RULES:
1. Use simple, reassuring, and accessible language suitable for non-medical readers.
2. Rely EXCLUSIVELY on the structured patient data and laboratory results provided in the prompt.
3. Mention abnormal, elevated, or decreased values ONLY when the application's validated status is explicitly provided as "LOW" or "HIGH".
4. If a test status is "Not Determined" or its reference range was not provided, explicitly mention that no reference range was available in the source report.
5. Clearly highlight missing information or tests awaiting follow-up.
6. STRICTLY NON-DIAGNOSTIC: Do NOT diagnose any disease, illness, condition, or syndrome.
7. NO TREATMENT RECOMMENDATIONS: Do NOT recommend lifestyle changes, therapies, supplements, dietary adjustments, or home remedies.
8. NO MEDICATION OR DOSAGE RECOMMENDATIONS: Do NOT suggest starting, adjusting, or discontinuing any drug or dosage.
9. NO MEDICAL PREDICTIONS: Do NOT forecast disease progression, mortality, or outcomes.
10. NEVER present uncertain, unverified, or speculative statements as fact.
11. Suggested discussion topics must consist purely of neutral, respectful questions the patient can ask their qualified doctor (e.g., "Discuss fasting glucose findings with your physician").
12. Always output valid JSON strictly conforming to the requested schema.`;

      const promptText = `Please generate an objective, patient-friendly summary from this structured clinical profile:

Patient Profile:
- Name: ${patient.fullName || 'Patient'}
- Age: ${patient.age || 'Not specified'}
- Sex: ${patient.sex || 'Not specified'}
- Documented Symptoms: ${(patient.symptoms && patient.symptoms.length > 0) ? patient.symptoms.join(', ') : 'None documented'}
- Documented Conditions: ${(patient.existingConditions && patient.existingConditions.length > 0) ? patient.existingConditions.join(', ') : 'None documented'}
- Documented Allergies: ${(patient.allergies && patient.allergies.length > 0) ? patient.allergies.map((a: any) => typeof a === 'string' ? a : `${a.allergen} (${a.severity || 'severity unstated'})`).join(', ') : 'No known allergies'}
- Current Medications: ${(patient.currentMedications && patient.currentMedications.length > 0) ? patient.currentMedications.map((m: any) => typeof m === 'string' ? m : `${m.name} ${m.dosage || ''}`).join(', ') : 'None documented'}
- Clinical History: ${patient.medicalHistory || 'None documented'}
- Total Reports on File: ${reportCount || 0}

Structured Laboratory & Diagnostic Results (${structuredLabs?.length || 0} items):
${(structuredLabs && structuredLabs.length > 0)
  ? structuredLabs.map((lab: any) => 
      `- ${lab.testName}: ${lab.value} ${lab.unit || ''} (Ref Range: ${lab.referenceRange || 'Not provided in report'}) [Status: ${lab.status || 'Not Determined'}] [Verification: ${lab.verificationStatus || 'AI Extracted'}] [Source: ${lab.source || 'Report'}]`
    ).join('\n')
  : 'No structured laboratory tests documented yet.'
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: promptText,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              overview: { type: Type.STRING },
              observedFindings: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              missingOrUncertainInfo: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              doctorDiscussionTopics: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              generatedAt: { type: Type.STRING }
            },
            required: [
              'title',
              'overview',
              'observedFindings',
              'missingOrUncertainInfo',
              'doctorDiscussionTopics',
              'generatedAt'
            ]
          },
          systemInstruction: summarySystemInstruction
        }
      });

      const responseText = response.text;
      if (!responseText) {
        return res.status(500).json({
          success: false,
          error: 'Gemini model returned an empty summary.'
        });
      }

      let parsed: any;
      try {
        parsed = JSON.parse(responseText);
      } catch (e: any) {
        return res.status(500).json({
          success: false,
          error: `Malformed JSON summary from AI: ${e.message}`,
          rawText: responseText
        });
      }

      return res.json({
        success: true,
        data: parsed
      });
    } catch (err: any) {
      console.error('Gemini summary error in server:', err);
      return res.status(500).json({
        success: false,
        error: err.message || 'An unexpected error occurred during summary generation.'
      });
    }
  });

  // Vite middleware in development; Static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MedLens server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
