import json
import re
import os

path = r'd:\Descargas 2.0\PROYECTO\frontend\src\data\responseBank.json'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# the content has multiple `{ "version": "1.0", "plans": [ ... ] }` blocks
# let's split by "version": "1.0"
parts = content.split('"version": "1.0",')
all_plans = []

for part in parts[1:]:
    # the part starts with ' "plans": [ ... '
    # find the array
    start_idx = part.find('"plans": [')
    if start_idx == -1: continue
    
    # Extract the plans array string using a brace matching approach
    # We'll just extract everything and try to parse it with a dirty json parser
    # Or simpler: find all objects inside the array
    pass
    
# Actually, since python's json parser is strict, let's use a regex to extract each fingerprint object
plan_blocks = re.split(r'\{\s*"fingerprint":', content)
valid_plans = []

for block in plan_blocks[1:]:
    # block starts with ' "name", ...'
    block_str = '{"fingerprint":' + block
    # it might be truncated at the end or followed by the next plan or file end
    # let's find the closing bracket by counting { and }
    count = 0
    in_str = False
    escape = False
    end_idx = -1
    for i, char in enumerate(block_str):
        if char == '"' and not escape:
            in_str = not in_str
        if not in_str:
            if char == '{':
                count += 1
            elif char == '}':
                count -= 1
                if count == 0:
                    end_idx = i
                    break
        if char == '\\':
            escape = not escape
        else:
            escape = False
            
    if end_idx != -1:
        try:
            plan = json.loads(block_str[:end_idx+1])
            valid_plans.append(plan)
        except Exception as e:
            pass

print(f"Extracted {len(valid_plans)} plans")
out = {
    "version": "1.0",
    "plans": valid_plans
}
with open(path, 'w', encoding='utf-8') as f:
    json.dump(out, f, indent=2, ensure_ascii=False)
