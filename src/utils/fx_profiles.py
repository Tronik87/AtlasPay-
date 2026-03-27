import random

def generate_bank_spreads(banks):
    spreads = {}

    for bank in banks:
        r = random.random()

        if r < 0.2:
            spreads[bank.name] = 0.999
        elif r < 0.7:
            spreads[bank.name] = 0.996
        else:
            spreads[bank.name] = 0.992

    return spreads