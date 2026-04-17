import json
import os

bank_path = r'd:\Descargas 2.0\PROYECTO\frontend\src\data\responseBank.json'
lote_path = r'd:\Descargas 2.0\PROYECTO\frontend\src\data\temp_lote2.json'

with open(bank_path, 'r', encoding='utf-8') as f:
    bank = json.load(f)

with open(lote_path, 'r', encoding='utf-8') as f:
    lote2 = json.load(f)

bank['plans'].extend(lote2['plans'])

with open(bank_path, 'w', encoding='utf-8') as f:
    json.dump(bank, f, indent=2, ensure_ascii=False)

print(f"Success! Total plans now: {len(bank['plans'])}")
try:
    os.remove(lote_path)
except:
    pass
