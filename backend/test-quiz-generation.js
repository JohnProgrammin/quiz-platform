/**
 * End-to-end quiz generation test
 * Tests: Signup → Note Upload → Quiz Generation
 */

const http = require('http');
const querystring = require('querystring');

const BASE_URL = 'http://localhost:3001';
let token = '';
let noteId = '';

function makeRequest(method, path, body = null, authToken = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': method === 'POST' ? 'application/json' : 'application/json',
      },
    };

    if (authToken) {
      options.headers['Authorization'] = `Bearer ${authToken}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch {
          resolve(data);
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('QUIZ GENERATION END-TO-END TEST');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // TEST 1: Signup
    console.log('1️⃣ Creating user...');
    const signupResp = await makeRequest('POST', '/api/v1/auth/signup', {
      username: `test_${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      password: 'TestPassword123!',
    });

    if (!signupResp.token) {
      console.log('❌ Signup failed:', signupResp);
      return;
    }

    token = signupResp.token;
    console.log('✅ User created, token obtained\n');

    // TEST 2: Upload Note
    console.log('2️⃣ Uploading study note...');
    console.log('⚠️  Note: This test uses API directly, not multipart upload');
    console.log('    (In real scenario, notes come from file upload)\n');

    const noteContent = `
Photosynthesis is the process by which plants convert light energy into chemical energy stored in glucose.
This occurs in chloroplasts through two main stages: light-dependent reactions and the Calvin cycle.
Light reactions occur in thylakoids where chlorophyll absorbs photons and excites electrons.
The electron transport chain pumps protons creating an ATP synthase gradient.
Water splitting releases oxygen. NADPH is also produced.
The Calvin cycle uses ATP and NADPH to fix CO2 into glucose via RuBisCO enzyme.
This is essential for all aerobic life on Earth.
    `;

    // For testing, we'll create a note directly in the database
    const { sql } = require('./config/database.serverless');
    const { v4: uuidv4 } = require('uuid');

    const noteId_val = uuidv4();
    const userId = signupResp.user.id;

    const createNoteResult = await sql`
      INSERT INTO notes (id, user_id, title, filename, file_size, file_type, storage_key, storage_url, content, content_length, word_count, created_at, updated_at)
      VALUES (
        ${noteId_val},
        ${userId},
        ${'test_note.txt'},
        ${'test_note.txt'},
        ${noteContent.length},
        ${'text/plain'},
        ${'notes/' + userId + '/' + noteId_val + '/test_note.txt'},
        ${'file://test_note.txt'},
        ${noteContent},
        ${noteContent.length},
        ${noteContent.split(/\s+/).length},
        NOW(),
        NOW()
      )
      RETURNING id
    `;

    noteId = noteId_val;
    console.log('✅ Note created directly in database\n');

    // TEST 3: Generate Quiz
    console.log('3️⃣ Generating quiz using Groq AI...');
    const quizResp = await makeRequest(
      'POST',
      '/api/v1/quiz/generate',
      {
        noteId: noteId,
      },
      token
    );

    console.log('Quiz response:');
    console.log(JSON.stringify(quizResp, null, 2).substring(0, 500));
    console.log('\n');

    // Check result
    if (quizResp.data?.questionCount || quizResp.data?.questions) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅✅✅ SUCCESS!');
      console.log('✅ Quiz generated: ' + (quizResp.data?.questionCount || quizResp.data?.questions?.length) + ' questions');
      console.log('✅ Groq API is working properly!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    } else if (quizResp.error) {
      console.log('❌ Error:', quizResp.error);
      console.log('Full response:', quizResp);
    } else {
      console.log('❌ Unexpected response format');
      console.log('Response:', quizResp);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }

  process.exit(0);
}

// Wait for server to be ready
setTimeout(runTests, 2000);
