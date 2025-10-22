'use client'

import { useState } from 'react'
interface MathProblem {
  problem_text: string
  correct_answer: number
}

export default function Home() {
  const [problem, setProblem] = useState<MathProblem | null>(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const generateProblem = async () => {
    setIsLoading(true)
    setIsSubmitting(false)
    setProblem(null)
    setUserAnswer('')
    setFeedback('')
    setIsCorrect(null)
    setSessionId(null)

    try {
      const response = await fetch('/api/math-problem', {
        method: 'POST',
      })
      if (!response.ok) {
        throw new Error('Failed to generate problem')
      }
      const data = await response.json()
      setProblem(data.problem)
      setSessionId(data.sessionId)
    } catch (error) {
      console.error(error)
      setFeedback('Sorry, something went wrong while generating a problem. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const submitAnswer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sessionId) return

    setIsSubmitting(true)
    setFeedback('')
    setIsCorrect(null)

    try {
      const response = await fetch('/api/math-problem/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sessionId, answer: userAnswer }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit answer')
      };

      const data = await response.json();

      setTimeout(() => { /* This resolve with the bug with isCorrect */
        setFeedback(data.feedback);
        setIsCorrect(data.isCorrect);
      });

    } catch (error) {
      console.error(error)
      setFeedback('Sorry, something went wrong while submitting your answer. Please try again.')
    } finally {
      setIsSubmitting(false)
    }

  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Math Problem Generator
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <button
            onClick={generateProblem}
            disabled={isLoading || !problem ? false : (!isCorrect ? true : false)}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-105"
          >
            {isLoading ? 'Generating...' : 'Generate New Problem'}
          </button>
        </div>

        {problem && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Problem:</h2>
            <p className="text-lg text-gray-800 leading-relaxed mb-6
            border-[2px] border-dashed border-[#007bff] bg-[#f8faff] p-6 rounded-lg min-h-32 text-left">
              {problem.problem_text}
            </p>

            <form onSubmit={submitAnswer} className="space-y-4">
              <div>
                <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Answer:
                </label>
                <input
                  type="text"
                  id="answer"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your answer"
                  required readOnly={isCorrect}
                />
              </div>

              <button
                type="submit"
                disabled={!userAnswer || isSubmitting || isCorrect}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-105"
              >
                {!userAnswer ? ' Submit Answer ' : (isSubmitting ? 'Evaluating answer...' : ' Submit Answer')}

              </button>
            </form>
          </div>
        )}

        {feedback && (
          <div className={`rounded-lg shadow-lg p-6 ${isCorrect ? 'bg-green-50 border-2 border-green-200' : 'bg-yellow-50 border-2 border-yellow-200'}`}>
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              {isCorrect ? '✅ Correct!' : '❌ Not quite right'}
            </h2>
            <p className="text-gray-800 leading-relaxed">{feedback}</p>
          </div>
        )}
      </main>
    </div>
  )
}