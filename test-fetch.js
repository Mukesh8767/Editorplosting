const https = require('https');

const options = {
  hostname: 'ngyvtakiooclmhntprrm.supabase.co',
  port: 443,
  path: '/rest/v1/posts?select=*,categories(title,slug),profiles(full_name)&limit=1',
  method: 'GET',
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5neXZ0YWtpb29jbG1obnRwcnJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzODEyODQsImV4cCI6MjA4Nzk1NzI4NH0.yWkDOQCvBVwltbvQyGlEUhUUPVoMa_WtHMw4topGnT8',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5neXZ0YWtpb29jbG1obnRwcnJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzODEyODQsImV4cCI6MjA4Nzk1NzI4NH0.yWkDOQCvBVwltbvQyGlEUhUUPVoMa_WtHMw4topGnT8'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (d) => {
    data += d;
  });
  res.on('end', () => {
    console.log('DATA:', data);
  });
});

req.on('error', (e) => {
  console.error(e);
});

req.end();
