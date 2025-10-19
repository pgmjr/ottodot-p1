// A simple in-memory store for session data.
// In a real application, you would use a database like Supabase.
export const sessions = new Map<
  string,
  { problem: { problem_text: string; correct_answer: number } }
>()
