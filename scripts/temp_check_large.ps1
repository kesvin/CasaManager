$src = 'C:\Users\kesvi\temp_clean_casamgr'
$threshold = 104857600
$matches = Get-ChildItem -Path $src -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.Length -gt $threshold } | Select-Object FullName, @{Name='MB';Expression={[math]::Round($_.Length/1MB,2)}}
$matches | ConvertTo-Json -Depth 5 | Out-File C:\Users\kesvi\temp_clean_large_find.json -Encoding utf8
Get-Content C:\Users\kesvi\temp_clean_large_find.json -Raw
