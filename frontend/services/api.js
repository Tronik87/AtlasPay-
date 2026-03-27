// services/api.js

export const simulateTransaction = async (data) => {
  const res = await fetch("http://localhost:8000/simulate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return res.json();
};