#!/usr/bin/env python3
"""
generate_offline_bank.py — Generador local y gratuito de planes para NutrIA
─────────────────────────────────────────────────────────────────────────────
Versión 4.0: Humanización Total. Incluye mensajes motivacionales (Axioma 1),
técnicas detalladas, tips de entrenamiento y nombres de recetas apetitosos.
"""

import os, sys, json, copy, random
from pathlib import Path
from itertools import product

# ── Configuración de Rutas ──
FRONTEND_BANK = Path(__file__).parent.parent / "frontend" / "src" / "data" / "responseBank.json"
BACKEND_BANK  = Path(__file__).parent / "response_bank.json"

# ── Mensajes Empáticos (Axioma 1) ──
WELCOME_MESSAGES = {
    "deficit": "¡Hola! He preparado este plan especial para ayudarte a perder grasita de forma saludable, sin pasar hambre y cuidando mucho tu energía. ¡Vamos con todo! 🦦🔥",
    "surplus": "¡Hola! Este plan hipercalórico está diseñado para que construyamos músculo magro juntos. Vas a comer delicioso y vas a sentir la fuerza en cada entreno. ¡A crecer! 🦦💪",
    "maintain": "¡Hola! Aquí tienes tu plan perfecto para mantener tu peso, mejorar tu composición corporal y sentirte increíble todos los días. ¡El equilibrio es la clave! 🦦✨"
}

DAILY_TIPS = [
    "Recuerda tomar un buen vaso de agua antes de cada comida, ¡te ayudará a la digestión y saciedad! 💧",
    "Mastica cada bocado lentamente. ¡Tu digestión empieza en la boca y disfrutarás más los sabores! 🦦🍽️",
    "Si sientes un antojito de dulce, una infusión calientita o té de manzanilla puede hacer magia. ☕✨",
    "No te saltes las comidas principales, ¡mantener tus niveles de energía estables es súper importante! ⚡",
    "Aprovecha el poder de las especias: canela, orégano, cúrcuma... le dan muchísima vida a tus comidas sin sumar calorías. 🌿",
    "Si te sientes muy lleno(a), no te obligues a terminar. Escucha a tu cuerpo, él sabe cuándo es suficiente. 🦦💖",
    "Recuerda que un mal día no arruina tu progreso. ¡Lo importante es la constancia, yo confío en ti! 🌟"
]

def get_meal_templates(p_day, c_day, f_day, diet_type):
    # Helpers nutricionales absolutos (Fallo 2 resuelto)
    # Proteínas base
    def prot_pollo(p): return max(50, int((p * 100) / 31 / 5) * 5)
    def prot_huevo(p): return max(1, int(round(p / 6)))
    def prot_queso(p): return max(30, int((p * 100) / 14 / 5) * 5)
    def prot_tofu(p): return max(50, int((p * 100) / 16 / 5) * 5)
    def prot_cerdo(p): return max(50, int((p * 100) / 26 / 5) * 5)
    def prot_pescado(p): return max(50, int((p * 100) / 24 / 5) * 5)
    
    # Carbos base
    def carb_avena(c): return max(20, int((c * 100) / 60 / 5) * 5)
    def carb_arroz(c): return max(50, int((c * 100) / 28 / 5) * 5)
    def carb_papa(c): return max(50, int((c * 100) / 20 / 5) * 5)
    def carb_pan(c): return max(1, int(round(c / 15)))
    def carb_fruta(c): return max(1, int(round(c / 25)))
    
    # Grasas base
    def fat_palta(f): return max(30, int((f * 100) / 15 / 5) * 5)
    def fat_almendra(f): return max(10, int((f * 100) / 50 / 5) * 5)
    def fat_aceite(f): return max(5, int((f * 100) / 100 / 5) * 5)

    # Calculamos macros por comida (25%, 40%, 15%, 20%)
    p_d, c_d, f_d = p_day * 0.25, c_day * 0.25, f_day * 0.25
    p_a, c_a, f_a = p_day * 0.40, c_day * 0.40, f_day * 0.40
    p_s, c_s, f_s = p_day * 0.15, c_day * 0.15, f_day * 0.15
    p_c, c_c, f_c = p_day * 0.20, c_day * 0.20, f_day * 0.20

    # Funciones cortas para la gramática
    def gd(type): 
        if type == 'huevos': return prot_huevo(p_d)
        if type == 'avena': return carb_avena(c_d)
        if type == 'pan': return carb_pan(c_d)
        if type == 'queso': return prot_queso(p_d)
        if type == 'palta': return fat_palta(f_d)
        if type == 'fruta': return carb_fruta(c_d)
        return 1
        
    def ga(type): 
        if type == 'pollo': return prot_pollo(p_a)
        if type == 'pescado': return prot_pescado(p_a)
        if type == 'cerdo': return prot_cerdo(p_a)
        if type == 'arroz': return carb_arroz(c_a)
        if type == 'papa': return carb_papa(c_a)
        if type == 'tofu': return prot_tofu(p_a)
        return 1
        
    def gs(type): 
        if type == 'yogurt': return prot_queso(p_s) * 2
        if type == 'almendra': return fat_almendra(f_s)
        if type == 'fruta': return carb_fruta(c_s)
        if type == 'huevo': return prot_huevo(p_s)
        return 1
        
    def gc(type): 
        if type == 'pollo': return prot_pollo(p_c)
        if type == 'pescado': return prot_pescado(p_c)
        if type == 'cerdo': return prot_cerdo(p_c)
        if type == 'arroz': return carb_arroz(c_c)
        if type == 'papa': return carb_papa(c_c)
        if type == 'huevos': return prot_huevo(p_c)
        if type == 'pan': return carb_pan(c_c)
        if type == 'palta': return fat_palta(f_c)
        return 1
        
    templates = {
        "balanced": {
            "desayuno": [
                {"n": "Huevos revueltos jugosos con espinaca y pan", "items": [f"{gd('huevos')} huevos enteros", "Espinaca tierna picada", f"{gd('pan')} rebanadas de pan integral"], "pb": ["Batido de avena y clara pasteurizada"]},
                {"n": "Avena cremosa con manzana y toque de canela", "items": [f"{gd('avena')}g de avena", f"{gd('fruta')} manzana fresca", f"{gd('queso')}g de yogurt griego", "Canela al gusto"], "pb": ["Yogurt griego con almendras crujientes"]},
                {"n": "Tostadas crujientes con palta y queso fresco", "items": [f"{gd('pan')} rebanadas de pan integral", f"{gd('palta')}g de palta en su punto", f"{gd('queso')}g de queso fresco bajo en sal"], "pb": ["Tortilla de huevo esponjosa con verduras"]},
                {"n": "Panqueques doraditos de avena", "items": [f"{gd('avena')}g de avena licuada", f"{gd('fruta')} plátano dulce", f"{gd('huevos')} huevo(s)"], "pb": ["Tostadas con mermelada light y ricotta"]},
                {"n": "Bowl fresco de yogurt griego", "items": [f"{gd('queso')*1.5}g de yogurt griego", f"{gd('palta')}g de almendras", f"Arándanos frescos"], "pb": ["Pudding de chía proteico"]}
            ],
            "almuerzo": [
                {"n": "Pecho de pollo a la plancha con quinua", "items": [f"{ga('pollo')}g de pechuga de pollo jugosa", f"{ga('arroz')}g de quinua graneada", "Ensalada mixta con mucho limón"], "pb": ["Ensalada de garbanzos con trozos de pollo"]},
                {"n": "Pescado al horno al limón con camote", "items": [f"{ga('pescado')}g de pescado blanco tierno", f"{ga('papa')}g de camote dulcito", "Vainitas y zanahoria salteadas"], "pb": ["Ceviche de pollo fresquito"]},
                {"n": "Pavo horneado con arroz integral", "items": [f"{ga('pollo')}g de pechuga de pavo", f"{ga('arroz')}g de arroz integral", "Brócoli tierno al vapor"], "pb": ["Tarta express de verduras y carne"]},
                {"n": "Pasta boloñesa magra y saludable", "items": [f"{ga('pollo')}g de carne molida magra", f"{ga('arroz')}g de fideos integrales cocidos", "Salsa de tomate natural casera"], "pb": ["Lomo saltado saludable (cero fritura)"]},
                {"n": "Lomo de cerdo a la parrilla con puré", "items": [f"{ga('cerdo')}g lomo de cerdo tierno", f"{ga('papa')}g puré de papa cremoso", "Ensalada fresca de tomate"], "pb": ["Pollo asado al limón con vegetales"]}
            ],
            "snack": [
                {"n": "Copa de yogurt griego y frutos secos", "items": [f"{gs('yogurt')}g de yogurt griego", f"{gs('almendra')}g de almendras o nueces"], "pb": ["Kefir probiótico con linaza"]},
                {"n": "Huevo duro con rodajitas de pepino", "items": [f"{gs('huevo')} huevo(s) duro(s)", "1 pepino en rodajas con limón y sal"], "pb": ["Queso cottage cremoso con apio"]},
                {"n": "Manzana verde con mantequilla de maní", "items": ["1 manzana verde ácida", f"{gs('almendra')}g de mantequilla de maní"], "pb": ["Galletas de arroz con palta untada"]}
            ],
            "cena": [
                {"n": "Pollo deshilachado con verduritas al vapor", "items": [f"{gc('pollo')}g de pechuga de pollo calientita", "Espinaca, brócoli y vainitas tiernas"], "pb": ["Tortilla esponjosa de claras con espinaca"]},
                {"n": "Omelette de claras tipo nube", "items": [f"{gc('huevos')} claras de huevo y 1 yema", "Espinaca fresca y champiñones", f"{gc('pan')} tostada integral"], "pb": ["Crema calientita de espárragos con pollo"]},
                {"n": "Medallones de cerdo magro con puré", "items": [f"{gc('cerdo')}g de lomo de cerdo al horno", f"{gc('papa')}g de puré de papa o manzana casero"], "pb": ["Wrap ligero de pavo y lechuga"]},
                {"n": "Sopa a la minuta reconfortante", "items": [f"{gc('pollo')}g carne extra magra", f"{gc('arroz')}g fideos cabello de ángel", "Caldo casero concentrado"], "pb": ["Sopa de verduras en trozos con pavita"]},
                {"n": "Wrap estilo fajita de pollo y palta", "items": [f"{gc('pan')} tortilla integral suave", f"{gc('pollo')}g pollo a la plancha", f"{gc('palta')}g de láminas de palta y tomate"], "pb": ["Sándwich triple integral pollo-huevo"]}
            ]
        },
        "vegetarian": {
            "desayuno": [
                {"n": "Huevos revueltos campestres con tomate", "items": [f"{gd('huevos')} huevos enteros", "1 tomate jugoso picado", f"{gd('pan')} rebanadas de pan integral"], "pb": ["Batido de avena con trozos de manzana"]},
                {"n": "Avena power con chía y bebida vegetal", "items": [f"{gd('avena')}g de avena calientita", "1 cda de chía", f"{gd('queso')}ml de leche de soya o almendras"], "pb": ["Yogurt de soya cremoso con nueces"]},
            ],
            "almuerzo": [
                {"n": "Quinua graneadita con tofu oriental", "items": [f"{ga('tofu')}g de tofu firme dorado", f"{ga('arroz')}g de quinua cocida", "Brócoli y zanahoria salteados al wok"], "pb": ["Bowl proteico de tempeh y vegetales"]},
                {"n": "Guiso casero de lentejas con arroz", "items": [f"{ga('tofu')}g de lentejas cocidas como en casa", f"{ga('arroz')}g de arroz integral", "Ensalada criolla de cebolla"], "pb": ["Ensalada fresca de quinua y garbanzos"]},
            ],
            "snack": [
                {"n": "Yogurt griego con pipas de girasol", "items": [f"{gs('yogurt')}g de yogurt griego natural", f"{gs('almendra')}g de semillas de girasol peladas"], "pb": ["Yogurt natural con chía activada"]},
                {"n": "Huevo duro con almendras crocantes", "items": [f"{gs('huevo')} huevo duro en su punto", f"{gs('almendra')}g de almendras tostadas"], "pb": ["Cottage cheese con trozos de manzana"]},
            ],
            "cena": [
                {"n": "Ensalada de la huerta con queso fresco", "items": [f"{gc('pollo')}g de queso fresco en cubos", "Ensalada verde con pepino crocante", "Toque de aceite de oliva"], "pb": ["Tortilla de claras con calabacín rallado"]},
                {"n": "Tortilla francesa de vegetales coloridos", "items": [f"{gc('huevos')} huevos enteros batidos", "Calabacín y pimiento en tiras", f"{gc('pan')} rebanada de pan integral"], "pb": ["Panqueque salado de avena y hierbas"]},
            ]
        },
        "vegan": {
             "desayuno": [
                {"n": "Revuelto vegano de Tofu con espinaca", "items": [f"{gd('queso')*2}g de tofu firme desmenuzado", "Espinaca picada salteada", f"{gd('pan')} rebanadas de pan integral"], "pb": ["Batido de avena con proteína de arveja"]},
                {"n": "Avena power con leche de soya y plátano", "items": [f"{gd('avena')}g de avena en hojuelas", f"{gd('fruta')} plátano maduro", f"{gd('queso')}ml de leche de soya", "1 cda de mantequilla de maní"], "pb": ["Smoothie verde de espinaca y mango"]},
                {"n": "Tostadas con hummus casero y palta", "items": [f"{gd('pan')} rebanadas de pan integral", f"{gd('palta')}g de palta cremosa", "Hummus de garbanzos casero", "Tomate cherry en rodajas"], "pb": ["Pudding de chía con leche de coco"]},
                {"n": "Pancakes veganos de avena y banana", "items": [f"{gd('avena')}g de avena licuada", f"{gd('fruta')} plátano maduro", "1 cda de linaza molida + 3 cdas agua"], "pb": ["Granola casera con bebida vegetal"]},
             ],
             "almuerzo": [
                {"n": "Bowl proteico de tempeh y arroz", "items": [f"{ga('tofu')}g de tempeh asado a la parrilla", f"{ga('arroz')}g de arroz integral", "Vainitas tiernas espolvoreadas con ajonjolí"], "pb": ["Sopa espesa y reconfortante de lentejas rojas"]},
                {"n": "Guiso potente de lentejas con arroz", "items": [f"{ga('tofu')}g de lentejas cocidas con comino", f"{ga('arroz')}g de arroz integral", "Ensalada criolla fresca"], "pb": ["Tacu tacu vegano de lentejas"]},
                {"n": "Pasta integral con salsa de tofu y espinaca", "items": [f"{ga('tofu')}g de tofu firme desmenuzado", f"{ga('arroz')}g de fideos integrales cocidos", "Salsa de tomate natural y espinaca"], "pb": ["Wrap de garbanzos y verduras al horno"]},
                {"n": "Quinua graneada con garbanzos al curry", "items": [f"{ga('tofu')}g de garbanzos cocidos", f"{ga('arroz')}g de quinua graneada", "Salsa de curry suave con leche de coco"], "pb": ["Buddha bowl de quinua y vegetales"]},
             ],
             "snack": [
                {"n": "Snack de nueces y manzana crocante", "items": [f"{gs('almendra')}g de nueces o almendras tostadas", "1 manzana fresca y dulce"], "pb": ["Mix energético de frutos secos"]},
                {"n": "Hummus cremoso con palitos de zanahoria", "items": [f"{gs('almendra')*2}g de hummus casero", "Bastones de zanahoria y apio"], "pb": ["Galletas de arroz con mantequilla de maní"]},
                {"n": "Batido proteico de soya y cacao", "items": [f"{gs('yogurt')}ml de leche de soya", "1 cda de cacao en polvo sin azúcar", f"{gs('almendra')}g de mantequilla de maní"], "pb": ["Barritas caseras de avena y dátiles"]},
             ],
             "cena": [
                {"n": "Chaufa vegano de quinua al wok", "items": [f"{gc('arroz')}g de quinua graneada suelta", "Cebollita china, toques de sillao y verduritas", f"{gc('pollo')}g de seitán en daditos"], "pb": ["Berenjenas asadas bañadas en salsa de ajonjolí"]},
                {"n": "Sopa reconfortante de lentejas rojas", "items": [f"{gc('pollo')}g de lentejas rojas", f"{gc('arroz')}g de fideos de arroz", "Caldo de verduras con kión y cúrcuma"], "pb": ["Crema de zapallo con semillas de girasol"]},
                {"n": "Tacos veganos de frijoles negros", "items": [f"{gc('pan')} tortillas de maíz", f"{gc('pollo')}g de frijoles negros refritos", f"{gc('palta')}g de palta y tomate fresco"], "pb": ["Bowl de arroz con frijoles y palta"]},
             ]
        },
        "keto": {
             "desayuno": [
                {"n": "Desayuno Keto: Huevos, tocino y palta", "items": [f"{gd('huevos')} huevos enteros de corral", f"{gd('palta')}g de palta en rodajas", "Toque de tocino doradito"], "pb": ["Omelette quesudo con jamón artesanal"]},
                {"n": "Omelette de queso con champiñones", "items": [f"{gd('huevos')} huevos batidos", f"{gd('queso')}g de queso mozzarella", "Champiñones salteados en mantequilla"], "pb": ["Revuelto de huevos con espinaca y queso"]},
                {"n": "Bowl keto de yogurt griego y nueces", "items": [f"{gd('queso')*2}g de yogurt griego sin azúcar", f"{gd('palta')//2}g de nueces pecanas", "Ralladura de coco sin azúcar"], "pb": ["Batido keto de cacao y palta"]},
             ],
             "almuerzo": [
                {"n": "Pollo asado jugoso con costra de mozzarella", "items": [f"{ga('pollo')}g de pechuga o muslo de pollo", f"{ga('pollo')//2}g de queso mozzarella gratinado", "Floretes de brócoli bañados en mantequilla"], "pb": ["Ensalada Cobb contundente"]},
                {"n": "Salmón o pescado al horno con espárragos", "items": [f"{ga('pescado')}g de filete de salmón o pescado", "Espárragos asados con aceite de oliva", f"{ga('pollo')//3}g de queso parmesano"], "pb": ["Ensalada de atún con palta y aceite de oliva"]},
                {"n": "Carne molida con espinacas gratinadas", "items": [f"{ga('cerdo')}g de carne molida magra", "Espinacas salteadas con ajo", f"{ga('pollo')//3}g de queso gratinado"], "pb": ["Hamburguesa sin pan con lechuga y queso"]},
             ],
             "snack": [
                {"n": "Cubos de queso cheddar y almendras", "items": [f"{gs('yogurt')//2}g de queso cheddar en cubitos", f"{gs('almendra')}g de almendras enteras"], "pb": ["Bolsita de chicharrón de cerdo crujiente"]},
                {"n": "Rollitos de jamón con queso crema", "items": ["3 fetas de jamón serrano", f"{gs('yogurt')//2}g de queso crema", "Pepinillos encurtidos"], "pb": ["Aceitunas verdes rellenas con almendras"]},
                {"n": "Palta rellena con atún", "items": [f"{gs('almendra')*2}g de palta", "1 lata pequeña de atún en aceite", "Limón y sal al gusto"], "pb": ["Huevo duro con mayonesa casera keto"]},
             ],
             "cena": [
                {"n": "Pescado blanco bañado en crema de espinacas", "items": [f"{gc('pescado')}g de filete de pescado doradito", "Espinacas tiernas sumergidas en crema de leche"], "pb": ["Ensalada César abundante con pollo (cero croutones)"]},
                {"n": "Pollo a la mantequilla con brócoli", "items": [f"{gc('pollo')}g de muslo de pollo dorado", "Salsa de mantequilla y ajo", "Brócoli al vapor con queso"], "pb": ["Wrap de lechuga con pollo deshilachado"]},
                {"n": "Lomo de cerdo con ensalada de palta", "items": [f"{gc('cerdo')}g de lomo de cerdo al horno", f"{gc('palta')}g de palta en láminas", "Ensalada de rúcula con aceite de oliva"], "pb": ["Sopa cremosa de coliflor keto"]},
             ]
        }
    }
    
    # Rellenar con fallback si el tipo de alimentación tiene pocas opciones
    # IMPORTANTE: Vegano jamás hereda de balanced (contiene carne), usa vegetarian como fallback
    if diet_type == "vegan":
        for m_type in ["desayuno", "almuerzo", "snack", "cena"]:
            if len(templates["vegan"][m_type]) < 5:
                # Filtrar recetas vegetarianas que no tengan huevo/lácteo explícito en el nombre
                veg_fallback = [r for r in templates["vegetarian"][m_type]]
                templates["vegan"][m_type].extend(veg_fallback)
    elif diet_type == "keto":
        # Keto puede heredar de balanced ya que ambos incluyen proteína animal
        for m_type in ["desayuno", "almuerzo", "snack", "cena"]:
            if len(templates["keto"][m_type]) < 5:
                templates["keto"][m_type].extend(templates["balanced"][m_type])
                
    return templates.get(diet_type, templates["balanced"])


# ── Base de datos de ejercicios por equipamiento (Con Empatía Axioma 1) ──
EXERCISES_BY_EQUIP = {
    "gym": {
        "FullBody": [
            {"name": "Sentadilla libre o en máquina", "sets": 3, "reps": "10-12", "rest_sec": 60, "muscle": "Piernas", "substitute": "Prensa de piernas", "avoid_if_injury": ["rodilla", "lumbar"], "technique": "Baja controlando el peso hasta romper el paralelo (o hasta donde tu movilidad lo permita), manteniendo la espalda recta.", "tip": "¡Empuja el suelo con los talones! Imagina que quieres hundir la plataforma. 🦦💥"},
            {"name": "Press de banca con mancuernas", "sets": 3, "reps": "10-12", "rest_sec": 60, "muscle": "Pecho", "substitute": "Máquina de pecho", "avoid_if_injury": ["hombro"], "technique": "Junta las escápulas atrás, baja las mancuernas abriendo el pecho y empuja fuerte hacia arriba.", "tip": "Controla la bajada en 3 segundos, ¡ahí está el secreto para crecer! 🦦✨"},
            {"name": "Jalón al pecho (Polea)", "sets": 3, "reps": "12", "rest_sec": 60, "muscle": "Espalda", "substitute": "Remo en polea baja", "avoid_if_injury": ["muñeca"], "technique": "Tira de la barra hacia la parte superior de tu pecho, sacando pecho y juntando la espalda.", "tip": "No uses impulso, haz que tu espalda haga todo el trabajo duro. ¡Vamos! 🦦💪"}
        ],
        "Upper": [
            {"name": "Press banca con barra", "sets": 3, "reps": "8-10", "rest_sec": 90, "muscle": "Pecho", "substitute": "Press mancuernas", "avoid_if_injury": ["hombro"], "technique": "Planta bien los pies en el suelo, haz un ligero arco en la espalda y empuja con potencia.", "tip": "¡Concéntrate! Eres más fuerte de lo que crees. 🦦🔥"},
            {"name": "Jalón al pecho", "sets": 3, "reps": "10-12", "rest_sec": 75, "muscle": "Espalda", "substitute": "Remo con mancuerna", "avoid_if_injury": ["muñeca", "hombro"], "technique": "Imagina que quieres meter los codos en tus bolsillos traseros al tirar de la barra.", "tip": "Aprieta la espalda un segundo abajo antes de subir la barra. ¡Quema rico! 🦦🔥"},
            {"name": "Press militar con mancuernas", "sets": 3, "reps": "10-12", "rest_sec": 75, "muscle": "Hombros", "substitute": "Elevaciones laterales", "avoid_if_injury": ["lumbar"], "technique": "Siéntate derecho, empuja las mancuernas por encima de tu cabeza sin arquear de más la zona lumbar.", "tip": "Respira hondo antes de empujar, ¡protege tu espalda y dalo todo! 🦦🛡️"},
            {"name": "Curl de bíceps alterno", "sets": 3, "reps": "12", "rest_sec": 60, "muscle": "Bíceps", "substitute": "Curl polea", "avoid_if_injury": ["codo"], "technique": "Pega los codos a tus costillas y sube la mancuerna girando ligeramente la muñeca hacia afuera.", "tip": "¡No te balancees! Si necesitas balancearte, bájale un poco al peso. ¡Calidad > Cantidad! 🦦☝️"}
        ],
        "Lower": [
            {"name": "Prensa de piernas inclinada", "sets": 4, "reps": "10-12", "rest_sec": 90, "muscle": "Piernas", "substitute": "Zancadas", "avoid_if_injury": ["rodilla"], "technique": "Coloca los pies al ancho de tus hombros, baja la plataforma profundamente sin despegar la cadera del asiento.", "tip": "¡No bloquees (estires de golpe) las rodillas arriba! Mantén la tensión constante. 🦦🦵"},
            {"name": "Curl de piernas acostado", "sets": 3, "reps": "12-15", "rest_sec": 60, "muscle": "Femorales", "substitute": "Peso muerto rumano", "avoid_if_injury": ["lumbar"], "technique": "Acuéstate boca abajo y flexiona las rodillas llevando el rodillo hacia tus glúteos controladamente.", "tip": "La bajada debe ser súper lenta, ¡siente cómo se estira el músculo! 🦦✨"},
            {"name": "Elevación de talones en máquina", "sets": 3, "reps": "15-20", "rest_sec": 45, "muscle": "Pantorrillas", "substitute": "Elevación de talones libre", "avoid_if_injury": ["tobillo", "rodilla"], "technique": "Párate sobre las puntas de los pies, estira al máximo arriba y baja hasta sentir un estiramiento profundo.", "tip": "Las pantorrillas son tercas, ¡así que dales con todo y aguanta el ardor! 🦦🔥"},
            {"name": "Extensiones de cuádriceps", "sets": 3, "reps": "15", "rest_sec": 60, "muscle": "Cuádriceps", "substitute": "Sentadilla Sissy", "avoid_if_injury": ["rodilla"], "technique": "Extiende las piernas por completo y aprieta los muslos un segundo arriba antes de bajar lento.", "tip": "Este ejercicio es genial para esculpir las piernas, ¡concéntrate en apretar fuerte! 🦦💎"}
        ],
        "Push": [
            {"name": "Press banca con barra", "sets": 3, "reps": "8-10", "rest_sec": 90, "muscle": "Pecho", "substitute": "Press mancuernas", "avoid_if_injury": ["hombro"], "technique": "Alinea la barra con tu pecho medio, baja controlando y empuja fuerte.", "tip": "¡Un clásico infalible! Si te cuesta, pídele ayuda a alguien, ¡no hay que tener vergüenza en el gym! 🦦🤝"},
            {"name": "Press militar con mancuernas", "sets": 3, "reps": "10-12", "rest_sec": 75, "muscle": "Hombros", "substitute": "Elevaciones laterales", "avoid_if_injury": ["lumbar"], "technique": "Mantén el abdomen súper apretado mientras empujas las pesas hacia arriba.", "tip": "¡Hombros de acero en construcción! Siente la quemazón y sonríe. 🦦😁"},
            {"name": "Extensiones de tríceps en polea", "sets": 3, "reps": "12-15", "rest_sec": 60, "muscle": "Tríceps", "substitute": "Fondos en banco", "avoid_if_injury": ["codo"], "technique": "Pega los codos a tu cuerpo como si estuvieran pegados con pegamento. Solo mueve los antebrazos.", "tip": "¡Abre ligeramente la cuerda al final del recorrido para un extra de contracción! 🦦💥"}
        ],
        "Pull": [
            {"name": "Jalón al pecho", "sets": 3, "reps": "10-12", "rest_sec": 75, "muscle": "Espalda", "substitute": "Remo con mancuerna", "avoid_if_injury": ["muñeca", "hombro"], "technique": "Saca pecho de paloma y tira de la barra hacia la base de tu cuello.", "tip": "Visualiza tu espalda trabajando, ¡esa conexión mente-músculo es oro puro! 🦦🧠"},
            {"name": "Remo en polea baja", "sets": 3, "reps": "10-12", "rest_sec": 75, "muscle": "Espalda", "substitute": "Remo con barra", "avoid_if_injury": ["lumbar"], "technique": "Mantén la espalda recta en todo momento, tira del maneral hacia tu ombligo.", "tip": "Junta las escápulas fuerte atrás, como si quisieras aplastar una nuez entre ellas. 🦦🌰"},
            {"name": "Curl de bíceps con barra Z", "sets": 3, "reps": "12-15", "rest_sec": 60, "muscle": "Bíceps", "substitute": "Curl martillo", "avoid_if_injury": ["codo"], "technique": "Sujeta la barra por la curva natural, sube apretando y baja en 3 segunditos.", "tip": "¡Bíceps a reventar! No dejes que la gravedad gane al bajar. 🦦💪"}
        ],
        "Legs": [
            {"name": "Prensa de piernas", "sets": 3, "reps": "10-12", "rest_sec": 90, "muscle": "Piernas", "substitute": "Zancadas", "avoid_if_injury": ["rodilla"], "technique": "Baja todo lo que puedas sin que tus glúteos se levanten del asiento.", "tip": "¡Este es tu momento de brillar! Las piernas son tu motor, dales fuerte. 🦦🚀"},
            {"name": "Curl de piernas acostado", "sets": 3, "reps": "12-15", "rest_sec": 60, "muscle": "Femorales", "substitute": "Peso muerto rumano", "avoid_if_injury": ["lumbar"], "technique": "Pega bien la cadera al banco y concéntrate en doblar solo las rodillas.", "tip": "Unos femorales fuertes previenen lesiones. ¡Tú puedes con la última serie! 🦦🛡️"},
            {"name": "Elevación de talones en máquina", "sets": 3, "reps": "15-20", "rest_sec": 45, "muscle": "Pantorrillas", "substitute": "Elevación de talones libre", "avoid_if_injury": ["tobillo", "rodilla"], "technique": "Movimiento lento y controlado, pausando un segundo abajo y otro segundo bien arriba.", "tip": "Imagina que te estás parando de puntillas para ver por encima de una pared alta. 🦦🧱"}
        ]
    },
    "home": {
        "FullBody": [
            {"name": "Sentadillas goblet (o con cualquier peso pesado)", "sets": 3, "reps": "15", "rest_sec": 45, "muscle": "Piernas", "substitute": "Sentadillas libres", "avoid_if_injury": ["rodilla"], "technique": "Abraza el peso contra tu pecho, mantén el torso erguido y agáchate profundo.", "tip": "Incluso un termo grande o una mochila pesada sirve si no tienes mancuernas. ¡Creatividad al poder! 🦦🎒"},
            {"name": "Flexiones de pecho (rodillas o piso)", "sets": 3, "reps": "12", "rest_sec": 45, "muscle": "Pecho", "substitute": "Press de piso mancuernas", "avoid_if_injury": ["muñeca"], "technique": "Manos un poco más abiertas que los hombros, baja hasta que tu pecho roce el suelo.", "tip": "Si te cuesta mucho, apoya las rodillas o hazlas contra el borde del sofá. ¡Poco a poco! 🦦🛋️"},
            {"name": "Remo con mancuernas a dos manos", "sets": 3, "reps": "12", "rest_sec": 45, "muscle": "Espalda", "substitute": "Superman", "avoid_if_injury": ["lumbar"], "technique": "Inclina el torso hacia adelante sacando glúteos y tira de los pesos hacia tus caderas.", "tip": "Imagina que estás serruchando madera. ¡Tira con fuerza desde la espalda! 🦦🪚"}
        ],
        "Upper": [
            {"name": "Flexiones de pecho", "sets": 3, "reps": "12-15", "rest_sec": 60, "muscle": "Pecho", "substitute": "Flexiones de pared", "avoid_if_injury": ["muñeca", "hombro"], "technique": "Cuerpo totalmente recto, como una tabla. Activa el abdomen.", "tip": "Si haces la bajada muy lenta (3 segundos), el ejercicio se sentirá el doble de intenso. 🦦⏳"},
            {"name": "Remo con mancuernas a dos manos", "sets": 3, "reps": "10-12", "rest_sec": 75, "muscle": "Espalda", "substitute": "Remo a una mano apoyado", "avoid_if_injury": ["lumbar"], "technique": "Mantén el cuello neutro (mirando ligeramente al piso delante tuyo) para no tensar las cervicales.", "tip": "¡Concéntrate! Estás construyendo una postura preciosa con este ejercicio. 🦦✨"},
            {"name": "Press de hombros con mancuernas (o botellas pesadas)", "sets": 3, "reps": "10-12", "rest_sec": 75, "muscle": "Hombros", "substitute": "Elevaciones frontales", "avoid_if_injury": ["lumbar"], "technique": "Sentado o de pie, empuja el peso sobre tu cabeza sin ayudarte de las rodillas.", "tip": "Controla el peso al bajar, ¡no lo dejes caer como si quemara! 🦦🔥"},
            {"name": "Copa de tríceps", "sets": 3, "reps": "12-15", "rest_sec": 60, "muscle": "Tríceps", "substitute": "Press francés piso", "avoid_if_injury": ["codo"], "technique": "Toma un peso con ambas manos detrás de tu cabeza y estira los brazos apuntando al techo.", "tip": "Mantén los codos cerquita de tus orejas. ¡Chau flacidez en los brazos! 🦦💪"}
        ],
        "Lower": [
            {"name": "Sentadillas goblet con peso", "sets": 3, "reps": "12-15", "rest_sec": 75, "muscle": "Piernas", "substitute": "Sentadillas al cajón", "avoid_if_injury": ["rodilla"], "technique": "Baja profundo como si te sentaras en una silla muy bajita y empuja con fuerza para subir.", "tip": "¡Las piernas fuertes son el pilar de un cuerpo sano! Dale con actitud. 🦦🦵"},
            {"name": "Zancadas estáticas en el sitio", "sets": 3, "reps": "12-15 (por pierna)", "rest_sec": 60, "muscle": "Piernas", "substitute": "Elevación pélvica", "avoid_if_injury": ["rodilla"], "technique": "Da un paso largo, baja rectito hasta que tu rodilla trasera casi toque el suelo, y sube.", "tip": "El equilibrio aquí es clave, ¡mira a un punto fijo al frente y no te rindas! 🦦🎯"},
            {"name": "Puente de glúteos en el suelo", "sets": 3, "reps": "20", "rest_sec": 60, "muscle": "Glúteos/Isquios", "substitute": "Hip thrust piso", "avoid_if_injury": ["lumbar"], "technique": "Acuéstate boca arriba, dobla rodillas y empuja tu pelvis hacia el techo contrayendo glúteos.", "tip": "Aprieta tus glúteos arriba durante 2 segunditos en cada repetición. ¡Quema delicioso! 🦦🍑"},
            {"name": "Elevación de talones de pie", "sets": 3, "reps": "20", "rest_sec": 45, "muscle": "Pantorrillas", "substitute": "Elevaciones a un pie", "avoid_if_injury": ["tobillo"], "technique": "Apóyate en una pared para no caerte y sube sobre tus puntas lo más alto que puedas.", "tip": "Puedes sostener una mochila pesada para darle más intensidad. ¡Hazlas lentas! 🦦🎒"}
        ],
        "Push": [
            {"name": "Flexiones de pecho", "sets": 3, "reps": "12-15", "rest_sec": 60, "muscle": "Pecho", "substitute": "Flexiones de pared", "avoid_if_injury": ["muñeca", "hombro"], "technique": "Activa fuerte tu abdomen, baja tu cuerpo en bloque y empuja firme.", "tip": "Cada flexión cuenta, ¡incluso si las haces apoyando rodillas, estás ganando fuerza real! 🦦⚡"},
            {"name": "Press de hombros en casa", "sets": 3, "reps": "10-12", "rest_sec": 75, "muscle": "Hombros", "substitute": "Elevaciones frontales", "avoid_if_injury": ["lumbar"], "technique": "Empuja las botellas, bidones o mancuernas sobre tu cabeza de forma controlada.", "tip": "¡Imagina que estás levantando el trofeo de un campeón! 🦦🏆"},
            {"name": "Copa de tríceps", "sets": 3, "reps": "12-15", "rest_sec": 60, "muscle": "Tríceps", "substitute": "Press francés piso", "avoid_if_injury": ["codo"], "technique": "Mantén el tronco firme y no encorves la espalda al bajar el peso tras tu nuca.", "tip": "¡Concéntrate! Estás esculpiendo esos bracitos para lucirlos sin miedo. 🦦✨"}
        ],
        "Pull": [
            {"name": "Remo con mancuernas (o peso casero)", "sets": 3, "reps": "10-12", "rest_sec": 75, "muscle": "Espalda", "substitute": "Remo a una mano apoyado", "avoid_if_injury": ["lumbar"], "technique": "Saca el pecho, espalda derechita y tira de los pesos rozando tus costados.", "tip": "Respira hondo al bajar el peso y bota el aire fuerte al tirar. ¡Ritmo perfecto! 🦦🌬️"},
            {"name": "Curl de bíceps casero", "sets": 3, "reps": "12-15", "rest_sec": 60, "muscle": "Bíceps", "substitute": "Curl martillo", "avoid_if_injury": ["codo"], "technique": "Codos pegados al cuerpo, flexiona los brazos contrayendo fuerte los bíceps.", "tip": "¡No uses el impulso de la espalda! Si haces trampa, la que pierde fuerza eres tú. 🦦👀"},
            {"name": "Superman en piso", "sets": 3, "reps": "15", "rest_sec": 60, "muscle": "Espalda baja", "substitute": "Puente de glúteo isom", "avoid_if_injury": ["cervical"], "technique": "Acuéstate boca abajo y eleva al mismo tiempo tus brazos y piernas del suelo por un segundito.", "tip": "Fortalecer la espalda baja es la mejor forma de decir adiós a los dolores de oficina. ¡Vuela alto! 🦦🦸"}
        ],
        "Legs": [
            {"name": "Sentadillas goblet pesadas", "sets": 3, "reps": "12-15", "rest_sec": 75, "muscle": "Piernas", "substitute": "Sentadillas al cajón", "avoid_if_injury": ["rodilla"], "technique": "Los talones no deben despegarse nunca del suelo. Si lo hacen, separa un poquito más las piernas.", "tip": "¡Tú puedes! Las piernas aguantan muchísimo, así que dales un buen reto. 🦦🔥"},
            {"name": "Zancadas en el sitio", "sets": 3, "reps": "12-15 (c/p)", "rest_sec": 60, "muscle": "Piernas", "substitute": "Elevación pélvica", "avoid_if_injury": ["rodilla"], "technique": "Mantén el torso erguido. Tu rodilla delantera no debe pasar en exceso la punta de tu pie.", "tip": "Da el paso con seguridad y empuja fuerte el suelo para volver a subir. 🦦✨"}
        ]
    },
    "outdoor": {
        "FullBody": [
            {"name": "Burpees o Medio Burpees", "sets": 3, "reps": "10", "rest_sec": 45, "muscle": "Cuerpo Completo", "substitute": "Jumping Jacks", "avoid_if_injury": ["rodilla", "muñeca"], "technique": "Apoya las manos, lleva pies atrás, vuelve adelante y da un pequeño salto. Hazlo a tu ritmo.", "tip": "¡El rey quema-grasa por excelencia! Yo sé que cansan, pero los resultados lo valen al mil. 🦦💦"},
            {"name": "Dominadas australianas (Barra Baja)", "sets": 3, "reps": "10", "rest_sec": 45, "muscle": "Espalda", "substitute": "Remo con banda elástica", "avoid_if_injury": ["codo"], "technique": "Busca una barra baja en el parque, métete debajo, cuerpo recto y tira de ti hacia la barra.", "tip": "Imagina que eres una tabla súper firme, ¡nada de hundir las caderas! 🦦📏"},
            {"name": "Sentadillas explosivas con salto", "sets": 3, "reps": "15", "rest_sec": 45, "muscle": "Piernas", "substitute": "Sentadillas isométricas", "avoid_if_injury": ["rodilla"], "technique": "Haz una sentadilla normal y al subir despega los pies del piso. Aterriza suave amortiguando.", "tip": "¡Siente la potencia en tus piernas! Aterriza suave como un ninja para cuidar tus rodillas. 🦦🥷"}
        ],
        "Upper": [
            {"name": "Fondos en paralelas del parque", "sets": 3, "reps": "8-10", "rest_sec": 60, "muscle": "Tríceps/Pecho", "substitute": "Fondos en banca corta", "avoid_if_injury": ["hombro", "codo"], "technique": "Inclínate un poquito hacia adelante para enfocar más el pecho, baja hasta que tus brazos hagan un ángulo de 90 grados.", "tip": "Este es de los ejercicios más rudos y efectivos de calistenia. ¡Pura fuerza real! 🦦🔥"},
            {"name": "Dominadas colgado en barra fija", "sets": 3, "reps": "6-8", "rest_sec": 90, "muscle": "Espalda", "substitute": "Dominadas excéntricas", "avoid_if_injury": ["codo", "hombro"], "technique": "Cuelga con los brazos estirados y tira fuerte pasando la barbilla sobre la barra.", "tip": "Si aún no sacas una completa, ¡haz negativas! Salta y baja leeeeento. Es el secreto mágico. 🦦✨"},
            {"name": "Flexiones declinadas (Pies en banco)", "sets": 3, "reps": "10", "rest_sec": 60, "muscle": "Pecho superior", "substitute": "Flexiones normales", "avoid_if_injury": ["hombro", "muñeca"], "technique": "Sube los pies a un banco del parque y haz flexiones normales. Mantén el core súper duro.", "tip": "¡Esto le dará una forma preciosa y levantada a tu pecho y hombros! 🦦💯"},
            {"name": "Dominadas supinas (Palmas hacia ti)", "sets": 3, "reps": "6-8", "rest_sec": 60, "muscle": "Bíceps/Espalda", "substitute": "Dominadas isométricas", "avoid_if_injury": ["codo"], "technique": "Agarra la barra con las palmas mirándote y tira fuerte. Toca la barra con el pecho superior.", "tip": "¡Excelente para unos bíceps gigantes sin necesidad de pesas! 🦦💪"}
        ],
        "Lower": [
            {"name": "Sentadillas libres con salto", "sets": 3, "reps": "12-15", "rest_sec": 60, "muscle": "Piernas", "substitute": "Sentadillas isométricas", "avoid_if_injury": ["rodilla"], "technique": "Baja profundo y usa toda tu explosividad para saltar hacia arriba.", "tip": "Bota el aire fuerte al saltar, ¡te dará más potencia! 🦦💥"},
            {"name": "Zancadas caminando por el parque", "sets": 3, "reps": "20 pasos", "rest_sec": 60, "muscle": "Piernas", "substitute": "Subidas a banco de parque", "avoid_if_injury": ["rodilla"], "technique": "Avanza dando pasos largos y profundos, rozando casi el pasto con tu rodilla trasera.", "tip": "Siente el aire libre mientras entrenas, ¡es una de las mejores sensaciones del día! 🦦🌳"},
            {"name": "Sprints cortos y explosivos", "sets": 5, "reps": "30m", "rest_sec": 90, "muscle": "Piernas potencia", "substitute": "Trote ligero", "avoid_if_injury": ["tobillo", "rodilla"], "technique": "Acelera a tu máxima velocidad por 30 metros, y regresa caminando lento para recuperarte.", "tip": "¡Corre como si te persiguiera un león (o un perrito muy juguetón)! Eso quemará grasa a mil. 🦦🦁"},
            {"name": "Elevación de talones en bordillo", "sets": 3, "reps": "20", "rest_sec": 45, "muscle": "Pantorrillas", "substitute": "Elevaciones suelo", "avoid_if_injury": ["tobillo"], "technique": "Usa la vereda o una piedra firme para bajar los talones más allá del ras de suelo y luego subir a tope.", "tip": "Aguanta un segundito en la punta arriba, ¡el ardor significa que están creciendo! 🦦🔥"}
        ],
        "Push": [
            {"name": "Flexiones en parque", "sets": 3, "reps": "12-15", "rest_sec": 60, "muscle": "Pecho", "substitute": "Flexiones banco de parque", "avoid_if_injury": ["muñeca"], "technique": "Manos firmes en el piso, baja controlando y sube con potencia.", "tip": "Puedes apoyar las rodillas si sientes que la técnica se pierde, ¡no pasa nada! 🦦💖"},
            {"name": "Fondos en paralelas o esquina", "sets": 3, "reps": "8-10", "rest_sec": 90, "muscle": "Tríceps/Pecho", "substitute": "Fondos en banca corta", "avoid_if_injury": ["hombro", "codo"], "technique": "Mantén los codos apuntando un poco hacia atrás y no hacia los lados para proteger el hombro.", "tip": "Baja con mucho control, este ejercicio es top para fortalecer brazos reales. 🦦🔝"},
            {"name": "Flexiones declinadas", "sets": 3, "reps": "10", "rest_sec": 60, "muscle": "Pecho superior", "substitute": "Flexiones normales", "avoid_if_injury": ["hombro"], "technique": "Coloca los pies en un escalón y empuja fuerte.", "tip": "Siente cómo todo el peso se va a los hombros, ¡es una rutina súper completa! 🦦✨"}
        ],
        "Pull": [
            {"name": "Dominadas colgado", "sets": 3, "reps": "6-8", "rest_sec": 90, "muscle": "Espalda", "substitute": "Dominadas excéntricas", "avoid_if_injury": ["codo", "hombro"], "technique": "Agárrate firme, activa la espalda e intenta tocar la barra con tu clavícula.", "tip": "Recuerda: Calidad por encima de cantidad. ¡Si haces 3 perfectas, valen por 10 mal hechas! 🦦🥇"},
            {"name": "Dominadas australianas (Barra baja)", "sets": 3, "reps": "10-12", "rest_sec": 75, "muscle": "Espalda", "substitute": "Remo colgante", "avoid_if_injury": ["lumbar"], "technique": "Tira de tu cuerpo hacia la barra apretando fuerte la espalda media.", "tip": "Ajusta la dificultad moviendo los pies más adelante o más atrás. ¡Tú mandas! 🦦🎛️"},
            {"name": "Elevaciones de rodillas colgado", "sets": 3, "reps": "12-15", "rest_sec": 60, "muscle": "Core", "substitute": "Plancha en suelo", "avoid_if_injury": ["hombro"], "technique": "Cuélgate y sube las rodillas al pecho activando fuerte el abdomen sin balancearte.", "tip": "Abdomen de roca en proceso... ¡Controla la bajada para que queme más! 🦦🪨"}
        ],
        "Legs": [
            {"name": "Sentadillas con salto explosivo", "sets": 3, "reps": "12-15", "rest_sec": 60, "muscle": "Piernas", "substitute": "Sentadillas isométricas", "avoid_if_injury": ["rodilla"], "technique": "Baja profundo y salta estirando todo tu cuerpo hacia el cielo.", "tip": "¡Siéntete ligero(a) como una pluma y amortigua con estilo! 🦦🪶"},
            {"name": "Subidas a banco de parque", "sets": 3, "reps": "12-15", "rest_sec": 60, "muscle": "Piernas", "substitute": "Zancadas caminando", "avoid_if_injury": ["rodilla"], "technique": "Pon un pie entero en el banco y sube tu cuerpo empujando solo con esa pierna.", "tip": "Concéntrate en el glúteo de la pierna que sube. ¡Hazlo lentito al bajar! 🦦🍑"},
            {"name": "Sprints rompe-límites", "sets": 5, "reps": "30m", "rest_sec": 90, "muscle": "Piernas potencia", "substitute": "Trote ligero", "avoid_if_injury": ["tobillo", "rodilla"], "technique": "Bracea fuerte, eleva rodillas y corre a tu 100% por unos segundos.", "tip": "¡Esto activará tu metabolismo por horas después de entrenar! Eres imparable. 🦦💨"}
        ]
    }
}

def calculate_calories_and_macros(goal, soma, act, sex, weight, height, age, diet_type):
    # Fórmula de Mifflin-St Jeor para la Tasa Metabólica Basal (TMB)
    if sex == "Masculino":
        tmb = (10 * weight) + (6.25 * height) - (5 * age) + 5
    else:
        tmb = (10 * weight) + (6.25 * height) - (5 * age) - 161
        
    act_mults = {"sedentary": 1.2, "light": 1.375, "moderate": 1.55, "very": 1.725}
    gasto = tmb * act_mults.get(act, 1.2)
    
    if goal == "deficit":
        calories = int(gasto - 400)
        # BMR Dinámico: Nunca bajar por debajo del 95% del metabolismo basal
        calories = max(calories, int(tmb * 0.95))
    elif goal == "surplus":
        calories = int(gasto + 300)
    else:
        calories = int(gasto)
        
    # Proteína: 1.8g - 2.2g por kg de peso corporal
    p_multiplier = 2.2 if goal == "deficit" else 1.8 if goal == "surplus" else 2.0
    p_g = int(weight * p_multiplier)
    
    # Grasas: Mínimo 0.8g/kg, óptimo 1.0g/kg
    f_multiplier = 1.0 if diet_type != "keto" else 2.5
    f_g = int(weight * f_multiplier)
    
    # Carbohidratos
    if diet_type == "keto":
        c_g = 30
        f_g = int((calories - (p_g * 4) - (c_g * 4)) / 9)
    else:
        c_g = int((calories - (p_g * 4) - (f_g * 9)) / 4)
        if c_g < 30: 
            c_g = 30
            f_g = int((calories - (p_g*4) - (c_g*4))/9)
            
    return calories, p_g, c_g, f_g

def build_shopping_list(budget_val, diet_type, calories):
    mult = calories / 2000.0
    items = []
    
    if diet_type == "keto":
        items = [
            {"item": "Huevos enteros grandes", "qty": f"{max(2, int(2.5 * mult))} docenas", "price": 18, "cat": "Proteínas"},
            {"item": "Carne y Pollo parte oscura", "qty": f"{max(1.0, round(2.0 * mult, 1))}kg", "price": 30, "cat": "Proteínas"},
            {"item": "Atún o Sardinas en aceite", "qty": f"{max(2, int(4 * mult))} latas", "price": 16, "cat": "Proteínas"},
            {"item": "Aceite de oliva extra virgen", "qty": "500ml", "price": 25, "cat": "Grasas"},
            {"item": "Paltas (aguacates) maduros", "qty": f"{max(3, int(6 * mult))} unidades", "price": 15, "cat": "Grasas"},
            {"item": "Mantequilla pura / Ghee", "qty": "200g", "price": 12, "cat": "Grasas"},
            {"item": "Queso maduro (Edam/Mozzarella)", "qty": f"{max(250, int(400 * mult))}g", "price": 15, "cat": "Lácteos"},
            {"item": "Almendras o Nueces enteras", "qty": "200g", "price": 18, "cat": "Grasas"},
            {"item": "Verduras verdes (Espinaca, Brócoli)", "qty": "Semanal", "price": 15, "cat": "Vegetales"}
        ]
    elif diet_type == "balanced":
        items = [
            {"item": "Pechuga de pollo fresca", "qty": f"{max(0.5, round(1.5 * mult, 1))}kg", "price": 21, "cat": "Proteínas"},
            {"item": "Huevos enteros de corral", "qty": f"{max(1, int(1 * mult))} docena(s)", "price": 9, "cat": "Proteínas"},
            {"item": "Atún claro en lomitos", "qty": f"{max(2, int(3 * mult))} latas", "price": 12, "cat": "Proteínas"},
            {"item": "Arroz integral empacado", "qty": f"{max(0.5, round(1.0 * mult, 1))}kg", "price": 6, "cat": "Carbohidratos"},
            {"item": "Quinua perlada", "qty": "500g", "price": 7, "cat": "Carbohidratos"},
            {"item": "Avena en hojuelas", "qty": "500g", "price": 5, "cat": "Carbohidratos"},
            {"item": "Yogurt griego natural (sin azúcar)", "qty": f"{max(0.5, round(0.5 * mult, 1))}kg", "price": 11, "cat": "Lácteos"},
            {"item": "Frutas y verduras coloridas", "qty": "Abundante (Semanal)", "price": 15, "cat": "Vegetales/Frutas"},
            {"item": "Grasas saludables (Aceite/Palta)", "qty": "Porción Semanal", "price": 14, "cat": "Grasas"},
        ]
    elif diet_type == "vegetarian":
        items = [
            {"item": "Huevos enteros frescos", "qty": f"{max(1, int(1.5 * mult))} docena(s)", "price": 9, "cat": "Proteínas"},
            {"item": "Tofu firme o Seitán artesanal", "qty": f"{max(0.5, round(1.0 * mult, 1))}kg", "price": 18, "cat": "Proteínas"},
            {"item": "Lentejas o Garbanzos", "qty": f"{max(0.5, round(1.0 * mult, 1))}kg", "price": 6, "cat": "Proteínas"},
            {"item": "Arroz integral de grano largo", "qty": f"{max(0.5, round(1.0 * mult, 1))}kg", "price": 6, "cat": "Carbohidratos"},
            {"item": "Quinua andina", "qty": "500g", "price": 7, "cat": "Carbohidratos"},
            {"item": "Yogurt griego cremoso", "qty": f"{max(0.5, round(0.5 * mult, 1))}kg", "price": 11, "cat": "Lácteos"},
            {"item": "Frutas y verduras súper variadas", "qty": "Semanal", "price": 15, "cat": "Vegetales/Frutas"},
            {"item": "Nueces, Almendras y semillas", "qty": "Mix Semanal", "price": 14, "cat": "Grasas"},
        ]
    elif diet_type == "vegan":
        items = [
            {"item": "Tofu firme de buena calidad", "qty": f"{max(0.5, round(1.5 * mult, 1))}kg", "price": 18, "cat": "Proteínas"},
            {"item": "Seitán rico en proteína", "qty": f"{max(0.5, round(1.0 * mult, 1))}kg", "price": 15, "cat": "Proteínas"},
            {"item": "Lentejas pardas o Garbanzos", "qty": f"{max(0.5, round(1.5 * mult, 1))}kg", "price": 6, "cat": "Proteínas"},
            {"item": "Arroz integral", "qty": f"{max(0.5, round(1.0 * mult, 1))}kg", "price": 6, "cat": "Carbohidratos"},
            {"item": "Bebida vegetal (Almendras/Soya)", "qty": f"{max(1, int(2 * mult))} litros", "price": 12, "cat": "Bebidas"},
            {"item": "Frutas, verduras frescas y verdes", "qty": "Muchísimo (Semanal)", "price": 15, "cat": "Vegetales/Frutas"},
            {"item": "Paltas, Nueces y rico Aceite de oliva", "qty": "Semanal", "price": 14, "cat": "Grasas"},
        ]
    
    total = sum(i["price"] for i in items)
    if total > budget_val:
        scale = budget_val / total
        for i in items:
            i["price"] = max(1, int(i["price"] * scale))
            
    return items

def generate_logical_days(calories, p_g, c_g, f_g, diet_type):
    days = []
    templates = get_meal_templates(p_g, c_g, f_g, diet_type)
    
    # Truco para que no siempre toque el orden lineal (añade variedad personal)
    # Como tenemos >7 platos, hacemos shuffle (o simulado, con offsets)
    des_options = templates["desayuno"]
    alm_options = templates["almuerzo"]
    sna_options = templates["snack"]
    cen_options = templates["cena"]
    
    for d in range(1, 6):
        des = des_options[(d * 2) % len(des_options)]
        alm = alm_options[(d * 3) % len(alm_options)]
        sna = sna_options[(d * 2) % len(sna_options)]
        cen = cen_options[(d * 3) % len(cen_options)]
        
        meals = [
            {
                "name": "Desayuno", "time": "08:00", "kcal": int(calories * 0.25),
                "items": des["items"], "plan_b": des["pb"],
                "macros": {"p": int(p_g * 0.25), "c": int(c_g * 0.25), "g": int(f_g * 0.25)}
            },
            {
                "name": "Almuerzo", "time": "13:30", "kcal": int(calories * 0.40),
                "items": alm["items"], "plan_b": alm["pb"],
                "macros": {"p": int(p_g * 0.40), "c": int(c_g * 0.40), "g": int(f_g * 0.40)}
            },
            {
                "name": "Snack de la Tarde", "time": "17:00", "kcal": int(calories * 0.15),
                "items": sna["items"], "plan_b": sna["pb"],
                "macros": {"p": int(p_g * 0.15), "c": int(c_g * 0.15), "g": int(f_g * 0.15)}
            },
            {
                "name": "Cena Ligera", "time": "20:30", "kcal": int(calories * 0.20),
                "items": cen["items"], "plan_b": cen["pb"],
                "macros": {"p": int(p_g * 0.20), "c": int(c_g * 0.20), "g": int(f_g * 0.20)}
            }
        ]
        
        days.append({
            "day": d, 
            "meals": meals,
            "nutri_tip": DAILY_TIPS[(d - 1) % len(DAILY_TIPS)] # Inyectando el Axioma 1 por día
        })
        
    return days

def generate_training_split(goal, ex_time, equip):
    if ex_time == "0min" or equip == "none":
        return {"split": "Descanso Activo", "sessions_per_week": 0, "days": []}
        
    db = EXERCISES_BY_EQUIP.get(equip, EXERCISES_BY_EQUIP["gym"])
    training_days = []
    
    if ex_time == "20min":
        spw = 3
        training_days.append({"day_of_week": 1, "name": "Circuito Full Body 1", "type": "strength", "exercises": db["FullBody"]})
        training_days.append({"day_of_week": 2, "name": "Circuito Full Body 2", "type": "strength", "exercises": db["FullBody"]})
        training_days.append({"day_of_week": 3, "name": "Circuito Full Body 3", "type": "strength", "exercises": db["FullBody"]})
        split_name = "Full Body (Express)"
        
    elif ex_time == "45min":
        spw = 4
        training_days.append({"day_of_week": 1, "name": "Torso (Upper Fuerza)", "type": "strength", "exercises": db["Upper"]})
        training_days.append({"day_of_week": 2, "name": "Pierna (Lower Fuerza)", "type": "strength", "exercises": db["Lower"]})
        training_days.append({"day_of_week": 3, "name": "Torso (Hipertrofia)", "type": "strength", "exercises": db["Upper"]})
        training_days.append({"day_of_week": 4, "name": "Pierna (Hipertrofia)", "type": "strength", "exercises": db["Lower"]})
        split_name = "Upper / Lower"
        
    else:
        spw = 4
        training_days.append({"day_of_week": 1, "name": "Empuje (Pecho/Hombro/Tríceps)", "type": "strength", "exercises": db["Push"]})
        training_days.append({"day_of_week": 2, "name": "Tirón (Espalda/Bíceps)", "type": "strength", "exercises": db["Pull"]})
        training_days.append({"day_of_week": 3, "name": "Pierna Completa Power", "type": "strength", "exercises": db["Legs"]})
        training_days.append({
            "day_of_week": 4, "name": "Cardio LISS Regenerativo", "type": "cardio",
            "exercises": [
                {"name": "Actividad Cardiovascular (Trote/Bici/Bailar)", "sets": 1, "reps": "45min", "rest_sec": 0, "muscle": "Cardio", "substitute": "Caminata al aire libre", "avoid_if_injury": ["rodilla"], "technique": "Mantén un ritmo donde puedas mantener una conversación sin ahogarte (Zona 2).", "tip": "¡A sudar rico! Esto es oro para tu corazón y para derretir la grasita terca. 🦦💦"}
            ]
        })
        split_name = "PPL + Cardio"
        
    return {"split": split_name, "sessions_per_week": spw, "days": training_days}

def build_fingerprint(goal, soma, diet_type, cook, budget_key, activity, sex, ex_time, equip):
    return f"{goal}_{soma}_{diet_type}_{cook}_{budget_key}_{activity}_{sex}_{ex_time}_{equip}"

def get_human_label(goal, diet):
    goal_map = {
        'deficit': 'quemar grasa cuidando tu masa muscular',
        'surplus': 'ganar masa muscular magra',
        'maintain': 'mantenerte fit y en tu peso ideal'
    }
    diet_map = {
        'balanced': 'riquísimo y balanceado',
        'vegan': 'poderoso 100% basado en plantas',
        'vegetarian': 'vegetariano, nutritivo y delicioso',
        'keto': 'Keto, alto en energía y bajo en carbohidratos'
    }
    
    g_str = goal_map.get(goal, "lograr tu objetivo")
    d_str = diet_map.get(diet, "súper sabroso")
    
    return f"¡Tu plan {d_str} para {g_str}! 🦦✨"

def main():
    import sys
    if sys.platform == "win32":
        try:
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
            sys.stderr.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass
            
    print("🦦 NutrIA — Generador local Humanizado y Empático (Axioma 1 Activo)")
    print("───────────────────────────────────────────────────────────────────────────────")
    
    import hashlib
    def get_hash_id(obj, prefix="id_"):
        s = json.dumps(obj, sort_keys=True)
        return prefix + hashlib.md5(s.encode('utf-8')).hexdigest()[:8]
        
    frontend_data = {"plans": []}
    
    global_recipes = {}
    global_workouts = {}
    global_shopping = {}
    
    GOALS       = ["deficit", "maintain", "surplus"]
    SOMATOTYPES = ["slim", "athletic", "robust"]
    DIETS       = ["balanced", "vegetarian", "vegan", "keto"]
    
    setups = [
        ("cook", "sedentary", "Femenino",  "0min",   "none",    "low",    90),
        ("cook", "sedentary", "Masculino", "0min",   "none",    "low",    90),
        ("cook", "light",     "Femenino",  "20min",  "home",    "medium", 140),
        ("cook", "light",     "Masculino", "20min",  "home",    "medium", 140),
        ("cook", "moderate",  "Femenino",  "45min",  "gym",     "medium", 150),
        ("cook", "moderate",  "Masculino", "45min",  "gym",     "medium", 150),
        ("cook", "moderate",  "Femenino",  "45min",  "outdoor", "medium", 150),
        ("cook", "moderate",  "Masculino", "45min",  "outdoor", "medium", 150),
        ("cook", "very",      "Femenino",  "60min+", "gym",     "high",   200),
        ("cook", "very",      "Masculino", "60min+", "gym",     "high",   200),
        ("mixed", "light",    "Femenino",  "20min",  "home",    "medium", 160),
        ("mixed", "light",    "Masculino", "20min",  "home",    "medium", 160),
        ("mixed", "moderate", "Femenino",  "45min",  "gym",     "high",   190),
        ("mixed", "moderate", "Masculino", "45min",  "gym",     "high",   190),
        ("mixed", "moderate", "Femenino",  "45min",  "outdoor", "high",   190),
        ("mixed", "moderate", "Masculino", "45min",  "outdoor", "high",   190),
        ("buy",   "sedentary", "Femenino", "0min",   "none",    "medium", 180),
        ("buy",   "sedentary", "Masculino","0min",   "none",    "medium", 180),
        ("buy",   "moderate",  "Femenino", "45min",  "gym",     "high",   280),
        ("buy",   "moderate",  "Masculino","45min",  "gym",     "high",   280),
        ("buy",   "very",      "Femenino", "60min+", "gym",     "high",   350),
        ("buy",   "very",      "Masculino","60min+", "gym",     "high",   350),
        ("buy",   "light",     "Femenino", "20min",  "outdoor", "high",   260),
        ("buy",   "light",     "Masculino","20min",  "outdoor", "high",   260),
    ]
    
    added_count = 0
    
    try:
        from main import generate_remaining_days
    except ImportError:
        def generate_remaining_days(plan):
            d6 = copy.deepcopy(plan["days"][0])
            d6["day"] = 6
            d6["nutri_tip"] = "¡Fin de semana! Recuerda que un gustito no daña el proceso, ¡disfruta sin culpa! 🦦✨"
            d7 = copy.deepcopy(plan["days"][1])
            d7["day"] = 7
            d7["nutri_tip"] = "Día de recuperar energías. Respira hondo y prepárate para otra súper semana. 🦦💖"
            plan["days"].extend([d6, d7])
            return plan

    for goal in GOALS:
        for soma in SOMATOTYPES:
            for diet in DIETS:
                for cook, act, sex, ex_time, equip, b_key, b_val in setups:
                    fp = build_fingerprint(goal, soma, diet, cook, b_key, act, sex, ex_time, equip)
                    
                    w = 58 if soma=="slim" else 72 if soma=="athletic" else 88
                    h = 168 if soma=="slim" else 175 if soma=="athletic" else 178
                    a = 24 if soma=="slim" else 26 if soma=="athletic" else 30
                    
                    cal, p_g, c_g, f_g = calculate_calories_and_macros(goal, soma, act, sex, w, h, a, diet)
                    
                    plan = {
                        "calories_daily": cal,
                        "macros": {"protein_g": p_g, "carbs_g": c_g, "fat_g": f_g},
                        "days": generate_logical_days(cal, p_g, c_g, f_g, diet),
                        "shopping": build_shopping_list(b_val, diet, cal),
                        "training": generate_training_split(goal, ex_time, equip)
                    }
                    
                    plan = generate_remaining_days(plan)
                    
                    entry = {
                        "fingerprint": fp,
                        "label": get_human_label(goal, diet),
                        "welcome_message": WELCOME_MESSAGES.get(goal, "¡Hola! Estoy súper emocionada de empezar contigo. 🦦"),
                        "plan": plan
                    }
                    
                    frontend_data["plans"].append(entry)
                    added_count += 1
                
    if added_count > 0:
        print("\n⏳ Normalizando base de datos para compresión extrema...")
        
        # Post-procesamiento: Normalización Relacional
        for entry in frontend_data["plans"]:
            plan = entry["plan"]
            
            # Normalizar comidas
            for day in plan.get("days", []):
                new_meals = []
                for meal in day.get("meals", []):
                    m_id = get_hash_id(meal, "rec_")
                    if m_id not in global_recipes:
                        global_recipes[m_id] = meal
                    new_meals.append(m_id)
                day["meals"] = new_meals
                
            # Normalizar entrenamiento
            train = plan.get("training")
            if train:
                t_id = get_hash_id(train, "wk_")
                if t_id not in global_workouts:
                    global_workouts[t_id] = train
                plan["training"] = t_id
                
            # Normalizar compras
            shop = plan.get("shopping")
            if shop:
                s_id = get_hash_id(shop, "sh_")
                if s_id not in global_shopping:
                    global_shopping[s_id] = shop
                plan["shopping"] = s_id
                
        normalized_data = {
            "recipes": global_recipes,
            "workouts": global_workouts,
            "shopping": global_shopping,
            "plans": frontend_data["plans"]
        }
        
        # Guardamos en frontend y backend
        with open(FRONTEND_BANK, "w", encoding="utf-8") as f:
            json.dump(normalized_data, f, ensure_ascii=False, separators=(',', ':'))
        with open(BACKEND_BANK, "w", encoding="utf-8") as f:
            json.dump(normalized_data, f, ensure_ascii=False, separators=(',', ':'))
            
    print(f"\n✅ Normalización relacional completa.")
    print(f"   Recetas únicas: {len(global_recipes)} | Workouts: {len(global_workouts)} | Listas de compra: {len(global_shopping)}")
    print(f"   Generados {added_count} planes ultra-personalizados.")

if __name__ == "__main__":
    main()
