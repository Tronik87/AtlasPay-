from src.config.constants import region_map, COUNTRY_TO_CURRENCY


class Bank:
    def __init__(self, name, country):
        self.name = name
        self.country = country

        # Region mapping
        self.region = region_map.get(country, "OTHER")

        # Primary currency (from country)
        self.primary_currency = COUNTRY_TO_CURRENCY.get(country, "USD")

        # Keep backward compatibility (optional)
        self.currency = self.primary_currency

        # Supported currencies (CRITICAL for FX routing)
        self.supported_currencies = list(set([
            self.primary_currency,
            "USD",
            "EUR"
        ]))