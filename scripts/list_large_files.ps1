$root = "C:\Users\kesvi\OneDrive\Trabajo VIVECODING\Proyecto CasaManager"
Set-Location -Path $root
$results = Get-ChildItem -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.Length -gt 5MB } | Sort-Object Length -Descending | Select-Object FullName, @{Name='MB';Expression={[math]::Round($_.Length/1MB,2)}}
$results | ConvertTo-Json -Depth 5 | Out-File -Encoding utf8 "$env:USERPROFILE\large_files.json"
Write-Output "WROTE $env:USERPROFILE\large_files.json"
$results | Format-Table -AutoSize
