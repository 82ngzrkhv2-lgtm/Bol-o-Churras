const fs = require('fs');

async function run() {
  const query = fs.readFileSync('supabase/migrations/005_fix_rls_recursion.sql', 'utf-8');
  
  const res = await fetch("https://kvgeuxferrsxiqyoouen.supabase.co/rest/v1/rpc/query", {
    method: "POST",
    headers: {
      "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2Z2V1eGZlcnJzeGlxeW9vdWVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjMzNzAwMiwiZXhwIjoyMDk3OTEzMDAyfQ.4k6XbITDyfuCFfTWjN29qa-ARZc7chtIauewSsEfwFo",
      "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2Z2V1eGZlcnJzeGlxeW9vdWVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjMzNzAwMiwiZXhwIjoyMDk3OTEzMDAyfQ.4k6XbITDyfuCFfTWjN29qa-ARZc7chtIauewSsEfwFo",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query })
  });

  console.log(res.status);
  console.log(await res.text());
}

run().catch(console.error);
