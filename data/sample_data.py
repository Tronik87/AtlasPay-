from src.models.bank import Bank
from src.models.channel import Channel


def create_sample_data():
    # -------------------------------
    # Create Banks
    # -------------------------------
    bankA = Bank("BankA", "USA")
    bankB = Bank("BankB", "UK")
    bankC = Bank("BankC", "India")

    # -------------------------------
    # Nostro balances (basic simulation)
    # -------------------------------
    bankA.add_nostro("USD", "BankB", 100000)
    bankB.add_nostro("USD", "BankC", 100000)
    bankA.add_nostro("USD", "BankC", 50000)

    # -------------------------------
    # Channels (transfer routes)
    # Format: Channel(from, to, currency, fee, fx_rate, time)
    # -------------------------------
    channels = [
        Channel("BankA", "BankB", "USD", "SWIFT", 1),
        Channel("BankB", "BankC", "USD", "SWIFT", 1),
        Channel("BankA", "BankC", "USD", "SWIFT", 2),
]

    return [bankA, bankB, bankC], channels