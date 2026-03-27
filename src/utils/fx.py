import requests

fx_cache = {}

def get_fx_rate(from_currency, to_currency):
    if from_currency == to_currency:
        return 1.0

    key = (from_currency, to_currency)

    if key in fx_cache:
        return fx_cache[key]

    try:
        url = f"https://api.exchangerate.host/convert?from={from_currency}&to={to_currency}"
        data = requests.get(url, timeout=2).json()
        rate = data["result"]
    except:
        rate = 1.0

    fx_cache[key] = rate
    return rate