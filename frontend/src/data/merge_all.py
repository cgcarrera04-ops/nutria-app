import json
import os
import re

bank_path = r'd:\Descargas 2.0\PROYECTO\frontend\src\data\responseBank.json'
lotes_path = r'd:\Descargas 2.0\PROYECTO\frontend\src\data\lotes_3_4_5.txt'

with open(bank_path, 'r', encoding='utf-8') as f:
    bank = json.load(f)

with open(lotes_path, 'r', encoding='utf-8') as f:
    text = f.read()

# The text contains multiple JSON objects glued together.
# Let's find all occurrences of { "version" ... }
# To parse multiple JSON objects, we can use a JSONDecoder loop.

decoder = json.JSONDecoder()
pos = 0
added = 0

while pos < len(text):
    # skip whitespace
    while pos < len(text) and text[pos].isspace():
        pos += 1
    if pos >= len(text):
        break
        
    try:
        obj, end_pos = decoder.raw_decode(text[pos:])
        if 'plans' in obj:
            bank['plans'].extend(obj['plans'])
            added += len(obj['plans'])
        pos += end_pos
    except json.JSONDecodeError as e:
        print(f"Error decoding at pos {pos}: {e}")
        break

with open(bank_path, 'w', encoding='utf-8') as f:
    json.dump(bank, f, indent=2, ensure_ascii=False)

print(f"Successfully added {added} plans. Total plans now: {len(bank['plans'])}")
try:
    os.remove(lotes_path)
except:
    pass
