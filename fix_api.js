import fs from 'fs';

// Read the API file
const filePath = './api/index.js';
let content = fs.readFileSync(filePath, 'utf8');

// Replace all res.status().json() calls with proper Node.js HTTP response methods
content = content.replace(/return res\.status\((\d+)\)\.json\(([^)]+)\);/g, (match, statusCode, jsonData) => {
  return `res.statusCode = ${statusCode};
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(${jsonData}));
  return;`;
});

// Replace res.status().send() calls
content = content.replace(/return res\.status\((\d+)\)\.send\(([^)]+)\);/g, (match, statusCode, data) => {
  return `res.statusCode = ${statusCode};
  res.setHeader('Content-Type', 'text/csv');
  res.end(${data});
  return;`;
});

// Replace standalone res.status().json() calls (without return)
content = content.replace(/res\.status\((\d+)\)\.json\(([^)]+)\);/g, (match, statusCode, jsonData) => {
  return `res.statusCode = ${statusCode};
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(${jsonData}));`;
});

// Write the fixed content back
fs.writeFileSync(filePath, content);
console.log('Fixed all res.status() calls in the API file');