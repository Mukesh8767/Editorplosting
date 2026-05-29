import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ngyvtakiooclmhntprrm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5neXZ0YWtpb29jbG1obnRwcnJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzODEyODQsImV4cCI6MjA4Nzk1NzI4NH0.yWkDOQCvBVwltbvQyGlEUhUUPVoMa_WtHMw4topGnT8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase
    .from('posts')
    .select('*, categories(title, slug), profiles(full_name)')
    .limit(1);
    
  console.log('--- profiles ---');
  console.log(JSON.stringify(data?.[0], null, 2));
  console.log('error:', error?.message);
  
  const { data: data2, error: error2 } = await supabase
    .from('posts')
    .select('*, categories(title, slug), author:profiles!author_id(full_name)')
    .limit(1);

  console.log('--- author explicit ---');
  console.log(JSON.stringify(data2?.[0], null, 2));
  console.log('error2:', error2?.message);
}

test();
