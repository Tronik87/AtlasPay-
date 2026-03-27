def compute_cost(amount, fee, fx_rate, time):
    fx_loss = amount * (1 - fx_rate)
    return fee + fx_loss + time