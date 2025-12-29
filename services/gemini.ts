import { GoogleGenAI, Type } from "@google/genai";
import { PuzzleData } from "../types";

const SYSTEM_PROMPT = `
You are an expert vision assistant specializing in extracting "Queens" (Star Battle) logic puzzles from screenshots.

**Task:**
Analyze the provided image to reconstruct the logical grid structure ($N \times N$) and the region partition map.

**Critical Instructions:**
1.  **Focus Area**: Identify the main puzzle grid. **IGNORE** any surrounding UI elements, browser tabs, phone status bars, or instructions text. Focus ONLY on the square grid.
2.  **Grid Dimensions ($N$)**:
    -   Count the rows and columns carefully.
    -   Common sizes are 8x8, 9x9, 10x10.
    -   The grid is always a perfect square.
3.  **Region Mapping**:
    -   The grid is divided into $N$ distinct colored regions.
    -   Scan the grid **row by row**, from top-left (0,0) to bottom-right.
    -   For each cell, assign a Region ID (integer).
    -   **Visual Cues**:
        -   Cells with the **same background color** are in the same region.
        -   **THICK** lines indicate boundaries between different regions.
        -   **THIN** lines separate cells within the same region.
    -   Ensure every single cell is assigned a valid ID.

**Output Format:**
Return valid JSON only:
{
  "gridSize": integer,
  "regions": [[id, id, ...], [id, id, ...], ...]
}
`;

export const parsePuzzleFromImage = async (
  apiKey: string,
  base64Image: string,
  mimeType: string
): Promise<PuzzleData> => {
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image,
            },
          },
          {
            text: "Analyze this Queens puzzle image. Output the exact grid size and region map JSON.",
          },
        ],
      },
      config: {
        systemInstruction: SYSTEM_PROMPT,
        thinkingConfig: { thinkingBudget: 24000 }, // Maximize budget for best reasoning
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            gridSize: {
              type: Type.INTEGER,
              description: "The number of rows/columns (N).",
            },
            regions: {
              type: Type.ARRAY,
              description: "A 2D array representing the region ID for each cell.",
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.INTEGER,
                },
              },
            },
          },
          required: ["gridSize", "regions"],
        },
      },
    });

    if (!response.text) {
      throw new Error("No response from Gemini.");
    }

    const data = JSON.parse(response.text) as PuzzleData;

    // FIX: Auto-correct grid size based on actual region array structure
    // LLMs sometimes hallucinate the count or row length, so we prioritize the array structure.
    if (data.regions && Array.isArray(data.regions) && data.regions.length > 0) {
        const actualRows = data.regions.length;
        
        // Use actual array length as the source of truth if it differs from the declared size
        if (data.gridSize !== actualRows) {
            console.warn(`Gemini returned gridSize=${data.gridSize} but regions array is ${actualRows} rows. Using ${actualRows}.`);
            data.gridSize = actualRows;
        }

        // Sanitize rows to ensure the grid is perfectly square
        data.regions = data.regions.map(row => {
            // Handle malformed rows
            if (!Array.isArray(row)) {
                return Array(actualRows).fill(0);
            }
            
            // Truncate if too long
            if (row.length > actualRows) {
                return row.slice(0, actualRows);
            }
            
            // Pad if too short (repeat last value or use 0)
            if (row.length < actualRows) {
                const lastVal = row.length > 0 ? row[row.length - 1] : 0;
                const padding = Array(actualRows - row.length).fill(lastVal);
                return [...row, ...padding];
            }
            
            return row;
        });

        // Normalize region IDs to 0..N-1 to ensure consistent color palette usage
        // This handles cases where Gemini uses arbitrary IDs (e.g. 1, 5, 9)
        const uniqueIds = Array.from(new Set(data.regions.flat()));
        const idMap = new Map(uniqueIds.map((id, index) => [id, index]));
        data.regions = data.regions.map(row => row.map(id => idMap.get(id)!));
    }

    // Validation
    if (data.gridSize < 4 || data.gridSize > 20) {
        throw new Error(`Invalid grid size detected: ${data.gridSize}. Supported range is 4-20.`);
    }
    
    // Final integrity check
    if (data.regions.length !== data.gridSize || data.regions[0].length !== data.gridSize) {
        throw new Error(`Region map dimensions (${data.regions.length}x${data.regions[0]?.length}) do not match grid size (${data.gridSize}).`);
    }

    return data;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};