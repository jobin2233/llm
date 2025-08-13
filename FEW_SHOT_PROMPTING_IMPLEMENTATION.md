# Few-Shot Prompting Implementation for SynthesisAI Chatbot

## Overview
This document describes the implementation of few-shot prompting strategy for the SynthesisAI dermatological diagnostic chatbot. The implementation ensures consistent, structured responses that focus on condition identification and causes without providing treatment information.

## Implementation Details

### 1. API Layer Enhancement (`src/services/api.js`)

The `sendChatMessage` function has been enhanced with few-shot prompting:

```javascript
// Few-shot prompting strategy for dermatological diagnostic AI
const fewShotPrompt = `You are a dermatological diagnostic AI. Follow this response pattern exactly:

CORRECT RESPONSE EXAMPLE:
User: "I have red bumps on my face"
Response: "**Condition:** Acne vulgaris. **Causes:** Excess sebum production, follicular hyperkeratinization, C. acnes colonization, and inflammatory response."

INCORRECT RESPONSE (DO NOT DO THIS):
User: "I have red bumps on my face"  
Response: "**Condition:** Acne. **Treatment:** Use benzoyl peroxide..."

Your role: Identify the skin condition and explain its underlying causes only. Do not provide treatment information - that's handled by other system components.

Always use the format:
**Condition:** [Disease name]
**Causes:** [Pathophysiological mechanisms and contributing factors]

User: "${message}"
Response:`;
```

### 2. Text Formatting Utility (`src/utils/textFormatter.jsx`)

Created a comprehensive text formatting system to handle markdown-style bold text:

#### Key Functions:
- `formatBoldText(text)`: Converts `**text**` to JSX bold elements
- `formatDermatologyResponse(text)`: Handles multi-line responses with proper styling
- `formatChatMessage(text)`: Main formatter for chat messages

#### Features:
- Preserves line breaks and spacing
- Converts `**Condition:**` and `**Causes:**` to bold text
- Maintains readability with proper CSS classes
- Handles edge cases and empty text

### 3. Chat Component Updates

#### ChatInterface.jsx
- Added import for `formatChatMessage`
- Updated message rendering to use formatter for AI responses only
- User messages remain as plain text

#### FloatingChatbot.jsx
- Same formatting implementation as ChatInterface
- Maintains consistent styling across both chat components

## Response Format

### Expected AI Response Structure:
```
**Condition:** [Specific dermatological condition name]
**Causes:** [Detailed pathophysiological mechanisms and contributing factors]
```

### Example Responses:

**Input:** "I have red bumps on my face"
**Output:** 
```
**Condition:** Acne vulgaris
**Causes:** Excess sebum production, follicular hyperkeratinization, C. acnes colonization, and inflammatory response.
```

**Input:** "My skin is very dry and flaky"
**Output:**
```
**Condition:** Xerosis cutis (dry skin)
**Causes:** Reduced sebum production, impaired skin barrier function, environmental factors, and decreased natural moisturizing factors.
```

## Key Benefits

### 1. Consistency
- All responses follow the same structured format
- Eliminates variability in AI responses
- Ensures professional medical terminology

### 2. Safety
- Prevents AI from providing treatment recommendations
- Focuses only on diagnostic information and causes
- Separates diagnosis from treatment (handled by other system components)

### 3. User Experience
- Clear, readable formatting with bold headers
- Consistent visual presentation
- Easy to scan and understand

### 4. Integration
- Works seamlessly with existing RAG system
- Compatible with medication recommendation system
- Maintains chat history and Firebase integration

## Technical Implementation

### Prompt Engineering Strategy
- **Few-shot learning**: Provides clear examples of correct and incorrect responses
- **Role definition**: Establishes AI as diagnostic tool only
- **Format specification**: Enforces consistent output structure
- **Constraint-based**: Explicitly prohibits treatment information

### Text Processing Pipeline
1. User message → Few-shot prompt construction
2. API call to Lightning AI endpoint
3. Response processing and formatting
4. Bold text conversion for display
5. Integration with RAG recommendations

## Testing and Validation

### Test Cases
1. **Simple conditions**: "red bumps", "dry skin", "rash"
2. **Complex descriptions**: Multiple symptoms, detailed descriptions
3. **Edge cases**: Unclear symptoms, non-dermatological queries
4. **Format validation**: Ensure **Condition:** and **Causes:** formatting

### Expected Behavior
- Always returns structured response
- Never provides treatment information
- Uses proper medical terminology
- Maintains consistent formatting

## Future Enhancements

### Potential Improvements
1. **Confidence scoring**: Add confidence levels to diagnoses
2. **Multiple conditions**: Handle cases with multiple possible conditions
3. **Severity assessment**: Include severity indicators
4. **Follow-up questions**: Suggest additional information needed

### Integration Opportunities
1. **Image analysis**: Combine with skin image analysis results
2. **Medical history**: Incorporate user medical history
3. **Symptom tracking**: Track symptom progression over time
4. **Professional referral**: Integrate with clinic finder for serious conditions

## Maintenance Notes

### Regular Updates
- Monitor AI response quality and consistency
- Update few-shot examples based on common queries
- Refine prompt engineering based on user feedback
- Ensure medical accuracy of diagnostic information

### Performance Monitoring
- Track response formatting compliance
- Monitor for treatment information leakage
- Validate medical terminology accuracy
- Measure user satisfaction with diagnostic information
