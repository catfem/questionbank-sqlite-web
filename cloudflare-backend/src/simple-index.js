// Simplified Cloudflare Workers API for Question Bank System
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }
    
    try {
      // Health check
      if (url.pathname === '/health') {
        return new Response(JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          service: 'question-bank-api'
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        })
      }
      
      // Mock authentication endpoint
      if (url.pathname === '/api/auth/google' && request.method === 'POST') {
        const body = await request.json()
        return new Response(JSON.stringify({
          access_token: 'mock-jwt-token-' + Date.now(),
          token_type: 'bearer',
          user: {
            email: 'test@example.com',
            name: 'Test User',
            picture: 'https://via.placeholder.com/40'
          }
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        })
      }
      
      // Mock questions endpoint
      if (url.pathname === '/api/questions' && request.method === 'GET') {
        const questions = [
          {
            id: 1,
            stem: "What is the capital of France?",
            question_type: "single",
            correct_answer: ["C"],
            explanation: "Paris is the capital of France.",
            difficulty: "easy",
            options: [
              { id: 1, text: "London", label: "A", order_index: 0 },
              { id: 2, text: "Berlin", label: "B", order_index: 1 },
              { id: 3, text: "Paris", label: "C", order_index: 2 },
              { id: 4, text: "Madrid", label: "D", order_index: 3 }
            ],
            tags: [{ id: 1, name: "Geography" }]
          },
          {
            id: 2,
            stem: "Which of the following are programming languages?",
            question_type: "multiple",
            correct_answer: ["A", "C"],
            explanation: "Python and Java are both popular programming languages.",
            difficulty: "medium",
            options: [
              { id: 5, text: "Python", label: "A", order_index: 0 },
              { id: 6, text: "HTML", label: "B", order_index: 1 },
              { id: 7, text: "Java", label: "C", order_index: 2 },
              { id: 8, text: "CSS", label: "D", order_index: 3 }
            ],
            tags: [{ id: 2, name: "Programming" }]
          }
        ]
        
        return new Response(JSON.stringify(questions), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        })
      }
      
      // Mock quiz generation
      if (url.pathname === '/api/quizzes/generate' && request.method === 'POST') {
        const body = await request.json()
        return new Response(JSON.stringify({
          id: 1,
          title: `Generated Quiz - ${body.topic || 'General'}`,
          description: `Quiz with ${body.count || 10} questions`,
          question_ids: [1, 2],
          created_by: 1,
          created_at: new Date().toISOString()
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        })
      }
      
      // Mock quiz attempt
      if (url.pathname.match(/\/api\/quizzes\/\d+\/attempt/) && request.method === 'POST') {
        const body = await request.json()
        const score = 80 // Mock score
        
        return new Response(JSON.stringify({
          id: 1,
          user_id: 1,
          quiz_id: 1,
          selected_answers: body.selected_answers,
          score: score,
          total_questions: 2,
          correct_answers: Math.round(score * 2 / 100),
          completed_at: new Date().toISOString()
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        })
      }
      
      // Mock history
      if (url.pathname === '/api/history' && request.method === 'GET') {
        const history = [
          {
            id: 1,
            quiz_id: 1,
            score: 85,
            total_questions: 10,
            correct_answers: 8,
            completed_at: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: 2,
            quiz_id: 2,
            score: 92,
            total_questions: 10,
            correct_answers: 9,
            completed_at: new Date(Date.now() - 172800000).toISOString()
          }
        ]
        
        return new Response(JSON.stringify(history), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        })
      }
      
      // Mock tags
      if (url.pathname === '/api/tags' && request.method === 'GET') {
        const tags = [
          { id: 1, name: "Geography" },
          { id: 2, name: "Programming" },
          { id: 3, name: "Mathematics" },
          { id: 4, name: "Science" }
        ]
        
        return new Response(JSON.stringify(tags), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        })
      }
      
      // Mock file upload
      if (url.pathname === '/api/upload-docx' && request.method === 'POST') {
        return new Response(JSON.stringify({
          id: 1,
          filename: "sample.docx",
          total_lines: 50,
          successful_imports: 5,
          failed_imports: 0,
          errors: [],
          created_at: new Date().toISOString()
        }), {
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        })
      }
      
      return new Response('Not Found', { 
        status: 404,
        headers: corsHeaders
      })
      
    } catch (error) {
      console.error('Error:', error)
      return new Response(JSON.stringify({
        error: 'Internal server error',
        message: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      })
    }
  }
}