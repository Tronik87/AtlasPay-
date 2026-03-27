class Bank:
    def __init__(self, name, country):
        self.name = name
        self.country = country
        self.region = None
        self.nostro_accounts = {}

    def add_nostro(self, currency, bank_name, balance):
        self.nostro_accounts[(currency, bank_name)] = balance