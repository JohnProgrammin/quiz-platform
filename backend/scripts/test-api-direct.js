require('dotenv').config();

const url = process.env.SUPABASE_URL;
const apiKey = process.env.SUPABASE_ANON_KEY;

console.log('Testing direct API access...');
console.log('URL:', url);
console.log('API Key:', apiKey ? apiKey.substring(0, 20) + '...' : 'MISSING');

fetch(`${url}/rest/v1/users?limit=1`, {
  headers: {
    'apikey': apiKey,
    'Authorization': `Bearer ${apiKey}`,
  }
})
.then(res => {
  console.log('Status:', res.status);
  return res.json();
})
.then(data => {
  console.log('Response:', data);
})
.catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
