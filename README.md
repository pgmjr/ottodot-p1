# Math Problem Generator

## Overview

This is a starter kit for building an AI-powered math problem generator application. The goal is to create a standalone prototype that uses AI to generate math word problems suitable for Primary 5 students, saves the problems and user submissions to a database, and provides personalized feedback.

## Tech Stack

- **Frontend Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **AI Integration**: Google Generative AI (Gemini)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd math-problem-generator
```

### 2. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to Settings → API to find your:
   - Project URL (starts with `https://`)
   - Anon/Public Key

### 3. Set Up Database Tables

1. In your Supabase dashboard, go to SQL Editor
2. Copy and paste the contents of `database.sql`
3. Click "Run" to create the tables and policies

### 4. Get Google API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key for Gemini

### 5. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
2. Edit `.env.local` and add your actual keys:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_actual_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_supabase_anon_key
   GOOGLE_API_KEY=your_actual_google_api_key
   ```

### 6. Install Dependencies

```bash
npm install
```

### 7. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Your Task

### 1. Implement Frontend Logic (`app/page.tsx`)

Complete the TODO sections in the main page component:

- **generateProblem**: Call your API route to generate a new math problem
- **submitAnswer**: Submit the user's answer and get feedback

### 2. Create Backend API Route (`app/api/math-problem/route.ts`)

Create a new API route that handles:

#### POST /api/math-problem (Generate Problem)
- Use Google's Gemini AI to generate a math word problem
- The AI should return JSON with:
  ```json
  {
    "problem_text": "A bakery sold 45 cupcakes...",
    "correct_answer": 15
  }
  ```
- Save the problem to `math_problem_sessions` table
- Return the problem and session ID to the frontend

#### POST /api/math-problem/submit (Submit Answer)
- Receive the session ID and user's answer
- Check if the answer is correct
- Use AI to generate personalized feedback based on:
  - The original problem
  - The correct answer
  - The user's answer
  - Whether they got it right or wrong
- Save the submission to `math_problem_submissions` table
- Return the feedback and correctness to the frontend

### 3. Requirements Checklist

- [x] AI generates appropriate Primary 5 level math problems
- [x] Problems and answers are saved to Supabase
- [x] User submissions are saved with feedback
- [x] AI generates helpful, personalized feedback
- [x] UI is clean and mobile-responsive
- [x] Error handling for API failures
- [x] Loading states during API calls

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) and import your repository
3. Add your environment variables in Vercel's project settings
4. Deploy!

## Assessment Submission

When submitting your assessment, provide:

1. **GitHub Repository URL**: Make sure it's public
2. **Live Demo URL**: Your Vercel deployment
3. **Supabase Credentials**: Add these to your README for testing:
   ```
   SUPABASE_URL: https://wzvyatbanyciarhjdkcl.supabase.co
   SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6dnlhdGJhbnljaWFyaGpka2NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2ODk3MDMsImV4cCI6MjA3NjI2NTcwM30.96lO1HIBmMgqXQ4-_kQhwsIIac9E8hDN0crXmk3cehc
   ```

## Implementation Notes

*Please fill in this section with any important notes about your implementation, design decisions, challenges faced, or features you're particularly proud of.*

### 1. AI‑Generated Math Problems
- **Prompt Design**:  
  - Crafted multiple system prompts that constrain the AI to generate *Primary 5 level* math problems.  
  - Include explicit instructions for json format (e.g., question text, correct answer, & user's answer feedback).
- **Validation**:  
  - Post‑process AI output to ensure it’s valid JSON or a structured object.  

---

### 2. Persistence in Supabase
- **Schema Design**:
  - `math_problems_session` table: `id`,`problem_text`, `correct_answer`, `created_at`.
  - `math_problems_submissions` table: `id`, `ssession_id`, `user_answer`, `is_correct`, `feedback_text`, `created_at`.
- **Insert Flow**:
  - After generating a problem, insert into `math_problems_session`.
  - On user submission, insert into `math_problems_submissions` with AI feedback attached.
- **Security**:
  - Use Supabase Row Level Security (RLS) to ensure users can only read/write their own submissions.
  - Consider JWT‑based auth for user sessions.

---

### 3. User Submissions + Feedback
- **Submission Flow**:
  - User submits answer → API endpoint receives it → AI evaluates correctness and generates feedback → Save both answer and feedback to `math_problems_submissions`.
- **Feedback Generation**:
  - Prompt AI with context: original problem, user’s answer, and guidelines for constructive, encouraging feedback.
  - Ensure tone is supportive and educational, not punitive.

---

### 4. UI/UX (Clean + Mobile‑Responsive)
- **Framework**:
  - Use Next.js with Tailwind CSS for responsive design.
  - Mobile‑first grid/flexbox design.
  - Clear separation of problem text, input field, and feedback area.
- **Accessibility**:
  - Semantic HTML for screen readers.
  - High‑contrast color palette and scalable font sizes.

---

### 5. Error Handling
- **API Failures**:
  - Wrap AI and Supabase calls in `try/catch`.
  - Show user‑friendly error messages (“Something went wrong, please try again”).
  - Log errors to monitoring service.

---

### 6. Loading States
- **UI Indicators**:
  - Use buttons as loader indicator.
  - Disable "Generate New Problem" and "Submit Answer" buttons while awaiting responses from API calls.
- **Progressive Feedback**:
  - Show “Generating problem…” or “Evaluating answer…” messages to reassure users.

## Additional Features (Optional)

If you have time, consider adding:

- [ ] Difficulty levels (Easy/Medium/Hard)
- [ ] Problem history view
- [ ] Score tracking
- [ ] Different problem types (addition, subtraction, multiplication, division)
- [ ] Hints system
- [ ] Step-by-step solution explanations

---

Good luck with your assessment! 🎯
