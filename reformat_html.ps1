[CmdletBinding()]
param()

$htmlPath = 'c:/Users/Admin/Local Sites/OCCChile_final/index.html'
$outPath = 'c:/Users/Admin/Local Sites/OCCChile_final/index_formatted.html'

$html = Get-Content $htmlPath -Raw

# Add newlines before tags and indentation
# This is a simplified formatter - handles common patterns

# 1. Replace self-closing tags with proper formatting
# 2. Add newlines before opening tags (except first)
# 3. Add indentation

$indentLevel = 0
$lines = @()

# Split by tags
$parts = $html -split '(?=</)'

foreach ($part in $parts) {
    if ($part -match '<\s*/([a-zA-Z0-9]+)\s*>') {
        $tag = $matches[1].ToLower()
        # Don't indent closing tags the same as opening
        $line = "</$tag>"
        $lines += $line
        $indentLevel--
    }
    elseif ($part -match '<([a-zA-Z][a-zA-Z0-9]*)\s*[^>]*>') {
        $tag = $matches[1]
        $line = "<$tag$($part.Substring($matches[0].Length))>"
        $lines += $line
        $indentLevel++
    }
    else {
        $lines += $part
    }
}

$output = $lines -join [Environment]::NewLine
$output | Out-File $outPath -Encoding UTF8

Write-Host "Formatted HTML written to $outPath"
Write-Host "Lines: $($lines.Count)"
