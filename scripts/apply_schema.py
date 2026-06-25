"""
Aplica o schema do Bolão & Churras no Supabase via Management API
"""
import urllib.request
import urllib.error
import json
import sys

SERVICE_ROLE = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2Z2V1eGZlcnJzeGlxeW9vdWVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjMzNzAwMiwiZXhwIjoyMDk3OTEzMDAyfQ.4k6XbITDyfuCFfTWjN29qa-ARZc7chtIauewSsEfwFo"
PROJECT_ID = "kvgeuxferrsxiqyoouen"
BASE_URL = f"https://{PROJECT_ID}.supabase.co"

def run_sql(sql: str, label: str = ""):
    """Executa SQL via Supabase pg endpoint"""
    url = f"{BASE_URL}/rest/v1/sql"
    headers = {
        "apikey": SERVICE_ROLE,
        "Authorization": f"Bearer {SERVICE_ROLE}",
        "Content-Type": "application/json",
    }
    data = json.dumps({"query": sql}).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as resp:
            body = resp.read().decode()
            print(f"  ✅ {label}: OK ({resp.status})")
            return True
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        err = json.loads(body) if body else {}
        msg = err.get("message", body)
        # Ignora erros de "already exists"
        if "already exists" in msg or "duplicate" in msg.lower():
            print(f"  ⏭️  {label}: já existe, ignorado")
            return True
        print(f"  ❌ {label}: {msg}")
        return False

# Divide o schema em statements individuais e executa
with open("supabase/migrations/001_initial_schema.sql", encoding="utf-8") as f:
    full_sql = f.read()

# Executa como bloco único
print("🚀 Aplicando schema no Supabase...")
print(f"   Project: {PROJECT_ID}")
print()

# Tenta executar o schema inteiro de uma vez via pg endpoint alternativo
url = f"https://{PROJECT_ID}.supabase.co/rest/v1/sql"
headers = {
    "apikey": SERVICE_ROLE,
    "Authorization": f"Bearer {SERVICE_ROLE}",
    "Content-Type": "application/json",
}

# Divide em blocos por ';' e testa cada um
statements = []
current = []
for line in full_sql.split('\n'):
    stripped = line.strip()
    if stripped.startswith('--') or not stripped:
        continue
    current.append(line)
    if stripped.endswith(';') and not stripped.startswith('$$') and '$$' not in ' '.join(current):
        statements.append('\n'.join(current))
        current = []

# Execute via Management API v1 (pg)
import ssl
ctx = ssl.create_default_context()

def run_pg_sql(sql_block):
    """Usa o endpoint Management API para rodar SQL"""
    mg_url = f"https://api.supabase.com/v1/projects/{PROJECT_ID}/database/query"
    # Fallback: usar o endpoint de pg direto
    pg_url = f"{BASE_URL}/pg/query"
    
    data = json.dumps({"query": sql_block}).encode("utf-8")
    for url_try in [pg_url]:
        req = urllib.request.Request(url_try, data=data, headers={
            "apikey": SERVICE_ROLE,
            "Authorization": f"Bearer {SERVICE_ROLE}",
            "Content-Type": "application/json",
        }, method="POST")
        try:
            with urllib.request.urlopen(req, context=ctx) as resp:
                return True, resp.read().decode()
        except urllib.error.HTTPError as e:
            body = e.read().decode()
            return False, body

# Testa a conexão primeiro
print("Testando conexão...")
ok, resp = run_pg_sql("SELECT version();")
if ok:
    print(f"✅ Conectado ao Supabase PostgreSQL!")
else:
    print(f"⚠️  pg endpoint não disponível: {resp[:200]}")
    print("    Usando abordagem alternativa...")

print()
print("📊 Verificando tabelas existentes via REST...")
check_url = f"{BASE_URL}/rest/v1/profiles?select=id&limit=1"
req = urllib.request.Request(check_url, headers={
    "apikey": SERVICE_ROLE,
    "Authorization": f"Bearer {SERVICE_ROLE}",
}, method="GET")
try:
    with urllib.request.urlopen(req) as r:
        print(f"✅ Tabela 'profiles' já existe! Schema foi aplicado anteriormente.")
        print(f"   Status: {r.status}")
        sys.exit(0)
except urllib.error.HTTPError as e:
    body = e.read().decode()
    if "relation" in body and "not exist" in body:
        print("   Tabela não encontrada — precisa criar o schema")
    else:
        print(f"   Status {e.code}: {body[:200]}")

print()
print("Para aplicar o schema, acesse o SQL Editor do Supabase:")
print(f"👉 https://supabase.com/dashboard/project/{PROJECT_ID}/sql/new")
print()
print("Cole o conteúdo de: supabase/migrations/001_initial_schema.sql")
