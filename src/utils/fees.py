def calculate_fee(amount, base_fee=2, percentage=0.005):
    return base_fee + (amount * percentage)