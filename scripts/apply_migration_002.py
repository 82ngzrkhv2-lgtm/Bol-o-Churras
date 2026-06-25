import urllib.request
import urllib.error
import json
import ssl

SERVICE_ROLE = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2Z2V1eGZlcnJzeGlxeW9vdWVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjMzNzAwMiwiZXhwIjoyMDk3OTEzMDAyfQ.4k6XbITDyfuCFfTWjN29qa-ARZc7chtIauewSsEfwFo"
PROJECT_ID = "kvgeuxferrsxiqyoouen"
BASE_URL = f"https://{PROJECT_ID}.supabase.co"

with open("supabase/migrations/002_receipts_storage.sql", encoding="utf-8") as f:
    full_sql = f.read()

url = f"https://api.supabase.com/v1/projects/{PROJECT_ID}/database/query"
pg_url = f"{BASE_URL}/pg/query"

ctx = ssl.create_default_context()
data = json.dumps({"query": full_sql}).encode("utf-8")

print("Aplicando Migration 002 no Supabase...")
for url_try in [pg_url]:
    req = urllib.request.Request(url_try, data=data, headers={
        "apikey": SERVICE_ROLE,
        "Authorization": f"Bearer {SERVICE_ROLE}",
        "Content-Type": "application/json",
    }, method="POST")
    try:
        with urllib.request.urlopen(req, context=ctx) as resp:
            print("✅ Migration aplicada com sucesso!")
            print(resp.read().decode())
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"❌ Erro ao aplicar: {body}")
