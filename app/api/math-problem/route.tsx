import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';
import { gemini } from '../../gemini';
import AIPrompts from './data'

const GENERATE_PROBLEM_PROMPT = AIPrompts;

// Define the expected structure for type safety
interface MathProblem {
  problem_text: string;
  correct_answer: number;
}

export async function POST() {
  try {
    // 1. Call Gemini API
    const newPrompt = `You are a Primary 5 tutor. ${GENERATE_PROBLEM_PROMPT[Math.floor(Math.random() * GENERATE_PROBLEM_PROMPT.length)]}. Also, don't use any formating style such as markdown.`;
    const result = await gemini.generateContent(newPrompt);

    // 2. Check for empty or invalid response text
    const responseText = result.response.text();
    if (!responseText || responseText.trim().length === 0) {
      console.error('Gemini response was empty.');
      return NextResponse.json({ error: 'AI returned an empty response.' }, { status: 500 });
    }

    // 3. Clean up the response text (remove common JSON delimiters)
    const problemStr = responseText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    let problem: MathProblem;

    // 4. Safely attempt JSON parsing
    try {
      problem = JSON.parse(problemStr);
    } catch (e) {
      console.error('Failed to parse AI response as JSON:', e);
      // Log the raw string to help debug the AI's output format
      console.error('Raw AI Output:', problemStr);
      return NextResponse.json({ error: 'AI output was not valid JSON.' }, { status: 500 });
    }

    // 5. Validate mandatory fields (problem_text and correct_answer)
    if (
      !problem.problem_text ||
      typeof problem.problem_text !== 'string' ||
      typeof problem.correct_answer !== 'number'
    ) {
      console.error('Parsed JSON is missing required keys or types.', problem);
      return NextResponse.json(
        { error: 'AI output is missing required fields (problem_text or correct_answer).' },
        { status: 500 }
      );
    }

    // 6. Save the new problem session to Supabase
    // NOTE: correct_answer is converted to a string here for safer insertion into SQL/Postgres numeric types.
    const { data, error: dbError } = await supabase
      .from('math_problem_sessions')
      .insert([
        {
          problem_text: problem.problem_text,
          correct_answer: problem.correct_answer.toString(), // Safely convert number to string for DB
        },
      ])
      .select('id') // Select the generated session ID
      .single();

    if (dbError) {
      // LOG THE FULL ERROR OBJECT to the server console for proper debugging
      console.error('Supabase insertion error:', dbError);
      return NextResponse.json(
        {
          error: 'Database failed to save the problem session.',
          details: dbError.message // Expose the Supabase error message to the client for debugging
        },
        { status: 500 }
      );
    }

    // 7. Return the session ID and problem details to the client
    return NextResponse.json({ sessionId: data.id, problem });

  } catch (error) {
    // Catch general errors (like network issues or other unexpected failures)
    console.error('Unhandled error during math problem generation:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
