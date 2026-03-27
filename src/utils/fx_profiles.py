import random

def generate_bank_spreads(banks):
    spreads = {}

    for bank in banks:
        r = random.random()

        if r < 0.2:
            spreads[bank.name] = 0.999  # top tier
        elif r < 0.7:
            spreads[bank.name] = 0.996  # mid tier
        else:
            spreads[bank.name] = 0.992  # low tier

    return spreads