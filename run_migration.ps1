$schema = Get-Content "supabase\migrations\003_lgpd_and_monetization.sql" -Raw
$body = @{query=$schema} | ConvertTo-Json -Depth 10

# Configurar HttpClient nativo do .NET (evita bugs do Invoke-WebRequest em alguns PS versions)
$client = [System.Net.Http.HttpClient]::new()
$client.DefaultRequestHeaders.Add("apikey", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2Z2V1eGZlcnJzeGlxeW9vdWVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjMzNzAwMiwiZXhwIjoyMDk3OTEzMDAyfQ.4k6XbITDyfuCFfTWjN29qa-ARZc7chtIauewSsEfwFo")
$client.DefaultRequestHeaders.Add("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2Z2V1eGZlcnJzeGlxeW9vdWVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjMzNzAwMiwiZXhwIjoyMDk3OTEzMDAyfQ.4k6XbITDyfuCFfTWjN29qa-ARZc7chtIauewSsEfwFo")

$content = [System.Net.Http.StringContent]::new($body, [System.Text.Encoding]::UTF8, "application/json")
$response = $client.PostAsync("https://kvgeuxferrsxiqyoouen.supabase.co/rest/v1/rpc/query", $content).GetAwaiter().GetResult()

Write-Output $response.StatusCode
Write-Output $response.Content.ReadAsStringAsync().GetAwaiter().GetResult()
