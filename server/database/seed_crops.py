from datetime import datetime, timezone

from mongodb import crops_collection


CROPS = [
    # Cereals
    {
        "name": "Maize",
        "scientific_name": "Zea mays",
        "category": "cereal",
        "default_duration_days": 120,
    },
    {
        "name": "Wheat",
        "scientific_name": "Triticum aestivum",
        "category": "cereal",
        "default_duration_days": 120,
    },
    {
        "name": "Rice",
        "scientific_name": "Oryza sativa",
        "category": "cereal",
        "default_duration_days": 120,
    },
    {
        "name": "Sorghum",
        "scientific_name": "Sorghum bicolor",
        "category": "cereal",
        "default_duration_days": 100,
    },
    {
        "name": "Finger Millet",
        "scientific_name": "Eleusine coracana",
        "category": "cereal",
        "default_duration_days": 90,
    },
    {
        "name": "Pearl Millet",
        "scientific_name": "Pennisetum glaucum",
        "category": "cereal",
        "default_duration_days": 80,
    },
    {
        "name": "Barley",
        "scientific_name": "Hordeum vulgare",
        "category": "cereal",
        "default_duration_days": 120,
    },

    # Legumes
    {
        "name": "Beans",
        "scientific_name": "Phaseolus vulgaris",
        "category": "legume",
        "default_duration_days": 90,
    },
    {
        "name": "Cowpeas",
        "scientific_name": "Vigna unguiculata",
        "category": "legume",
        "default_duration_days": 80,
    },
    {
        "name": "Green Grams",
        "scientific_name": "Vigna radiata",
        "category": "legume",
        "default_duration_days": 70,
    },
    {
        "name": "Pigeon Peas",
        "scientific_name": "Cajanus cajan",
        "category": "legume",
        "default_duration_days": 150,
    },
    {
        "name": "Groundnuts",
        "scientific_name": "Arachis hypogaea",
        "category": "legume",
        "default_duration_days": 110,
    },
    {
        "name": "Soybeans",
        "scientific_name": "Glycine max",
        "category": "legume",
        "default_duration_days": 100,
    },
    {
        "name": "Chickpeas",
        "scientific_name": "Cicer arietinum",
        "category": "legume",
        "default_duration_days": 100,
    },

    # Roots & Tubers
    {
        "name": "Irish Potatoes",
        "scientific_name": "Solanum tuberosum",
        "category": "tuber",
        "default_duration_days": 100,
    },
    {
        "name": "Sweet Potatoes",
        "scientific_name": "Ipomoea batatas",
        "category": "tuber",
        "default_duration_days": 120,
    },
    {
        "name": "Cassava",
        "scientific_name": "Manihot esculenta",
        "category": "tuber",
        "default_duration_days": 270,
    },
    {
        "name": "Yams",
        "scientific_name": "Dioscorea spp.",
        "category": "tuber",
        "default_duration_days": 240,
    },

    # Vegetables
    {
        "name": "Tomatoes",
        "scientific_name": "Solanum lycopersicum",
        "category": "vegetable",
        "default_duration_days": 90,
    },
    {
        "name": "Kale",
        "scientific_name": "Brassica oleracea",
        "category": "vegetable",
        "default_duration_days": 60,
    },
    {
        "name": "Cabbage",
        "scientific_name": "Brassica oleracea var. capitata",
        "category": "vegetable",
        "default_duration_days": 90,
    },
    {
        "name": "Onions",
        "scientific_name": "Allium cepa",
        "category": "vegetable",
        "default_duration_days": 110,
    },
    {
        "name": "Spinach",
        "scientific_name": "Spinacia oleracea",
        "category": "vegetable",
        "default_duration_days": 45,
    },
    {
        "name": "Carrots",
        "scientific_name": "Daucus carota",
        "category": "vegetable",
        "default_duration_days": 90,
    },
    {
        "name": "Okra",
        "scientific_name": "Abelmoschus esculentus",
        "category": "vegetable",
        "default_duration_days": 60,
    },
    {
        "name": "Eggplant",
        "scientific_name": "Solanum melongena",
        "category": "vegetable",
        "default_duration_days": 90,
    },
    {
        "name": "Peppers",
        "scientific_name": "Capsicum annuum",
        "category": "vegetable",
        "default_duration_days": 80,
    },

    # Fruits
    {
        "name": "Bananas",
        "scientific_name": "Musa spp.",
        "category": "fruit",
        "default_duration_days": 330,
    },
    {
        "name": "Avocado",
        "scientific_name": "Persea americana",
        "category": "fruit",
        "default_duration_days": 365,
    },
    {
        "name": "Mango",
        "scientific_name": "Mangifera indica",
        "category": "fruit",
        "default_duration_days": 365,
    },
    {
        "name": "Pineapple",
        "scientific_name": "Ananas comosus",
        "category": "fruit",
        "default_duration_days": 365,
    },
    {
        "name": "Pawpaw",
        "scientific_name": "Carica papaya",
        "category": "fruit",
        "default_duration_days": 270,
    },
    {
        "name": "Citrus",
        "scientific_name": "Citrus spp.",
        "category": "fruit",
        "default_duration_days": 365,
    },

    # Cash / Industrial Crops
    {
        "name": "Tea",
        "scientific_name": "Camellia sinensis",
        "category": "cash_crop",
        "default_duration_days": 365,
    },
    {
        "name": "Coffee",
        "scientific_name": "Coffea arabica",
        "category": "cash_crop",
        "default_duration_days": 365,
    },
    {
        "name": "Sugarcane",
        "scientific_name": "Saccharum officinarum",
        "category": "cash_crop",
        "default_duration_days": 365,
    },
    {
        "name": "Cotton",
        "scientific_name": "Gossypium hirsutum",
        "category": "cash_crop",
        "default_duration_days": 160,
    },
    {
        "name": "Sunflower",
        "scientific_name": "Helianthus annuus",
        "category": "oilseed",
        "default_duration_days": 100,
    },
    {
        "name": "Sesame",
        "scientific_name": "Sesamum indicum",
        "category": "oilseed",
        "default_duration_days": 90,
    },
    {
        "name": "Pyrethrum",
        "scientific_name": "Tanacetum cinerariifolium",
        "category": "cash_crop",
        "default_duration_days": 270,
    },
    {
        "name": "Sisal",
        "scientific_name": "Agave sisalana",
        "category": "cash_crop",
        "default_duration_days": 365,
    },
    {
        "name": "Cashew",
        "scientific_name": "Anacardium occidentale",
        "category": "cash_crop",
        "default_duration_days": 365,
    },
]


def seed_crops():

    for crop in CROPS:

        document = {
            **crop,
            "created_at": datetime.now(timezone.utc),
        }

        crops_collection.update_one(
            {
                "name": crop["name"],
            },
            {
                "$setOnInsert": document,
            },
            upsert=True,
        )

    print(
        f"Crop catalogue initialized: "
        f"{len(CROPS)} crops."
    )


if __name__ == "__main__":
    seed_crops()