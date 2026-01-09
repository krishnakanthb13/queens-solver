import { PuzzleData } from "../types";

const SYSTEM_PROMPT = `
You are an expert vision assistant specializing in extracting "Queens" (Star Battle) logic puzzles from screenshots.

**Task:**
Analyze the provided image to reconstruct the logical grid structure ($N \\times N$) and the region partition map.

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
Return valid JSON only in this format:
{
  "gridSize": number,
  "regions": [[number, ...], ...]
}
`;

const AIML_BASE_URL = "https://api.aimlapi.com/v1/chat/completions";

export const parsePuzzleFromImageAIML = async (
    apiKey: string,
    base64Image: string,
    mimeType: string,
    // model: string = "google/gemini-3-pro-preview",  // Gemini 3 Pro for best grid extraction accuracy
    model: string = "anthropic/claude-sonnet-4-5",  // Claude Sonnet 4.5 for best spatial reasoning
    baseUrl?: string
): Promise<PuzzleData> => {
    const modelName = process.env.AIML_MODEL || model;
    const endpoint = baseUrl || AIML_BASE_URL;

    const requestBody = {
        model: modelName,
        messages: [
            {
                role: "system",
                content: SYSTEM_PROMPT
            },
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: "Analyze this Queens puzzle image. Output the JSON immediately after brief analysis. Do not over-explain - just count grid size, identify regions by color, and output the JSON."
                    },
                    {
                        type: "image_url",
                        image_url: {
                            url: `data:${mimeType};base64,${base64Image}`
                        }
                    }
                ]
            }
        ],
        max_tokens: 8192
    };

    try {
        console.log("[AIML] Making request to:", endpoint);
        console.log("[AIML] Model:", modelName);
        console.log("[AIML] Image size (base64 chars):", base64Image.length);

        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBody)
        });

        console.log("[AIML] Response status:", response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("[AIML] Error response:", errorText);
            throw new Error(`API Error ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        console.log("[AIML] Full response:", JSON.stringify(result, null, 2));

        const message = result.choices?.[0]?.message;

        // Try multiple fields where the response might be
        let text = message?.content;

        // For thinking models, content may be empty and reasoning contains the output
        if (!text && message?.reasoning) {
            console.log("[AIML] Using 'reasoning' field instead of 'content'");
            text = message.reasoning;
        }

        // Some providers use reasoning_content
        if (!text && message?.reasoning_content) {
            text = message.reasoning_content;
        }

        if (!text) {
            console.error("[AIML] No text found. Message structure:", message);
            throw new Error("No response content from AIML model.");
        }

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("Could not find valid JSON in model response.");
        }

        const data = JSON.parse(jsonMatch[0]) as PuzzleData;

        if (data.regions && Array.isArray(data.regions) && data.regions.length > 0) {
            const actualRows = data.regions.length;

            if (data.gridSize !== actualRows) {
                console.warn(`AIML returned gridSize=${data.gridSize} but regions array is ${actualRows} rows. Using ${actualRows}.`);
                data.gridSize = actualRows;
            }

            data.regions = data.regions.map(row => {
                if (!Array.isArray(row)) {
                    return Array(actualRows).fill(0);
                }
                if (row.length > actualRows) {
                    return row.slice(0, actualRows);
                }
                if (row.length < actualRows) {
                    const lastVal = row.length > 0 ? row[row.length - 1] : 0;
                    const padding = Array(actualRows - row.length).fill(lastVal);
                    return [...row, ...padding];
                }
                return row;
            });

            const uniqueIds = Array.from(new Set(data.regions.flat()));
            const idMap = new Map(uniqueIds.map((id, index) => [id, index]));
            data.regions = data.regions.map(row => row.map(id => idMap.get(id)!));
        }

        if (data.gridSize < 4 || data.gridSize > 20) {
            throw new Error(`Invalid grid size detected: ${data.gridSize}. Supported range is 4-20.`);
        }

        if (data.regions.length !== data.gridSize || (data.regions[0] && data.regions[0].length !== data.gridSize)) {
            throw new Error(`Region map dimensions do not match grid size (${data.gridSize}).`);
        }

        return data;
    } catch (error: any) {
        console.error("AIML API Error:", error);
        throw error;
    }
};
