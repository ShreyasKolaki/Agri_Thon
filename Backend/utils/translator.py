translations = {
    "Add Crop": "फसल जोड़ें",
    "Sell Now": "अभी बेचें",
    "Wait": "इंतजार करें"
}

def translate(text, lang="en"):
    if lang == "hi":
        return translations.get(text, text)
    return text