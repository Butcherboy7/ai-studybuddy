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
You are a career advisor and technical recruiter. Analyze this resume and career goal to identify skill gaps.

**Resume:**
${resumeText}

**Career Goal:** ${careerGoal}
${targetRole ? `**Target Role:** ${targetRole}` : ''}

Please provide a comprehensive analysis including:

1. **Current Skills**: Extract all technical and professional skills mentioned in the resume
2. **Required Skills**: List skills typically needed for the career goal/target role
3. **Skill Gaps**: Identify missing skills that are important for the career goal
4. **Experience Level**: Assess overall experience level
5. **Priority Recommendations**: For each skill gap, provide priority (High/Medium/Low) and explanation
6. **Overall Score**: Rate how ready the candidate is (0-100) for their career goal

Return your analysis as JSON in this exact format:
{
  "currentSkills": ["skill1", "skill2", ...],
  "requiredSkills": ["required1", "required2", ...],
  "skillGaps": ["gap1", "gap2", ...],
  "experience": "Entry/Mid/Senior level description",
  "recommendations": [
    {
      "skill": "skill name",
      "priority": "High/Medium/Low",
      "description": "why this skill is important and specific learning path"
    }
  ],
  "overallScore": 75
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Using faster model
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            currentSkills: { type: "array", items: { type: "string" } },
            requiredSkills: { type: "array", items: { type: "string" } },
            skillGaps: { type: "array", items: { type: "string" } },
            experience: { type: "string" },
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  skill: { type: "string" },
                  priority: { type: "string", enum: ["High", "Medium", "Low"] },
                  description: { type: "string" }
                },
                required: ["skill", "priority", "description"]
              }
            },
            overallScore: { type: "number", minimum: 0, maximum: 100 }
          },
          required: ["currentSkills", "requiredSkills", "skillGaps", "experience", "recommendations", "overallScore"]
        }
      },
      contents: analysisPrompt,
    });

    const analysisData = JSON.parse(response.text || "{}");
    
    // Only search for courses for top 3 high-priority skills to improve performance
    const highPrioritySkills = analysisData.recommendations.filter((rec: any) => rec.priority === 'High').slice(0, 3);
    const otherSkills = analysisData.recommendations.filter((rec: any) => rec.priority !== 'High');
    
    // Search for YouTube courses in parallel for high-priority skills only
    const highPriorityWithCourses = await Promise.all(
      highPrioritySkills.map(async (rec: any) => {
        try {
          const courses = await Promise.race([
            searchYouTubeCourses(rec.skill, careerGoal),
            new Promise<any[]>((_, reject) => 
              setTimeout(() => reject(new Error('YouTube search timeout')), 3000) // 3 second timeout
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
Based on this skill gap analysis, create a comprehensive learning roadmap for achieving the career goal: "${careerGoal}"

**Analysis:**
- Current Skills: ${skillGapAnalysis.currentSkills.join(", ")}
- Skill Gaps: ${skillGapAnalysis.skillGaps.join(", ")}
- Experience Level: ${skillGapAnalysis.experience}
- Readiness Score: ${skillGapAnalysis.overallScore}%

**High Priority Skills to Learn:**
${skillGapAnalysis.recommendations
  .filter(rec => rec.priority === "High")
  .map(rec => `- ${rec.skill}: ${rec.description}`)
  .join("\n")}

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