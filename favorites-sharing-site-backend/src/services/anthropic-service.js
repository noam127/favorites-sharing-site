import Anthropic from '@anthropic-ai/sdk';

let anthropic = null;

function initializeClient() {
    if (!process.env.ANTHROPIC_API_KEY) {
        console.warn('ANTHROPIC_API_KEY not configured. Suggestions feature will not work.');
        return null;
    }

    if (!anthropic) {
        anthropic = new Anthropic({
            apiKey: process.env.ANTHROPIC_API_KEY
        });
    }

    return anthropic;
}

export async function generateSuggestions(categoryName, favorites) {
    const client = initializeClient();

    if (!client) {
        throw new Error('API_KEY_NOT_CONFIGURED');
    }

    if (!favorites || favorites.length === 0) {
        throw new Error('NO_FAVORITES');
    }

    // Build the favorites list for the prompt
    const favoritesList = favorites
        .map((fav, index) => `${index + 1}. ${fav.title}`)
        .join('\n');

    // Determine prompt context based on number of favorites
    let contextGuidance = '';
    if (favorites.length <= 3) {
        contextGuidance = 'Since there are only a few items, explore related areas broadly.';
    } else if (favorites.length <= 10) {
        contextGuidance = 'Identify patterns in these items and suggest complementary additions.';
    } else {
        contextGuidance = 'Find gaps in this collection and suggest items that diversify it.';
    }

    const systemMessage = `You are an expert recommendation assistant. Your task is to analyze a user's favorites collection and suggest new items that would complement their interests. Be thoughtful, diverse, and specific in your recommendations.`;

    const userPrompt = `The user has a favorites category named "${categoryName}" with the following items:

${favoritesList}

Based on these ${favorites.length} item${favorites.length === 1 ? '' : 's'}, suggest 5-8 new items that would be great additions to this collection.

${contextGuidance}

Requirements:
- Provide diverse suggestions that complement but don't duplicate existing items
- Include a brief reason (15-30 words) for each suggestion
- Consider quality, relevance, and variety
- Format as JSON array: [{"title": "...", "reason": "..."}]

Return ONLY the JSON array, no additional text.`;

    try {
        const message = await client.messages.create({
            model: 'claude-haiku-4-5',
            max_tokens: 1024,
            temperature: 0.7,
            system: systemMessage,
            messages: [
                {
                    role: 'user',
                    content: userPrompt
                }
            ]
        });

        // Extract the text content from the response
        const responseText = message.content[0].text;

        // Try to parse as JSON
        let suggestions;
        try {
            suggestions = JSON.parse(responseText);
        } catch (parseError) {
            // If JSON parsing fails, try to extract JSON from the text
            const jsonMatch = responseText.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                suggestions = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('Unable to parse suggestions from response');
            }
        }

        // Validate and limit suggestions
        if (!Array.isArray(suggestions)) {
            throw new Error('Invalid suggestions format');
        }

        // Ensure each suggestion has title and reason
        const validSuggestions = suggestions
            .filter(s => s.title && s.reason)
            .slice(0, 10); // Limit to max 10 suggestions

        if (validSuggestions.length === 0) {
            throw new Error('No valid suggestions generated');
        }

        return validSuggestions;

    } catch (error) {
        // Handle specific Anthropic API errors
        if (error.status === 429) {
            throw new Error('RATE_LIMIT');
        } else if (error.status === 529) {
            throw new Error('SERVICE_OVERLOADED');
        } else if (error.status === 401) {
            console.error('Invalid Anthropic API key');
            throw new Error('API_KEY_INVALID');
        } else if (error.message && error.message.startsWith('Unable to parse')) {
            throw new Error('PARSE_ERROR');
        } else {
            console.error('Anthropic API error:', error);
            throw new Error('API_ERROR');
        }
    }
}
