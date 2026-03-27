class Channel:
    def __init__(self, from_bank, to_bank, currency, rail, time):
        self.from_bank = from_bank
        self.to_bank = to_bank
        self.currency = currency
        self.rail = rail  # SWIFT / SEPA / RTGS
        self.time = time