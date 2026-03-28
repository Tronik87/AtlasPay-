export async function simulateTransaction(data) {
  return {
    path: ["BankA", "BankC", "BankD"],
    summary: {
      total_cost: 12,
      total_fee: 8,
      total_fx_loss: 3,
      total_time: 2
    }
  };
}