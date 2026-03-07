$root = Split-Path -Path $MyInvocation.MyCommand.Definition -Parent
Set-Location -Path $root\..\
$files = Get-ChildItem -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.Length -gt (5*1024*1024) } | Sort-Object Length -Descending | Select-Object FullName, @{Name='MB';Expression={[math]::Round($_.Length/1MB,2)}, @{Name='Bytes';Expression={$_.Length}} }
$files | ConvertTo-Json -Depth 5 | Out-File -Encoding utf8 C:\Users\kesvi\nextjs_large.json
Write-Output 'WROTE C:\Users\kesvi\nextjs_large.json'