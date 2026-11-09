[CmdletBinding()]
param()

$htmlPath = 'c:/Users/Admin/Local Sites/OCCChile_final/index.html'
$outPath = 'c:/Users/Admin/Local Sites/OCCChile_final/index_formatted.html'

$html = Get-Content $htmlPath -Raw

$lines = @()
$depth = 0

# Split by opening tags (positive lookahead for <)
$chunks = $html -split '(?=<)'

foreach ($chunk in $chunks) {
    if ($chunk -match '<\s*/([a-zA-Z0-9]+)\s*>') {
        $depth--
        $lines += [Environment]::NewLine + '  ' * $depth + $chunk.TrimStart()
    }
    elseif ($chunk -match '<([a-zA-Z][a-zA-Z0-9]*)\s*[^>]*?>' -and $chunk -notmatch '/>$') {
        $depth++
        $lines += [Environment]::NewLine + '  ' * $depth + $chunk.TrimStart()
    }
    else {
        $lines += '  ' * $depth + $chunk.TrimStart()
    }
}

$output = $lines -join [Environment]::NewLine
$output | Out-File $outPath -Encoding UTF8

Write-Host "Done. Lines: $($lines.Count), Output: $outPath"
