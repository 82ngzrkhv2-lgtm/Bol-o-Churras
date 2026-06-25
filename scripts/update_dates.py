import urllib.request
import json

SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2Z2V1eGZlcnJzeGlxeW9vdWVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjMzNzAwMiwiZXhwIjoyMDk3OTEzMDAyfQ.4k6XbITDyfuCFfTWjN29qa-ARZc7chtIauewSsEfwFo'
URL = 'https://kvgeuxferrsxiqyoouen.supabase.co/rest/v1/matches?status=eq.scheduled'

headers = {
    'apikey': SERVICE_ROLE,
    'Authorization': f'Bearer {SERVICE_ROLE}',
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
}

req = urllib.request.Request(URL, headers=headers)
try:
    with urllib.request.urlopen(req) as r:
        matches = json.loads(r.read())
        for m in matches:
            old_date = m['match_date']
            if '2026-06-' in old_date:
                new_date = old_date.replace('2026-06-', '2026-07-')
                patch_url = f"https://kvgeuxferrsxiqyoouen.supabase.co/rest/v1/matches?id=eq.{m['id']}"
                patch_req = urllib.request.Request(patch_url, data=json.dumps({'match_date': new_date}).encode('utf-8'), headers=headers, method='PATCH')
                urllib.request.urlopen(patch_req)
        print('✅ Database updated!')
except Exception as e:
    print(f'Error: {e}')
