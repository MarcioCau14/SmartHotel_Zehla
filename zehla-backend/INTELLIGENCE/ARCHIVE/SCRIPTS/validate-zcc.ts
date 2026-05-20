const http = require('http');

const endpoints = [
  { name: 'Overview', path: '/api/zcc/overview' },
  { name: 'Leads', path: '/api/zcc/leads' },
  { name: 'Propriedades', path: '/api/zcc/properties' },
  { name: 'Financeiro', path: '/api/zcc/financeiro' },
  { name: 'Equipe', path: '/api/zcc/team' },
  { name: 'Segurança', path: '/api/security' }, // Note: Using existing endpoint
  { name: 'Brain Health', path: '/api/brain/health' }
];

const PORT = process.env.PORT || 3000;

async function checkEndpoint(endpoint: unknown) {
  const start = Date.now();
  try {
    const res = await fetch(`http://localhost:${PORT}${endpoint.path}`);
    const text = await res.text();
    const latency = Date.now() - start;
    let isJson = true;
    let parsed = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      isJson = false;
    }

    if (res.status === 200 && isJson) {
       - ${latency}ms`);
      if (endpoint.name === 'Leads') {
        
      }
      if (endpoint.name === 'Propriedades') {
        .length} propriedades lidas`);
      }
      return true;
    } else {
       - Status: ${res.status} | JSON? ${isJson}`);
      if (res.status === 500) {
        
      }
      return false;
    }
  } catch (err: unknown) {
    : Failed to connect (${err.message}). Is dev server running?`);
    return false;
  }
}

async function runTests() {
  try {
  
  let passed = 0;
  
  for (const ep of endpoints) {
    const success = await checkEndpoint(ep);
    if (success) passed++;
  }
  
  
  if (passed === endpoints.length) {
    
  } else {
    
  }
}

runTests();
