def is_sanctioned(bank_u, bank_v, currency_u, currency_v):
    """
    Dynamic sanction logic
    """

    # -------------------------------
    # Country-based sanctions
    # -------------------------------
    sanctioned_country_pairs = {
        ("USA", "Iran"),
        ("USA", "North Korea"),
        ("EU", "Russia"),
    }

    if (bank_u.country, bank_v.country) in sanctioned_country_pairs:
        return True

    # -------------------------------
    # Risk-based sanctions
    # -------------------------------
    if getattr(bank_u, "risk_profile", "normal") == "high" and bank_v.country == "USA":
        return True

    # -------------------------------
    # Currency restrictions
    # -------------------------------
    restricted_currency_pairs = {
        ("USD", "IRR"),
        ("EUR", "RUB"),
    }

    if (currency_u, currency_v) in restricted_currency_pairs:
        return True

    return False