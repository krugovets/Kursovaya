$ErrorActionPreference = 'Stop'
$base = Join-Path ([Environment]::GetFolderPath('Desktop')) 'Курсовой проект'
$kursov = Join-Path $base 'Фотки для курсового'
$lenta = Join-Path $base 'Фотки для ленты'
$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine('<?xml version="1.0" encoding="UTF-8"?>')
[void]$sb.AppendLine('<portfolio>')
Get-ChildItem $kursov -Directory | Sort-Object Name | ForEach-Object {
  $folder = $_.Name
  $files = Get-ChildItem $_.FullName -File | Sort-Object Name
  if ($files.Count -eq 0) { return }
  $relBase = 'Фотки для курсового/' + $folder.Replace('\','/')
  $idx = [Math]::Abs($folder.GetHashCode()) % $files.Count
  $cover = $files[$idx].Name
  [void]$sb.AppendLine('  <session title="' + [System.Security.SecurityElement]::Escape($folder) + '">')
  [void]$sb.AppendLine('    <cover>' + [System.Security.SecurityElement]::Escape($relBase + '/' + $cover) + '</cover>')
  foreach ($f in $files) {
    [void]$sb.AppendLine('    <image>' + [System.Security.SecurityElement]::Escape($relBase + '/' + $f.Name) + '</image>')
  }
  [void]$sb.AppendLine('  </session>')
}
[void]$sb.AppendLine('  <marqueeRoot>' + [System.Security.SecurityElement]::Escape('Фотки для ленты') + '</marqueeRoot>')
Get-ChildItem $lenta -File | Sort-Object Name | ForEach-Object {
  [void]$sb.AppendLine('  <marqueeImage>' + [System.Security.SecurityElement]::Escape('Фотки для ленты/' + $_.Name) + '</marqueeImage>')
}
[void]$sb.AppendLine('</portfolio>')
$outPath = Join-Path $base 'data\portfolio.xml'
New-Item -ItemType Directory -Path (Split-Path $outPath) -Force | Out-Null
[System.IO.File]::WriteAllText($outPath, $sb.ToString(), [System.Text.UTF8Encoding]::new($false))
Write-Output "OK: $outPath"
