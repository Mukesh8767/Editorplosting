import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const supabase = createClient('https://ngyvtakiooclmhntprrm.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5neXZ0YWtpb29jbG1obnRwcnJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzODEyODQsImV4cCI6MjA4Nzk1NzI4NH0.yWkDOQCvBVwltbvQyGlEUhUUPVoMa_WtHMw4topGnT8');

async function test() {
  const { data: d1 } = await supabase.from('posts').select('*, profiles(full_name)').limit(1);
  const { data: d2 } = await supabase.from('posts').select('*, profiles!author_id(full_name)').limit(1);
  const { data: d3 } = await supabase.from('posts').select('*, author:profiles!author_id(full_name)').limit(1);

  const out = {
      default: d1,
      explicit: d2,
      alias: d3
  };
  fs.writeFileSync('d:\\Metaplugs\\frontend\\supabase-out.json', JSON.stringify(out, null, 2));
}

test();
