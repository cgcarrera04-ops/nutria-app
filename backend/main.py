"""
NutrIAcción Backend — FastAPI
─────────────────────────────────────────────────────────────────────────────
Endpoints:
  POST /api/generate   → genera plan con IA o devuelve del banco de respuestas
  POST /api/checkin    → procesa check-in y calcula ajustes semana siguiente
  GET  /api/health     → estado del servidor
  GET  /api/bank/list  → lista fingerprints disponibles en el banco
"""

import os, json, random, logging
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List

from google import genai
from google.genai import types

# ── Configuración ─────────────────────────────────────────────────────────────
load_dotenv()
logging.basicConfig(level=logging.INFO)
log = logging.getLogger("nutria")

BASE_DIR   = Path(__file__).parent
BANK_FILE  = BASE_DIR / "response_bank.json"

# Pool de API keys — rota automáticamente si una falla
API_KEYS = [v for k in ["GEMINI_API_KEY_1","GEMINI_API_KEY_2","GEMINI_API_KEY_3","GEMINI_API_KEY_4"]
            if (v := os.getenv(k))]

if not API_KEYS:
    log.warning("⚠️  No hay API keys configuradas en .env — el banco de respuestas es la única fuente.")

# ── FastAPI app ───────────────────────────────────────────────────────────────
app = FastAPI(title="NutrIAcción API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # En producción: reemplaza con tu dominio
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Modelos de datos ──────────────────────────────────────────────────────────
class UserData(BaseModel):
    goal:         str = "maintain"
    somatotype:   str = "athletic"
    cookMode:     str = "cook"
    cookTime:     Optional[str] = "30min"
    exerciseTime: Optional[str] = "45min"
    equipment:    str = "gym"
    budget:       int = 150
    sleep:        float = 7
    stress:       int = 3
    activity:     str = "moderate"
    weight:       Optional[float] = None
    height:       Optional[float] = None
    age:          Optional[int] = None
    sex:          str = "Masculino"
    allergies:    List[str] = []
    injuries:     List[str] = []
    pandoraText:  str = ""
    name:         str = ""

class GenerateRequest(BaseModel):
    userData: UserData

class CheckinData(BaseModel):
    weight_now:       Optional[float] = None
    hunger_level:     int = 3    # 1-5
    fatigue_level:    int = 3    # 1-5
    budget_ok:        str = "yes"
    adherence_pct:    int = 80
    free_text:        str = ""
    current_calories: int = 2000
    current_protein:  int = 150

class CheckinRequest(BaseModel):
    userData:  UserData
    checkin:   CheckinData

# ── Banco de respuestas ───────────────────────────────────────────────────────
def load_bank() -> list:
    try:
        with open(BANK_FILE, "r", encoding="utf-8") as f:
            return json.load(f).get("plans", [])
    except Exception:
        return []

def budget_range(soles: int) -> str:
    if soles <= 79:  return "low"
    if soles <= 150: return "medium"
    return "high"

def build_fingerprint(ud: UserData) -> str:
    return "_".join([ud.goal, ud.somatotype, ud.cookMode,
                     budget_range(ud.budget), ud.activity])

def find_cached(ud: UserData) -> Optional[dict]:
    fp    = build_fingerprint(ud)
    bank  = load_bank()
    exact = next((p for p in bank if p.get("fingerprint") == fp), None)
    if exact:
        log.info(f"✅ Cache hit: {fp}")
        return exact.get("plan")

    # Coincidencia parcial — ignora budget si no hay exacta
    partial_fp = "_".join([ud.goal, ud.somatotype, ud.cookMode, ud.activity])
    partial    = next((p for p in bank if p.get("fingerprint","").startswith(
                       "_".join([ud.goal, ud.somatotype, ud.cookMode]))), None)
    if partial:
        log.info(f"🔶 Partial cache hit for {fp}")
        return partial.get("plan")

    return None

# ── Generación con Gemini ─────────────────────────────────────────────────────
PLAN_PROMPT = """
Eres un nutricionista y entrenador personal peruano experto. Genera un plan de salud semanal
en JSON para este perfil. El JSON debe seguir exactamente la estructura indicada.

PERFIL DEL USUARIO:
{profile}

RESTRICCIONES ABSOLUTAS:
- Presupuesto MÁXIMO: S/{budget} soles semanales (NUNCA superarlo)
- Alérgenos a evitar completamente: {allergies}
- Lesiones — evitar ejercicios que impacten: {injuries}
- Modo cocina: {cook_mode}
- Contexto adicional: {pandora}

ESTRUCTURA JSON REQUERIDA (devuelve SOLO el JSON, sin explicaciones):
{{
  "calories_daily": <número>,
  "macros": {{"protein_g": <n>, "carbs_g": <n>, "fat_g": <n>}},
  "days": [
    {{
      "day": 1,
      "meals": [
        {{
          "name": "Desayuno",
          "time": "07:00",
          "kcal": <n>,
          "items": ["ingrediente con cantidad"],
          "plan_b": ["opción rápida ≤10min"],
          "macros": {{"p": <n>, "c": <n>, "g": <n>}}
        }}
      ]
    }}
  ],
  "shopping": [
    {{"item": "nombre", "qty": "cantidad", "price": <número soles>, "cat": "Proteínas|Carbohidratos|Grasas|Lácteos|Vegetales|Frutas|Condimentos"}}
  ],
  "training": {{
    "split": "PPL|FullBody|Calistenia|HIIT",
    "sessions_per_week": <n>,
    "days": [
      {{
        "day_of_week": 1,
        "name": "nombre del día",
        "type": "strength|cardio|hiit|active_rest|rest",
        "exercises": [
          {{
            "name": "nombre ejercicio",
            "sets": <n>, "reps": "8-10", "rest_sec": 90,
            "muscle": "grupo muscular",
            "substitute": "ejercicio alternativo",
            "avoid_if_injury": ["zona"]
          }}
        ]
      }}
    ]
  }}
}}
"""

def call_gemini(ud: UserData) -> dict:
    if not API_KEYS:
        raise HTTPException(503, "No hay API keys disponibles. Configura GEMINI_API_KEY_1 en .env")

    keys_shuffled = API_KEYS.copy()
    random.shuffle(keys_shuffled)

    profile_summary = (
        f"Objetivo: {ud.goal} | Somatotipo: {ud.somatotype} | Género: {ud.sex} | "
        f"Peso: {ud.weight}kg | Altura: {ud.height}cm | Edad: {ud.age} años | "
        f"Actividad: {ud.activity} | Sueño: {ud.sleep}h | Estrés: {ud.stress}/5 | "
        f"Equipamiento: {ud.equipment} | Tiempo ejercicio: {ud.exerciseTime} | "
        f"Cocina: {ud.cookMode} ({ud.cookTime or 'n/a'})"
    )

    prompt = PLAN_PROMPT.format(
        profile   = profile_summary,
        budget    = ud.budget,
        allergies = ", ".join(ud.allergies) or "ninguna",
        injuries  = ", ".join(ud.injuries)  or "ninguna",
        cook_mode = ud.cookMode,
        pandora   = ud.pandoraText or "ninguna",
    )

    last_error = None
    for key in keys_shuffled:
        try:
            client   = genai.Client(api_key=key)
            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt,
            )
            text = response.text.strip()

            # Extrae solo el JSON
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            elif "```" in text:
                text = text.split("```")[1].split("```")[0].strip()

            plan = json.loads(text)
            log.info(f"✅ Plan generado con key ...{key[-6:]}")
            return plan

        except json.JSONDecodeError as e:
            log.warning(f"JSON inválido con key ...{key[-6:]}: {e}")
            last_error = str(e)
        except Exception as e:
            log.warning(f"Error con key ...{key[-6:]}: {e}")
            last_error = str(e)

    raise HTTPException(503, f"Todas las APIs fallaron. Último error: {last_error}")

# ── Lógica de ajuste del check-in ────────────────────────────────────────────
def calculate_adjustments(ud: UserData, ci: CheckinData) -> dict:
    adjustments = {}
    reasons     = []

    # Hambre frecuente → subir calorías
    if ci.hunger_level >= 4:
        adjustments["calories_delta"] = +150
        reasons.append("Sentiste hambre frecuente → el déficit era agresivo. Subimos 150 kcal.")

    # Fatiga extrema → reducir volumen
    if ci.fatigue_level >= 4:
        adjustments["volume_reduction_pct"] = 15
        reasons.append("Fatiga extrema detectada → reducimos el volumen de entrenamiento 15%.")

    # Presupuesto no alcanzó → simplificar
    if ci.budget_ok == "no":
        adjustments["simplify_recipes"] = True
        reasons.append("El presupuesto no alcanzó → simplificamos recetas para la próxima semana.")

    # Baja adherencia → activar Plan B
    if ci.adherence_pct < 70:
        adjustments["activate_plan_b"] = True
        reasons.append(f"Adherencia {ci.adherence_pct}% (<70%) → activamos Plan B como base.")

    return {"adjustments": adjustments, "reasons": reasons}

# ── Endpoints ─────────────────────────────────────────────────────────────────
@app.get("/api/health")
def health():
    return {
        "status": "online",
        "bank_plans": len(load_bank()),
        "api_keys_configured": len(API_KEYS),
        "version": "1.0.0",
    }

@app.get("/api/bank/list")
def list_bank():
    return {"plans": [{"fp": p.get("fingerprint"), "label": p.get("label")} for p in load_bank()]}

@app.post("/api/generate")
def generate_plan(req: GenerateRequest):
    ud = req.userData

    # 1. Intenta banco de respuestas
    cached = find_cached(ud)
    if cached:
        return {"plan": cached, "source": "cache", "fingerprint": build_fingerprint(ud)}

    # 2. Llama a Gemini
    plan = call_gemini(ud)
    return {"plan": plan, "source": "ai", "fingerprint": build_fingerprint(ud)}

@app.post("/api/checkin")
def process_checkin(req: CheckinRequest):
    result = calculate_adjustments(req.userData, req.checkin)
    return {
        "week_summary": {
            "weight_delta": None,  # Frontend calcula vs peso inicial
            "adherence":    req.checkin.adherence_pct,
        },
        **result,
    }

# ── Entrypoint ────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    log.info(f"🦦 NutrIAcción backend corriendo en http://localhost:{port}")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
