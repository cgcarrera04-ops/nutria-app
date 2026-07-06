#!/usr/bin/env python3
"""
generate_bank.py — Generador masivo del banco de respuestas de NutrIA
─────────────────────────────────────────────────────────────────────────────
Genera planes pre-calculados para todas las combinaciones posibles de perfil
y los guarda en el responseBank del frontend y el response_bank del backend.

Uso:
  python generate_bank.py                    # Genera TODAS las combinaciones faltantes
  python generate_bank.py --dry-run          # Solo muestra qué combinaciones faltan
  python generate_bank.py --goals deficit    # Solo genera combinaciones de 'deficit'
  python generate_bank.py --limit 10         # Genera máximo 10 planes nuevos

Nota: Requiere la variable de entorno GEMINI_API_KEY o GEMINI_FLASH_API_KEY_PAID.
"""

import os, sys, json, time, itertools, argparse, copy
from pathlib import Path
from dotenv import load_dotenv

# ── Cargar .env desde el directorio del script ──
load_dotenv(Path(__file__).parent / ".env")

# ── Importar funciones del main ──
sys.path.insert(0, str(Path(__file__).parent))
from main import (
    expand_plan,
    generate_remaining_days,
    clean_json_response,
    PLAN_PROMPT,
)

try:
    from google import genai
    from google.genai import types
except ImportError:
    print("⚠️  Necesitas instalar google-genai: pip install google-genai")
    sys.exit(1)

# ── Configuración ──
FRONTEND_BANK = Path(__file__).parent.parent / "frontend" / "src" / "data" / "responseBank.json"
BACKEND_BANK  = Path(__file__).parent / "response_bank.json"

# ── Todas las combinaciones posibles de fingerprint ──
GOALS       = ["deficit", "maintain", "surplus"]
SOMATOTYPES = ["slim", "athletic", "robust"]
COOK_MODES  = ["cook", "mixed", "buy"]
BUDGETS     = {"low": 80, "medium": 150, "high": 250}
ACTIVITIES  = ["sedentary", "light", "moderate", "very"]

# Biometría representativa por somatotipo y sexo
BIO_PROFILES = {
    "slim":     {"weight": 58, "height": 168, "age": 24},
    "athletic": {"weight": 72, "height": 175, "age": 26},
    "robust":   {"weight": 88, "height": 178, "age": 30},
}

def budget_range(soles: int) -> str:
    if soles <= 100: return "low"
    if soles <= 200: return "medium"
    return "high"

def build_fingerprint(goal, soma, cook, budget_key, activity, sex, ex_time, equip):
    return f"{goal}_{soma}_{cook}_{budget_key}_{activity}_{sex}_{ex_time}_{equip}"

def load_existing_fingerprints() -> set:
    """Carga todos los fingerprints existentes en ambos bancos."""
    fps = set()
    for bank_path in [FRONTEND_BANK, BACKEND_BANK]:
        if bank_path.exists():
            try:
                with open(bank_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    for p in data.get("plans", []):
                        fps.add(p.get("fingerprint", ""))
            except Exception:
                pass
    return fps

def generate_all_combinations():
    """Genera 72 combinaciones altamente representativas (personas reales)
    que cubren de forma lógica las opciones principales de la app."""
    combos = []
    
    # Mapeo lógico de combinaciones de entrenamiento y actividad:
    # 1. Sedentary/Light -> Home o sin entrenamiento
    # 2. Moderate/Very -> Gym u Outdoor
    setups = [
        # (cookMode, activity, sex, exerciseTime, equipment, budget_key, budget_val)
        ("cook", "moderate", "Masculino", "45min",   "gym",     "medium", 150),
        ("cook", "moderate", "Femenino",  "45min",   "gym",     "medium", 150),
        ("cook", "light",    "Masculino", "20min",   "home",    "low",    80),
        ("cook", "light",    "Femenino",  "20min",   "home",    "low",    80),
        ("mixed", "sedentary","Masculino","0min",    "none",    "medium", 150),
        ("mixed", "sedentary","Femenino", "0min",    "none",    "medium", 150),
        ("buy",   "very",     "Masculino","60min+",  "gym",     "high",   250),
        ("buy",   "very",     "Femenino", "60min+",  "gym",     "high",   250),
    ]

    for goal, soma in itertools.product(GOALS, SOMATOTYPES):
        for cook, act, sex, ex_time, equip, b_key, b_val in setups:
            fp = build_fingerprint(goal, soma, cook, b_key, act, sex, ex_time, equip)
            combos.append({
                "fingerprint": fp,
                "goal": goal,
                "somatotype": soma,
                "cookMode": cook,
                "budget_key": b_key,
                "budget": b_val,
                "activity": act,
                "sex": sex,
                "exerciseTime": ex_time,
                "equipment": equip,
            })
    return combos

def call_gemini_for_plan(api_key: str, combo: dict) -> dict:
    """Genera un plan usando la IA para una combinación de perfil."""
    bio = BIO_PROFILES[combo["somatotype"]]
    
    profile_summary = (
        f"Objetivo: {combo['goal']} | Somatotipo: {combo['somatotype']} | Género: {combo['sex']} | "
        f"Peso: {bio['weight']}kg | Altura: {bio['height']}cm | Edad: {bio['age']} años | "
        f"Actividad: {combo['activity']} | Sueño: 7h | Estrés: 3/5 | "
        f"Equipamiento: {combo['equipment']} | Tiempo ejercicio: {combo['exerciseTime']} | "
        f"Cocina: {combo['cookMode']} (30min)"
    )

    prompt = PLAN_PROMPT.format(
        profile   = profile_summary,
        budget    = combo["budget"],
        allergies = "ninguna",
        injuries  = "ninguna",
        cook_mode = combo["cookMode"],
        pandora   = "ninguna",
    )

    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.4,
            max_output_tokens=8192,
            response_mime_type="application/json",
            thinking_config=types.ThinkingConfig(
                thinking_budget=0
            )
        ),
    )

    raw_plan = clean_json_response(response.text)
    plan = expand_plan(raw_plan)
    plan = generate_remaining_days(plan)
    return plan

def save_plan_to_banks(fingerprint: str, label: str, plan: dict, combo: dict):
    """Guarda el plan en ambos bancos (frontend y backend)."""
    entry = {
        "fingerprint": fingerprint,
        "label": label,
        "plan": plan,
        "userData": {
            "goal": combo["goal"],
            "somatotype": combo["somatotype"],
            "cookMode": combo["cookMode"],
            "budget": combo["budget"],
            "activity": combo["activity"],
            "weight": BIO_PROFILES[combo["somatotype"]]["weight"],
            "height": BIO_PROFILES[combo["somatotype"]]["height"],
            "age":    BIO_PROFILES[combo["somatotype"]]["age"],
            "sex":    combo["sex"],
            "exerciseTime": combo["exerciseTime"],
            "equipment": combo["equipment"],
        }
    }

    for bank_path in [FRONTEND_BANK, BACKEND_BANK]:
        try:
            bank_data = {"plans": []}
            if bank_path.exists():
                with open(bank_path, "r", encoding="utf-8") as f:
                    bank_data = json.load(f)
            
            plans = bank_data.setdefault("plans", [])
            # Evitar duplicados
            if not any(p.get("fingerprint") == fingerprint for p in plans):
                plans.append(entry)
                with open(bank_path, "w", encoding="utf-8") as f:
                    json.dump(bank_data, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"  ⚠️  Error al guardar en {bank_path.name}: {e}")

def main():
    # Forzar UTF-8 en la consola de Windows para que los emojis se impriman correctamente
    if sys.platform == "win32":
        try:
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
            sys.stderr.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass

    parser = argparse.ArgumentParser(description="Generador masivo del banco de NutrIA")
    parser.add_argument("--dry-run", action="store_true", help="Solo muestra combinaciones faltantes")
    parser.add_argument("--goals", nargs="+", choices=GOALS, help="Filtrar por objetivo(s)")
    parser.add_argument("--limit", type=int, default=0, help="Máximo de planes a generar (0=todos)")
    parser.add_argument("--delay", type=float, default=2.0, help="Segundos entre llamadas (default: 2)")
    args = parser.parse_args()

    # Buscar API key (priorizando la gratuita para evitar cargos)
    api_key = (
        os.getenv("GEMINI_FLASH_API_KEY_FREE") or 
        os.getenv("GEMINI_API_KEY_2") or
        os.getenv("GEMINI_FLASH_API_KEY_PAID") or 
        os.getenv("GEMINI_FLASH_API_KEY") or 
        os.getenv("GEMINI_API_KEY_1") or
        os.getenv("GEMINI_API_KEY")
    )
    if not api_key and not args.dry_run:
        print("❌ No se encontró ninguna llave de API en las variables de entorno.")
        print("   Configura GEMINI_FLASH_API_KEY_PAID o GEMINI_API_KEY en tu .env")
        sys.exit(1)

    # Cargar fingerprints existentes
    existing = load_existing_fingerprints()
    all_combos = generate_all_combinations()

    # Filtrar por goals si se especificó
    if args.goals:
        all_combos = [c for c in all_combos if c["goal"] in args.goals]

    # Filtrar las ya existentes
    missing = [c for c in all_combos if c["fingerprint"] not in existing]

    print(f"\n🦦 NutrIA — Generador Masivo del Banco de Respuestas")
    print(f"{'─' * 55}")
    print(f"   Combinaciones totales:   {len(all_combos)}")
    print(f"   Ya existentes:           {len(existing)}")
    print(f"   Faltan por generar:      {len(missing)}")

    if args.limit > 0:
        missing = missing[:args.limit]
        print(f"   Limitado a:              {len(missing)}")

    print()

    if args.dry_run:
        print("📋 Combinaciones faltantes:")
        for c in missing:
            print(f"   {c['fingerprint']} (S/{c['budget']})")
        print(f"\n   Total: {len(missing)} planes por generar")
        return

    if not missing:
        print("✅ ¡El banco ya está completo! No hay combinaciones faltantes.")
        return

    # Generar planes
    success = 0
    errors  = 0
    for i, combo in enumerate(missing, 1):
        fp = combo["fingerprint"]
        print(f"[{i}/{len(missing)}] Generando: {fp} ... ", end="", flush=True)

        try:
            plan = call_gemini_for_plan(api_key, combo)
            label = f"Plan {combo['goal']} {combo['somatotype']} {combo['cookMode']} - Semana 1"
            save_plan_to_banks(fp, label, plan, combo)
            success += 1
            print("✅")
        except Exception as e:
            errors += 1
            print(f"❌ {e}")

        # Pausa entre llamadas para evitar rate limiting
        if i < len(missing):
            time.sleep(args.delay)

    print(f"\n{'─' * 55}")
    print(f"🎉 Generación completada:")
    print(f"   ✅ Exitosos: {success}")
    print(f"   ❌ Errores:  {errors}")
    print(f"   📦 Total en banco: {len(existing) + success} planes")

if __name__ == "__main__":
    main()
