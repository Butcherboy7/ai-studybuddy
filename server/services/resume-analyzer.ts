import { GoogleGenAI } from "@google/genai";
import type { SkillGapAnalysis } from "@shared/schema";
import { searchYouTubeCourses } from "./youtube";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeResumeForSkillGaps(
  resumeText: string, 
  careerGoal: string, 
  targetRole?: string
): Promise<SkillGapAnalysis> {
  try {
    const analysisPrompt = `
Quick career analysis. Resume: ${resumeText.substring(0, 800)}

Goal: ${careerGoal}
${targetRole ? `Role: ${targetRole}` : ''}

Return BRIEF JSON (max 20 words per description):
{
  "currentSkills": ["skill1", "skill2", "skill3"],
  "requiredSkills": ["req1", "req2", "req3"], 
  "skillGaps": ["gap1", "gap2"],
  "experience": "Brief level",
  "recommendations": [
    {"skill": "name", "priority": "High/Medium/Low", "description": "brief reason"}
  ],
  "overallScore": 75
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Using faster model
      contents: analysisPrompt,
    });

    console.log("Gemini raw response:", response.text);
    
    let analysisData;
    try {
      // Try to parse the response text
      const responseText = response.text || "";
      if (!responseText.trim()) {
        throw new Error("Empty response from Gemini");
      }
      
      // Clean the response text of any markdown formatting
      const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysisData = JSON.parse(cleanedText);
      
      // Validate required fields
      if (!analysisData.currentSkills || !analysisData.skillGaps || !analysisData.recommendations) {
        throw new Error("Missing required fields in analysis");
      }
      
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      console.error("Raw response text:", response.text);
      
      // Fallback analysis structure
      analysisData = {
        currentSkills: ["Analysis Error", "Please Try Again"],
        requiredSkills: ["Multiple Skills Required"],
        skillGaps: ["Unable to analyze - please try with shorter text"],
        experience: "Unable to determine due to parsing error",
        recommendations: [
          {
            skill: "Resume Analysis",
            priority: "High",
            description: "There was an error analyzing your resume. Please try again with a shorter resume or simpler career goal."
          }
        ],
        overallScore: 0
      };
    }
    
    // Only search for courses for top 2 high-priority skills to improve performance  
    const highPrioritySkills = (analysisData.recommendations || []).filter((rec: any) => rec.priority === 'High').slice(0, 2);
    const otherSkills = (analysisData.recommendations || []).filter((rec: any) => rec.priority !== 'High');
    
    // Search for YouTube courses in parallel for high-priority skills only
    const highPriorityWithCourses = await Promise.all(
      highPrioritySkills.map(async (rec: any) => {
        try {
          const courses = await Promise.race([
            searchYouTubeCourses(rec.skill, careerGoal),
            new Promise<any[]>((_, reject) => 
              setTimeout(() => reject(new Error('YouTube search timeout')), 2000) // 2 second timeout
            )
          ]);
          return {
            ...rec,
            courses: courses || []
          };
        } catch (error) {
          console.error(`Failed to find courses for ${rec.skill}:`, error);
          return {
            ...rec,
            courses: []
          };
        }
      })
    );
    
    // Combine all recommendations
    const recommendationsWithCourses = [
      ...highPriorityWithCourses,
      ...otherSkills.map((rec: any) => ({ ...rec, courses: [] }))
    ];

    return {
      ...analysisData,
      recommendations: recommendationsWithCourses
    } as SkillGapAnalysis;

  } catch (error) {
    console.error("Resume analysis error:", error);
    throw new Error(`Failed to analyze resume: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export async function generateCareerRoadmap(
  skillGapAnalysis: SkillGapAnalysis,
  careerGoal: string
): Promise<string> {
  try {
    const roadmapPrompt = `
Create SHORT roadmap for: ${careerGoal}

Skills to learn: ${skillGapAnalysis.skillGaps.join(", ")}
Current level: ${skillGapAnalysis.experience}
Score: ${skillGapAnalysis.overallScore}%

Return BRIEF roadmap (max 200 words):
- What to focus on first
- Learning timeline
- Key resources

Create a structured learning roadmap with:
1. **Phase-based approach** (Beginner → Intermediate → Advanced)
2. **Timeline estimates** for each phase
3. **Specific learning path** for each skill gap
4. **Project suggestions** to build portfolio
5. **Certification recommendations** if applicable
6. **Next steps** to take immediately

Make it actionable and motivating, focusing on practical steps they can take right away.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: roadmapPrompt,
    });

    return response.text || "Could not generate roadmap";

  } catch (error) {
    console.error("Roadmap generation error:", error);
    throw new Error("Failed to generate career roadmap");
  }
}