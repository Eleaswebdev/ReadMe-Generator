import { GoogleGenAI } from "@google/genai";
import { ProjectDetails, ReadmeStyle } from "../types";

const getSystemInstruction = (style: ReadmeStyle, fileType: 'md' | 'txt') => {
  if (fileType === 'txt') {
    return `
      You are an expert Technical Writer and Developer Advocate.
      
      Your task is to generate documentation in Plain Text (.txt) format.
      
      CRITICAL LOGIC FOR WORDPRESS PLUGINS:
      If the user's project name or description implies it is a WordPress Plugin (e.g., mentions "plugin", "wordpress", "wp", "hook", "filter", "shortcode"):
      
      YOU MUST STRICTLY FOLLOW THE OFFICIAL WORDPRESS.ORG PLUGIN README STANDARD:
      
      Format Structure:
      === Plugin Name ===
      Contributors: [Generates fake usernames if not provided]
      Tags: [Generate relevant tags]
      Requires at least: [Suggest version]
      Tested up to: [Suggest version]
      Requires PHP: [Suggest version]
      Stable tag: 1.0.0
      License: GPLv2 or later
      License URI: https://www.gnu.org/licenses/gpl-2.0.html
      
      [If a Project Image is provided, display it here: "Banner: [URL]"]

      [Short description paragraph]
      
      == Description ==
      [Long description]
      
      **Features:**
      [List features]
      
      == Installation ==
      1. Upload the plugin files to the \`/wp-content/plugins/plugin-name\` directory, or install the plugin through the WordPress plugins screen directly.
      2. Activate the plugin through the 'Plugins' screen in WordPress.
      3. After activation, navigate to **Settings > [Plugin Name]** (or similar menu item, check your WordPress admin sidebar) in your WordPress dashboard to configure the plugin.
      
      == Frequently Asked Questions ==
      [Generate 2-3 relevant FAQs]
      
      == Screenshots ==
      1. [Description of screenshot 1]
      2. [Description of screenshot 2]
      
      == Changelog ==
      = 1.0.0 =
      * Initial release.
      
      == Upgrade Notice ==
      = 1.0.0 =
      Initial release.
      
      == Support ==
      For support, visit the plugin support forums.
      
      == Credits ==
      Developed by [User Name/Company].
      
      ---------------------------------------------------------
      
      IF IT IS NOT A WORDPRESS PLUGIN:
      Generate a clean, structured text file.
      Use UPPERCASE for main headers (e.g., PROJECT NAME, INSTALLATION, USAGE).
      Use indentation for lists.
      Do not use Markdown syntax like # or *. Use - for bullets.
      If Project Image is provided, display it after the Title as "Banner: [URL]".
    `;
  }

  // Fallback to existing Markdown logic
  const baseStructure = `
    1.  **Title**: H1 Header with Project Name.
    2.  **Project Image**: IF a Project Image is provided, you MUST display it here using HTML syntax to ensure full width: 
        \`<img src="IMAGE_URL_PLACEHOLDER" width="100%" height="auto" alt="Project Banner" />\`
        Replace IMAGE_URL_PLACEHOLDER with the actual URL provided.
    3.  **Introduction**: A compelling paragraph explaining the project.
    4.  **Separator**: Horizontal rule \`---\`.
    5.  **Features**: H2 Header. List of capabilities.
    6.  **Tech Stack**: H2 Header. Categorized list.
    7.  **Installation**: H2 Header. Step-by-step code blocks.
    8.  **Configuration**: H2 Header. Setup instructions.
    9.  **Usage Guide**: H2 Header. Clear instructions on how to use the project.
    10. **Contributing**: H2 Header.
    11. **License**: H2 Header.
    12. **Footer**: Credit line.
  `;

  let styleRules = "";

  switch (style) {
    case 'modern':
      styleRules = `
        ### Style: MODERN 🚀
        - **Title**: Include a relevant emoji next to the title.
        - **Badges**: STRICTLY REQUIRED. Immediately below the Project Image (or Title if no image), generate Shields.io badges for tech stack.
          - Format: \`![Label](https://img.shields.io/badge/Label-Color?logo=logoName&logoColor=white)\`
        - **Headers**: Add fun emojis to H2 headers (e.g., ## 🚀 Features, ## 🛠️ Tech Stack).
        - **Lists**: Use emojis as bullet points for key features.
        - **Tone**: Enthusiastic, energetic, open-source friendly.
      `;
      break;
    case 'professional':
      styleRules = `
        ### Style: PROFESSIONAL 💼
        - **Title**: text only, NO emojis in the title.
        - **Badges**: Required. Use flat, professional Shields.io badges below the Project Image.
        - **Headers**: Standard text only (e.g., ## Features, ## Tech Stack). NO emojis in headers.
        - **Lists**: Standard bullet points (* or -). NO emojis in lists.
        - **Tone**: Formal, corporate, authoritative, concise.
        - **Extra**: Emphasize reliability and architecture.
      `;
      break;
    case 'simple':
      styleRules = `
        ### Style: SIMPLE 📄
        - **Title**: Text only.
        - **Badges**: DO NOT include images or badges. Text lists only.
        - **Headers**: Standard text only. NO emojis.
        - **Lists**: Standard bullet points. NO emojis.
        - **Formatting**: Keep it clean and minimalist. Focus on code blocks and clear text.
        - **Tone**: Direct, neutral, documentation-focused.
      `;
      break;
  }

  return `
    You are an expert Senior Developer Advocate and Technical Writer. 
    Your task is to generate a professional, high-quality GitHub README.md file based on the user's project description.

    You MUST follow this specific structure and style exactly.

    ### Structural Requirements:
    ${baseStructure}

    ${styleRules}

    **Important**: Do not wrap the output in markdown code fences (like \`\`\`markdown). Just return the raw markdown content.
  `;
};

export const generateReadme = async (details: ProjectDetails, apiKey: string): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const systemInstruction = getSystemInstruction(details.style, details.fileType);

  // If the image URL is long (like a base64 string), we use a placeholder in the prompt 
  // to save tokens and avoid confusing the model, then inject it back into the response.
  const PLACEHOLDER_TAG = "{{PROJECT_IMAGE_SOURCE}}";
  const hasImage = !!details.imageUrl;
  
  // Use placeholder for prompt if image exists
  const imagePromptValue = hasImage ? PLACEHOLDER_TAG : 'None Provided';

  const prompt = `
    Project Name: ${details.name}
    Description: ${details.description}
    Tech Stack: ${details.techStack}
    Key Features: ${details.features}
    Project Image URL: ${imagePromptValue}
    
    Requested Format: ${details.fileType === 'md' ? 'Markdown (.md)' : 'Plain Text / WP Readme (.txt)'}
    ${details.fileType === 'md' ? `Selected Style: ${details.style.toUpperCase()}` : ''}

    Generate the complete documentation content now.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    let finalText = response.text || "# Error generating README";

    // If we used a placeholder and the model preserved it or used it in the output, replace it with the real source.
    if (hasImage && details.imageUrl) {
        // Replace the placeholder if the model outputted it verbatim
        finalText = finalText.split(PLACEHOLDER_TAG).join(details.imageUrl);
    }

    return finalText;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate documentation. Check your API Key and try again.");
  }
};