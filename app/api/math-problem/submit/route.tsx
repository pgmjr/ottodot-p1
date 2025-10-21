import { NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabaseClient'
import { gemini } from '../../../gemini'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { sessionId, answer } = body;

    if (!sessionId || answer === undefined || answer === '') {
      return NextResponse.json({ error: 'Session ID and answer are required' }, { status: 400 })
    }

    const { data: session, error: sessionError } = await supabase
      .from('math_problem_sessions')
      .select('problem_text, correct_answer')
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Invalid session ID' }, { status: 404 })
    }

    const userAnswer = answer;
    const isCorrect = userAnswer == session.correct_answer

    const feedbackPrompt = `
      A Primary 5 student has just answered a math problem.
      The problem was: "${session.problem_text}"
      The correct answer is: ${session.correct_answer}
      The student's answer was: ${userAnswer}
      Validate if the student answer was ${isCorrect ? 'correct' : 'incorrect'}.

      Please provide personalized, encouraging, and educational feedback for the student.
      - If correct, praise them and briefly reinforce the concept.
      - If incorrect, gently point out the mistake without giving the direct answer away immediately, and encourage them to try again. Hint at the method if possible.

      Return the response as a JSON object with one key: {"feedback_text": "..."}.
      Also don't use any formating style to feedback_text value.
    `;

    const result = await gemini.generateContent(feedbackPrompt);
    const responseText = result.response.text()
      .replace(/\s\s/g, ' ')
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    if (!responseText || responseText.trim().length === 0) {
      console.error('Gemini response was empty.');
      return NextResponse.json({ error: 'AI returned an empty response.' }, { status: 500 });
    }

    const feedbackText = JSON.parse(responseText);
    const { data, error: dbError } = await supabase.from('math_problem_submissions').insert({
      session_id: sessionId,
      user_answer: userAnswer,
      is_correct: isCorrect,
      feedback_text: feedbackText.feedback_text,
    }).select('id').single();

    if (!data?.id) {
      // LOG THE FULL ERROR OBJECT to the server console for proper debugging
      console.error('Supabase insertion error:', dbError);
      return NextResponse.json(
        {
          error: 'Database failed to submit user answer.',
          details: dbError.message // Expose the Supabase error message to the client for debugging
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ "isCorrect": isCorrect, "feedback": feedbackText.feedback_text })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit answer' }, { status: 500 })
  }
}
