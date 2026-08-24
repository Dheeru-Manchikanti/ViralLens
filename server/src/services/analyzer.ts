export interface AnalysisSuggestion {
  id: string;
  type: 'length' | 'hashtag' | 'cta' | 'readability' | 'emoji';
  label: string;
  message: string;
  status: 'good' | 'warning' | 'info';
}

/**
 * Analyzes extracted text to provide engagement suggestions.
 */
export function analyzeContent(text: string): AnalysisSuggestion[] {
  const suggestions: AnalysisSuggestion[] = [];

  // Normalize text for analysis
  const normalizedText = text.trim();
  const words = normalizedText.split(/\s+/).filter((w) => w.length > 0);
  const wordCount = words.length;

  if (wordCount === 0) return suggestions;

  // 1. Length Check
  // Assuming a generic ideal length for Instagram/LinkedIn posts (50 - 150 words)
  if (wordCount < 15) {
    suggestions.push({
      id: 'length',
      type: 'length',
      label: 'Post Length (Too Short)',
      message: 'Your post is quite brief. Consider expanding to 50-150 words to provide more value and context.',
      status: 'warning',
    });
  } else if (wordCount > 300) {
    suggestions.push({
      id: 'length',
      type: 'length',
      label: 'Post Length (Too Long)',
      message: 'This post is quite long. Ensure you have clear formatting and hook the reader early, or consider breaking it into multiple posts.',
      status: 'warning',
    });
  } else if (wordCount >= 50 && wordCount <= 150) {
    suggestions.push({
      id: 'length',
      type: 'length',
      label: 'Optimal Length',
      message: 'Great job! Your post falls right into the sweet spot of 50-150 words for optimal engagement.',
      status: 'good',
    });
  }

  // 2. Hashtag Check
  const hashtags = normalizedText.match(/#[a-zA-Z0-9_]+/g) || [];
  const hashtagCount = hashtags.length;

  if (hashtagCount === 0) {
    suggestions.push({
      id: 'hashtag',
      type: 'hashtag',
      label: 'Missing Hashtags',
      message: 'Add 3-5 relevant hashtags to increase your reach and discoverability.',
      status: 'warning',
    });
  } else if (hashtagCount > 10) {
    suggestions.push({
      id: 'hashtag',
      type: 'hashtag',
      label: 'Too Many Hashtags',
      message: `You used ${hashtagCount} hashtags. Consider reducing them to 3-5 highly relevant ones to avoid looking spammy.`,
      status: 'warning',
    });
  } else {
    suggestions.push({
      id: 'hashtag',
      type: 'hashtag',
      label: 'Good Hashtag Usage',
      message: `You used ${hashtagCount} hashtags, which is an ideal amount for most platforms.`,
      status: 'good',
    });
  }

  // 3. Call-to-Action (CTA) Detection
  const ctaRegex = /(comment|share|like|click|link in bio|subscribe|read more|let me know|\?)/i;
  const hasCTA = ctaRegex.test(normalizedText);

  if (!hasCTA) {
    suggestions.push({
      id: 'cta',
      type: 'cta',
      label: 'Missing Call-to-Action',
      message: 'We couldn\'t find a clear CTA or question. Always tell your audience what to do next (e.g., "Link in bio", "What do you think?").',
      status: 'warning',
    });
  } else {
    suggestions.push({
      id: 'cta',
      type: 'cta',
      label: 'Call-to-Action Present',
      message: 'Your post contains a clear call-to-action or question to drive engagement.',
      status: 'good',
    });
  }

  // 4. Readability (Average Sentence Length)
  // Split by common sentence terminators.
  const sentences = normalizedText.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const sentenceCount = sentences.length;
  
  if (sentenceCount > 0) {
    const avgWordsPerSentence = wordCount / sentenceCount;
    if (avgWordsPerSentence > 20) {
      suggestions.push({
        id: 'readability',
        type: 'readability',
        label: 'Readability (Long Sentences)',
        message: 'Your sentences are quite long (avg. >20 words). Try breaking them up to make the post easier to skim.',
        status: 'warning',
      });
    } else {
      suggestions.push({
        id: 'readability',
        type: 'readability',
        label: 'Good Readability',
        message: 'Your sentence length is easy to read and skim.',
        status: 'good',
      });
    }
  }

  // 5. Emoji/Tone Check
  // Basic emoji regex matching a range of common emoji unicode characters
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/u;
  const hasEmoji = emojiRegex.test(normalizedText);

  if (!hasEmoji && wordCount > 30) {
    suggestions.push({
      id: 'emoji',
      type: 'emoji',
      label: 'Consider Using Emojis',
      message: 'Your text is a bit plain. Adding 1-2 emojis can provide visual breaks and convey tone better.',
      status: 'info',
    });
  }

  return suggestions;
}
