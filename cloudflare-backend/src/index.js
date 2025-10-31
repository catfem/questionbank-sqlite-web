import { createServer } from 'http'
import { fetchRequestHandler } from '@remix-run/cloudflare'

// Cloudflare Workers adapter for the Question Bank API
export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url)
      
      // Handle CORS
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': env.FRONTEND_URL || '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        })
      }

      // Route handling
      if (url.pathname === '/health') {
        return new Response(JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString()
        }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': env.FRONTEND_URL || '*',
          },
        })
      }

      // Google OAuth endpoint
      if (url.pathname === '/api/auth/google' && request.method === 'POST') {
        return handleGoogleAuth(request, env)
      }

      // Get current user
      if (url.pathname === '/api/auth/me' && request.method === 'GET') {
        return handleGetCurrentUser(request, env)
      }

      // Questions endpoints
      if (url.pathname === '/api/questions' && request.method === 'GET') {
        return handleGetQuestions(request, env)
      }

      if (url.pathname === '/api/questions' && request.method === 'POST') {
        return handleCreateQuestion(request, env)
      }

      // File upload endpoint
      if (url.pathname === '/api/upload-docx' && request.method === 'POST') {
        return handleUploadDocx(request, env)
      }

      // Quiz endpoints
      if (url.pathname === '/api/quizzes/generate' && request.method === 'POST') {
        return handleGenerateQuiz(request, env)
      }

      if (url.pathname.startsWith('/api/quizzes/') && request.method === 'GET') {
        return handleGetQuiz(request, env)
      }

      if (url.pathname.match(/\/api\/quizzes\/\d+\/attempt/) && request.method === 'POST') {
        return handleQuizAttempt(request, env)
      }

      // History endpoint
      if (url.pathname === '/api/history' && request.method === 'GET') {
        return handleGetHistory(request, env)
      }

      // Tags endpoints
      if (url.pathname === '/api/tags' && request.method === 'GET') {
        return handleGetTags(request, env)
      }

      if (url.pathname === '/api/tags' && request.method === 'POST') {
        return handleCreateTag(request, env)
      }

      return new Response('Not Found', { status: 404 })
      
    } catch (error) {
      console.error('Error handling request:', error)
      return new Response(JSON.stringify({
        error: 'Internal server error',
        message: error.message
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': env.FRONTEND_URL || '*',
        },
      })
    }
  }
}

// Google OAuth handler
async function handleGoogleAuth(request, env) {
  try {
    const { id_token } = await request.json()
    
    // Verify Google ID token (simplified for Cloudflare Workers)
    const userInfo = await verifyGoogleToken(id_token, env.GOOGLE_CLIENT_ID)
    
    // Store user in D1 database
    const user = await createUser(env.DB, userInfo)
    
    // Create JWT token
    const token = await createJWT(user, env.JWT_SECRET)
    
    return new Response(JSON.stringify({
      access_token: token,
      token_type: 'bearer'
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': env.FRONTEND_URL || '*',
      },
    })
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Authentication failed',
      message: error.message
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': env.FRONTEND_URL || '*',
      },
    })
  }
}

// Simplified Google token verification (in production, use proper verification)
async function verifyGoogleToken(idToken, clientId) {
  // This is a placeholder - in production, verify with Google's API
  // For now, decode the basic info from the token
  const payload = JSON.parse(atob(idToken.split('.')[1]))
  
  if (payload.aud !== clientId) {
    throw new Error('Invalid token audience')
  }
  
  return {
    email: payload.email,
    name: payload.name,
    picture: payload.picture,
    google_id: payload.sub,
  }
}

// Create user in D1 database
async function createUser(db, userInfo) {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO users (email, name, picture, google_id, is_admin, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `)
  
  await stmt.bind(
    userInfo.email,
    userInfo.name,
    userInfo.picture,
    userInfo.google_id,
    false,
    new Date().toISOString()
  ).run()
  
  return userInfo
}

// Create JWT token (simplified)
async function createJWT(user, secret) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const payload = {
    sub: user.email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  }
  
  // Simple JWT encoding (in production, use proper crypto)
  const encodedHeader = btoa(JSON.stringify(header))
  const encodedPayload = btoa(JSON.stringify(payload))
  const signature = btoa(`${encodedHeader}.${encodedPayload}.${secret}`)
  
  return `${encodedHeader}.${encodedPayload}.${signature}`
}

// Get questions handler
async function handleGetQuestions(request, env) {
  const url = new URL(request.url)
  const skip = parseInt(url.searchParams.get('skip') || '0')
  const limit = parseInt(url.searchParams.get('limit') || '100')
  const questionType = url.searchParams.get('question_type')
  const difficulty = url.searchParams.get('difficulty')
  const tag = url.searchParams.get('tag')
  
  let query = 'SELECT * FROM questions'
  const params = []
  
  if (questionType) {
    query += ' WHERE question_type = ?'
    params.push(questionType)
  }
  
  if (difficulty) {
    query += params.length > 0 ? ' AND difficulty = ?' : ' WHERE difficulty = ?'
    params.push(difficulty)
  }
  
  if (tag) {
    query += params.length > 0 
      ? ' AND id IN (SELECT question_id FROM question_tags WHERE tag_id IN (SELECT id FROM tags WHERE name = ?))'
      : ' WHERE id IN (SELECT question_id FROM question_tags WHERE tag_id IN (SELECT id FROM tags WHERE name = ?))'
    params.push(tag)
  }
  
  query += ' LIMIT ? OFFSET ?'
  params.push(limit, skip)
  
  const stmt = env.DB.prepare(query)
  const result = await stmt.bind(...params).all()
  
  // Get options for each question
  const questions = await Promise.all(
    result.results.map(async (question) => {
      const optionsStmt = env.DB.prepare('SELECT * FROM options WHERE question_id = ? ORDER BY order_index')
      const optionsResult = await optionsStmt.bind(question.id).all()
      
      const tagsStmt = env.DB.prepare(`
        SELECT t.* FROM tags t 
        JOIN question_tags qt ON t.id = qt.tag_id 
        WHERE qt.question_id = ?
      `)
      const tagsResult = await tagsStmt.bind(question.id).all()
      
      return {
        ...question,
        options: optionsResult.results,
        tags: tagsResult.results
      }
    })
  )
  
  return new Response(JSON.stringify(questions), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': env.FRONTEND_URL || '*',
    },
  })
}

// Create question handler
async function handleCreateQuestion(request, env) {
  const questionData = await request.json()
  
  const stmt = env.DB.prepare(`
    INSERT INTO questions (stem, question_type, correct_answer, explanation, difficulty, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `)
  
  const result = await stmt.bind(
    questionData.stem,
    questionData.question_type,
    JSON.stringify(questionData.correct_answer),
    questionData.explanation || null,
    questionData.difficulty,
    new Date().toISOString()
  ).run()
  
  const questionId = result.meta.last_row_id
  
  // Add options
  for (let i = 0; i < questionData.options.length; i++) {
    const optionStmt = env.DB.prepare(`
      INSERT INTO options (question_id, text, label, order_index)
      VALUES (?, ?, ?, ?)
    `)
    
    await optionStmt.bind(
      questionId,
      questionData.options[i].text,
      questionData.options[i].label,
      i
    ).run()
  }
  
  // Add tags if provided
  if (questionData.tags) {
    for (const tagName of questionData.tags) {
      let tagId
      
      // Check if tag exists
      const tagStmt = env.DB.prepare('SELECT id FROM tags WHERE name = ?')
      const tagResult = await tagStmt.bind(tagName).first()
      
      if (tagResult) {
        tagId = tagResult.id
      } else {
        // Create new tag
        const createTagStmt = env.DB.prepare('INSERT INTO tags (name) VALUES (?)')
        const createResult = await createTagStmt.bind(tagName).run()
        tagId = createResult.meta.last_row_id
      }
      
      // Link question to tag
      const linkStmt = env.DB.prepare('INSERT INTO question_tags (question_id, tag_id) VALUES (?, ?)')
      await linkStmt.bind(questionId, tagId).run()
    }
  }
  
  return new Response(JSON.stringify({ id: questionId }), {
    status: 201,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': env.FRONTEND_URL || '*',
    },
  })
}

// Upload DOCX handler (simplified for Cloudflare Workers)
async function handleUploadDocx(request, env) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    
    if (!file || !file.name.endsWith('.docx')) {
      return new Response(JSON.stringify({
        error: 'Only .docx files are supported'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': env.FRONTEND_URL || '*',
        },
      })
    }
    
    // For Cloudflare Workers, we'll use a simplified parsing approach
    // In a real implementation, you'd need to use a DOCX parsing library compatible with Workers
    const arrayBuffer = await file.arrayBuffer()
    const text = new TextDecoder().decode(arrayBuffer)
    
    // Simple text parsing (this is basic - real DOCX parsing would require a proper library)
    const questions = parseTextToQuestions(text)
    
    // Import questions to database
    let successfulImports = 0
    let errors = []
    
    for (const question of questions) {
      try {
        await saveQuestionToDatabase(env.DB, question)
        successfulImports++
      } catch (error) {
        errors.push({
          line_number: successfulImports + errors.length + 1,
          content: question.stem || 'Unknown',
          error: error.message
        })
      }
    }
    
    const importReport = {
      filename: file.name,
      total_lines: text.split('\n').length,
      successful_imports: successfulImports,
      failed_imports: errors.length,
      errors: errors,
      created_at: new Date().toISOString()
    }
    
    return new Response(JSON.stringify(importReport), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': env.FRONTEND_URL || '*',
      },
    })
    
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Upload failed',
      message: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': env.FRONTEND_URL || '*',
      },
    })
  }
}

// Simple text to questions parser (placeholder)
function parseTextToQuestions(text) {
  const lines = text.split('\n').filter(line => line.trim())
  const questions = []
  
  let currentQuestion = null
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // Detect question number
    if (line.match(/^\d+\./)) {
      if (currentQuestion) {
        questions.push(currentQuestion)
      }
      
      currentQuestion = {
        stem: line,
        question_type: 'single',
        correct_answer: ['A'],
        explanation: null,
        difficulty: 'medium',
        options: []
      }
    }
    
    // Detect options
    if (line.match(/^[A-D]\./)) {
      if (currentQuestion) {
        currentQuestion.options.push({
          text: line.substring(3).trim(),
          label: line[0],
          order_index: currentQuestion.options.length
        })
      }
    }
    
    // Detect answer
    if (line.toLowerCase().startsWith('answer:')) {
      if (currentQuestion) {
        const answer = line.substring(7).trim()
        currentQuestion.correct_answer = [answer]
      }
    }
  }
  
  if (currentQuestion) {
    questions.push(currentQuestion)
  }
  
  return questions
}

// Save question to database
async function saveQuestionToDatabase(db, question) {
  const stmt = db.prepare(`
    INSERT INTO questions (stem, question_type, correct_answer, explanation, difficulty, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `)
  
  const result = await stmt.bind(
    question.stem,
    question.question_type,
    JSON.stringify(question.correct_answer),
    question.explanation,
    question.difficulty,
    new Date().toISOString()
  ).run()
  
  const questionId = result.meta.last_row_id
  
  // Add options
  for (const option of question.options) {
    const optionStmt = db.prepare(`
      INSERT INTO options (question_id, text, label, order_index)
      VALUES (?, ?, ?, ?)
    `)
    
    await optionStmt.bind(
      questionId,
      option.text,
      option.label,
      option.order_index
    ).run()
  }
  
  return questionId
}

// Other handlers would be implemented similarly...
async function handleGetCurrentUser(request, env) {
  // Implementation for getting current user
  return new Response(JSON.stringify({ error: 'Not implemented' }), {
    status: 501,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': env.FRONTEND_URL || '*',
    },
  })
}

async function handleGenerateQuiz(request, env) {
  // Implementation for quiz generation
  return new Response(JSON.stringify({ error: 'Not implemented' }), {
    status: 501,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': env.FRONTEND_URL || '*',
    },
  })
}

async function handleGetQuiz(request, env) {
  // Implementation for getting quiz
  return new Response(JSON.stringify({ error: 'Not implemented' }), {
    status: 501,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': env.FRONTEND_URL || '*',
    },
  })
}

async function handleQuizAttempt(request, env) {
  // Implementation for quiz attempt
  return new Response(JSON.stringify({ error: 'Not implemented' }), {
    status: 501,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': env.FRONTEND_URL || '*',
    },
  })
}

async function handleGetHistory(request, env) {
  // Implementation for getting history
  return new Response(JSON.stringify({ error: 'Not implemented' }), {
    status: 501,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': env.FRONTEND_URL || '*',
    },
  })
}

async function handleGetTags(request, env) {
  // Implementation for getting tags
  return new Response(JSON.stringify({ error: 'Not implemented' }), {
    status: 501,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': env.FRONTEND_URL || '*',
    },
  })
}

async function handleCreateTag(request, env) {
  // Implementation for creating tag
  return new Response(JSON.stringify({ error: 'Not implemented' }), {
    status: 501,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': env.FRONTEND_URL || '*',
    },
  })
}