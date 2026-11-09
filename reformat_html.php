<?php
$htmlPath = 'c:/Users/Admin/Local Sites/OCCChile_final/index.html';
$outPath = 'c:/Users/Admin/Local Sites/OCCChile_final/index_formatted.html';

$html = file_get_contents($htmlPath);

// Simple HTML formatter: add newlines before tags and indent
// This handles the basic structure

$indent = 0;
$lines = [];
$parts = preg_split('/(?=<\/?\w+)/', $html, -1, PREG_SPLIT_NO_EMPTY);

foreach ($parts as $part) {
    if (preg_match('/<\/\s*([a-zA-Z0-9]+)\s*>/', $part, $m)) {
        $tag = strtolower($m[1]);
        $line = "</$tag>";
        $lines[] = $line;
        $indent--;
    } elseif (preg_match('/<([a-zA-Z][a-zA-Z0-9]*)\s*[^>]*>/', $part, $m)) {
        $tag = $m[1];
        $line = "<$tag" . substr($part, strlen($m[0])) . ">";
        $lines[] = $line;
        $indent++;
    } else {
        $lines[] = $part;
    }
}

$output = implode("\n", $lines);
file_put_contents($outPath, $output);

echo "Formatted HTML written: " . $outPath . "\n";
echo "Lines: " . count($lines) . "\n";
