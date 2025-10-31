import { createClient } from '@supabase/supabase-js';

// Note: For Cloudflare Workers, we'll use a simpler approach
// since google-auth-library and jsonwebtoken may have compatibility issues

// Supabase client
const supabaseUrl = SUPABASE_URL;
const supabaseKey = SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Helper function to handle CORS
function handleCORS(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
}

// Simple JWT verification for Cloudflare Workers
function verifyToken(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  // Simple JWT verification - in production, use a proper JWT library
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);
    
    if (payload.exp && payload.exp < now) return null;
    
    return payload;
  } catch (error) {
    return null;
  }
}

// Google OAuth verification (simplified)
async function verifyGoogleToken(idToken) {
  try {
    // In a real implementation, you'd verify this with Google's API
    // For now, we'll decode the token (not secure for production)
    const parts = idToken.split('.');
    if (parts.length !== 3) throw new Error('Invalid token format');
    
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (error) {
    throw new Error('Invalid Google token');
  }
}

// Parse DOCX content (simplified version for Cloudflare Workers)
function parseDocxContent(content) {
  // This is a simplified parser - in production, you'd want to use a proper DOCX parsing library
  // For now, we'll parse text-based questions
  const lines = content.split('\n').filter(line => line.trim());
  const questions = [];
  const errors = [];
  
  let currentQuestion = null;
  let lineNumber = 0;
  
  for (const line of lines) {
    lineNumber++;
    
    // Detect question start (numbered format)
    const questionMatch = line.match(/^(\d+)\.\s*(.+)$/);
    if (questionMatch) {
      // Save previous question if exists
      if (currentQuestion && currentQuestion.options.length > 0) {
        questions.push(currentQuestion);
      }
      
      // Start new question
      currentQuestion = {
        stem: questionMatch[2],
        question_type: 'single_choice',
        options: [],
        correct_answer: [],
        explanation: '',
        difficulty: 'medium',
        raw_lines: [line]
      };
      continue;
    }
    
    if (!currentQuestion) continue;
    
    currentQuestion.raw_lines.push(line);
    
    // Detect options (A., B., C., D. format)
    const optionMatch = line.match(/^([A-D])\.?\s*(.+)$/);
    if (optionMatch) {
      currentQuestion.options.push({
        label: optionMatch[1],
        text: optionMatch[2],
        order_index: currentQuestion.options.length
      });
      continue;
    }
    
    // Detect answer
    const answerMatch = line.match(/^Answer:\s*(.+)$/i);
    if (answerMatch) {
      const answer = answerMatch[1].trim();
      if (answer.includes(',')) {
        currentQuestion.question_type = 'multiple_choice';
        currentQuestion.correct_answer = answer.split(',').map(a => a.trim());
      } else if (answer.toLowerCase() === 'true' || answer.toLowerCase() === 'false') {
        currentQuestion.question_type = 'true_false';
        currentQuestion.correct_answer = [answer.toLowerCase()];
      } else {
        currentQuestion.correct_answer = [answer];
      }
      continue;
    }
    
    // Detect explanation
    const explanationMatch = line.match(/^Explanation:\s*(.+)$/i);
    if (explanationMatch) {
      currentQuestion.explanation = explanationMatch[1];
      continue;
    }
    
    // Detect difficulty
    const difficultyMatch = line.match(/^Difficulty:\s*(.+)$/i);
    if (difficultyMatch) {
      const difficulty = difficultyMatch[1].toLowerCase();
      if (['easy', 'medium', 'hard'].includes(difficulty)) {
        currentQuestion.difficulty = difficulty;
      }
    }
  }
  
  // Save last question
  if (currentQuestion && currentQuestion.options.length > 0) {
    questions.push(currentQuestion);
  }
  
  return { questions, errors };
}

// API Routes
export default {
  async fetch(request, env, ctx) {
    // Assign env variables to global scope for use in functions
    Object.assign(globalThis, env);
    
    const corsResponse = handleCORS(request);
    if (corsResponse) return corsResponse;

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    try {
      // Auth routes
      if (path === '/api/auth/google' && method === 'POST') {
        const { id_token } = await request.json();
        
        try {
          const payload = await verifyGoogleToken(id_token);
          const { email, name, picture, sub: googleId } = payload;
          
          // Check if user exists
          const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
          
          let user;
          if (!existingUser) {
            // Create new user
            const { data: newUser } = await supabase
              .from('users')
              .insert({
                email,
                name,
                picture,
                google_id: googleId,
                is_admin: false
              })
              .select()
              .single();
            user = newUser;
          } else {
            user = existingUser;
          }
          
          // Create JWT token (simplified)
          const header = { alg: 'HS256', typ: 'JWT' };
          const tokenPayload = {
            sub: user.email,
            userId: user.id,
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
          };
          
          const token = btoa(JSON.stringify(header)) + '.' + 
                       btoa(JSON.stringify(tokenPayload)) + '.' + 
                       btoa('signature'); // Simplified signature
          
          return new Response(
            JSON.stringify({ access_token: token, token_type: 'bearer' }),
            { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        } catch (error) {
          return new Response(
            JSON.stringify({ error: 'Authentication failed', details: error.message }),
            { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }
      }

      if (path === '/api/auth/me' && method === 'GET') {
        const decoded = await verifyToken(request);
        if (!decoded) {
          return new Response(
            JSON.stringify({ error: 'Unauthorized' }),
            { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }

        const { data: user } = await supabase
          .from('users')
          .select('*')
          .eq('email', decoded.sub)
          .single();

        return new Response(
          JSON.stringify(user),
          { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      // Questions routes
      if (path === '/api/questions' && method === 'GET') {
        const { data: questions } = await supabase
          .from('questions')
          .select(`
            *,
            options (*),
            tags (*)
          `);

        return new Response(
          JSON.stringify(questions),
          { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      if (path === '/api/questions' && method === 'POST') {
        const decoded = await verifyToken(request);
        if (!decoded) {
          return new Response(
            JSON.stringify({ error: 'Unauthorized' }),
            { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }

        const questionData = await request.json();
        
        // Insert question
        const { data: question } = await supabase
          .from('questions')
          .insert({
            stem: questionData.stem,
            question_type: questionData.question_type,
            correct_answer: questionData.correct_answer,
            explanation: questionData.explanation,
            difficulty: questionData.difficulty
          })
          .select()
          .single();

        // Insert options
        if (questionData.options && questionData.options.length > 0) {
          await supabase
            .from('options')
            .insert(
              questionData.options.map(option => ({
                question_id: question.id,
                text: option.text,
                label: option.label,
                order_index: option.order_index
              }))
            );
        }

        return new Response(
          JSON.stringify(question),
          { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      // File upload route (simplified for text content)
      if (path === '/api/upload-docx' && method === 'POST') {
        const decoded = await verifyToken(request);
        if (!decoded) {
          return new Response(
            JSON.stringify({ error: 'Unauthorized' }),
            { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }

        const formData = await request.formData();
        const file = formData.get('file');
        
        if (!file) {
          return new Response(
            JSON.stringify({ error: 'No file provided' }),
            { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }

        // Read file content
        const content = await file.text();
        const { questions, errors } = parseDocxContent(content);
        
        // Insert questions into database
        const insertedQuestions = [];
        for (const questionData of questions) {
          const { data: question } = await supabase
            .from('questions')
            .insert({
              stem: questionData.stem,
              question_type: questionData.question_type,
              correct_answer: questionData.correct_answer,
              explanation: questionData.explanation,
              difficulty: questionData.difficulty
            })
            .select()
            .single();

          // Insert options
          if (questionData.options && questionData.options.length > 0) {
            await supabase
              .from('options')
              .insert(
                questionData.options.map(option => ({
                  question_id: question.id,
                  text: option.text,
                  label: option.label,
                  order_index: option.order_index
                }))
              );
          }

          insertedQuestions.push(question);
        }

        const importReport = {
          filename: file.name,
          total_lines: content.split('\n').length,
          successful_imports: insertedQuestions.length,
          failed_imports: errors.length,
          errors: errors,
          created_by: decoded.userId
        };

        return new Response(
          JSON.stringify(importReport),
          { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      // Quiz routes
      if (path === '/api/quizzes/generate' && method === 'POST') {
        const decoded = await verifyToken(request);
        if (!decoded) {
          return new Response(
            JSON.stringify({ error: 'Unauthorized' }),
            { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }

        const { count, question_type, difficulty, topic } = await request.json();
        
        let query = supabase.from('questions').select('*');
        
        if (question_type) {
          query = query.eq('question_type', question_type);
        }
        if (difficulty) {
          query = query.eq('difficulty', difficulty);
        }
        
        const { data: questions } = await query;
        
        if (questions.length < count) {
          return new Response(
            JSON.stringify({ error: 'Not enough questions matching criteria' }),
            { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }

        // Randomly select questions
        const selectedQuestions = questions
          .sort(() => Math.random() - 0.5)
          .slice(0, count);
        
        const questionIds = selectedQuestions.map(q => q.id);
        
        const { data: quiz } = await supabase
          .from('quizzes')
          .insert({
            title: `Quiz - ${topic || 'General'}`,
            description: `Generated quiz with ${selectedQuestions.length} questions`,
            question_ids: questionIds,
            created_by: decoded.userId
          })
          .select()
          .single();

        return new Response(
          JSON.stringify(quiz),
          { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      // Tags route
      if (path === '/api/tags' && method === 'GET') {
        const { data: tags } = await supabase
          .from('tags')
          .select('*');

        return new Response(
          JSON.stringify(tags),
          { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      // History route
      if (path === '/api/history' && method === 'GET') {
        const decoded = await verifyToken(request);
        if (!decoded) {
          return new Response(
            JSON.stringify({ error: 'Unauthorized' }),
            { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }

        const { data: attempts } = await supabase
          .from('quiz_attempts')
          .select('*')
          .eq('user_id', decoded.userId)
          .order('completed_at', { ascending: false });

        return new Response(
          JSON.stringify(attempts),
          { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );

    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Internal server error', details: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
  },
};