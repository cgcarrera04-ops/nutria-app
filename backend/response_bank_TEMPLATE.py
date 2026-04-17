# ─── PLANTILLA PARA LLENAR PERFILES ───────────────────────────────────────────
# Copia este bloque por cada perfil y rellena los campos
# Los campos con * son obligatorios, los demás son opcionales

{
  # IDENTIFICADOR — combinación de estas variables:
  # goal: deficit | maintain | surplus
  # somatotype: slim | athletic | robust
  # cookMode: cook | buy | mixed
  # budget: low (S/30-79) | medium (S/80-150) | high (S/151+)
  # activity: sedentary | light | moderate | very
  "fingerprint": "deficit_athletic_cook_medium_moderate",  # *

  # DESCRIPCIÓN LEGIBLE
  "label": "Déficit · Atlético · Cocina · Presupuesto medio · Actividad moderada",  # *

  # CALORÍAS Y MACROS DEL PLAN
  "calories_daily": 1950,     # * kcal/día objetivo
  "protein_g": 160,           # * gramos de proteína/día
  "carbs_g": 210,             # * gramos de carbohidratos/día
  "fat_g": 55,                # * gramos de grasa/día

  # COMIDAS — repite para los 7 días o usa "repeat": true para reusar días
  "days": [
    {
      "day": 1,               # 1-7
      "repeat_from": null,    # Si es igual a otro día pon el número, ej: 1

      "meals": [
        {
          "name": "Desayuno", # Desayuno | Almuerzo | Merienda | Cena
          "time": "07:00",
          "kcal": 480,
          "items": [          # ingredientes con cantidad
            "3 huevos revueltos",
            "2 tostadas integrales (50g)",
            "1 plátano mediano"
          ],
          "plan_b": [         # versión rápida ≤10 min
            "Yogurt griego 150g",
            "Granola 30g",
            "1 plátano"
          ],
          "macros": { "p": 28, "c": 52, "g": 14 }
        },
        {
          "name": "Almuerzo",
          "time": "13:00",
          "kcal": 650,
          "items": [
            "Arroz integral 1 taza cocido (185g)",
            "Pechuga de pollo a la plancha 150g",
            "Ensalada verde con aceite de oliva"
          ],
          "plan_b": [
            "Atún en lata 1 unidad",
            "Arroz precocido de sobre",
            "Ensalada de bolsa pre-lavada"
          ],
          "macros": { "p": 55, "c": 70, "g": 18 }
        },
        {
          "name": "Merienda",
          "time": "17:00",
          "kcal": 220,
          "items": [
            "Yogurt griego 150g",
            "Almendras 20g"
          ],
          "plan_b": [
            "Yogurt griego 150g",
            "Almendras 20g"
          ],
          "macros": { "p": 18, "c": 12, "g": 10 }
        },
        {
          "name": "Cena",
          "time": "20:00",
          "kcal": 600,
          "items": [
            "Atún en agua 1 lata (170g)",
            "Camote mediano asado (180g)",
            "Espinaca salteada con ajo"
          ],
          "plan_b": [
            "Atún en lata directo",
            "Camote sancochado",
            "Espinaca de bolsa"
          ],
          "macros": { "p": 42, "c": 58, "g": 10 }
        }
      ]
    }
    # Continúa para días 2-7, o usa repeat_from para reusar días similares
  ],

  # LISTA DE COMPRAS SEMANAL
  "shopping": [
    { "item": "Pechuga de pollo", "qty": "700g",   "price": 14, "cat": "Proteínas"     },
    { "item": "Huevos",           "qty": "1 docena","price": 9,  "cat": "Proteínas"     },
    { "item": "Atún en agua",     "qty": "3 latas", "price": 8,  "cat": "Proteínas"     },
    { "item": "Arroz integral",   "qty": "1 kg",    "price": 5,  "cat": "Carbohidratos" },
    { "item": "Camote",           "qty": "500g",    "price": 4,  "cat": "Carbohidratos" },
    { "item": "Pan integral",     "qty": "1 bolsa", "price": 6,  "cat": "Carbohidratos" },
    { "item": "Almendras",        "qty": "150g",    "price": 12, "cat": "Grasas"        },
    { "item": "Aceite de oliva",  "qty": "250ml",   "price": 11, "cat": "Grasas"        },
    { "item": "Yogurt griego",    "qty": "400g",    "price": 9,  "cat": "Lácteos"       },
    { "item": "Espinaca",         "qty": "200g",    "price": 4,  "cat": "Vegetales"     },
    { "item": "Plátanos",         "qty": "1 kg",    "price": 4,  "cat": "Frutas"        },
    { "item": "Limón, ajo, sal",  "qty": "varios",  "price": 5,  "cat": "Condimentos"   }
    # El total debe ser ≤ el presupuesto del perfil
  ],

  # RUTINA DE ENTRENAMIENTO
  "training": {
    "split": "PPL",           # PPL | FullBody | UpperLower | Calistenia | HIIT
    "sessions_per_week": 4,
    "session_duration_min": 50,
    "days": [
      {
        "day_of_week": 1,     # 1=Lunes ... 7=Domingo
        "name": "Empuje — Pecho + Hombros + Tríceps",
        "type": "strength",   # strength | cardio | hiit | rest | active_rest
        "exercises": [
          {
            "name": "Press de banca",
            "sets": 4, "reps": "8-10", "rest_sec": 90,
            "muscle": "Pecho",
            "equipment": "Barra",
            "substitute": "Press con mancuernas en banco plano",
            "avoid_if_injury": ["Hombros", "Muñecas"]
          },
          {
            "name": "Press militar con mancuernas",
            "sets": 3, "reps": "10-12", "rest_sec": 75,
            "muscle": "Hombros",
            "equipment": "Mancuernas",
            "substitute": "Elevaciones laterales",
            "avoid_if_injury": ["Hombros", "Cervical"]
          }
          # ... más ejercicios
        ]
      },
      {
        "day_of_week": 3,
        "name": "Descanso activo",
        "type": "active_rest",
        "description": "Caminata 20-30 min a ritmo moderado o estiramientos de movilidad"
      }
      # ... más días
    ]
  }
}
