#!/usr/bin/env python
import os

files = ['index.html', 'app.js', 'styles.css']
for f in files:
    path = os.path.join('c:/Users/Admin/Local Sites/OCCChile_final', f)
    try:
        with open(path, 'rb') as fh:
            raw = fh.read()
        text = raw.decode('utf-8', errors='replace')
        count_mojibake = text.count('Ã')
        if count_mojibake > 0:
            print(f'PROBLEMA: {f} tiene {count_mojibake} mojibake')
        else:
            print(f'OK: {f} - sin mojibake')
    except Exception as e:
        print(f'ERROR: {f}: {e}')