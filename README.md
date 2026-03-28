
# 🌍 AtlasPay - High-Performance Payment Routing & Fraud Detection

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/release/python-390/)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.2.1-black)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2.4-61dafb)](https://reactjs.org/)

**AtlasPay** is a sophisticated fintech simulation engine designed for large-scale financial networks. It provides a robust platform for optimizing cross-border payment routing and detecting fraudulent transactions using state-of-the-art AI.

---

## 🚀 Key Features

### 🏦 Dynamic Multi-Hop Routing 
- **Graph-Based Optimization**: Utilizes `NetworkX` to find the most efficient multi-hop paths across hundreds of banks and currency pairs.
- **Cost & Time Modes**: Choose between "Cheapest," "Fastest," or "Balanced" routing strategies.
- **FX Spread Engine**: Real-time management of foreign exchange spreads and transaction fees.

### 🛡️ AI-Powered Anomaly Detection
- **Autoencoder Integration**: Uses deep learning (`PyTorch`/`TensorFlow`) to identify suspicious transaction patterns.
- **Pre-Validation Rules**: Strict financial constraint checking before path execution to ensure network integrity.
- **Synthetic Fraud Injection**: Test your network's resilience with simulated invalid routes.

### 💻 Modern Interactive Dashboard
- **Glassmorphism Design**: A premium, dark-mode UI built with Tailwind CSS 4.
- **Fluid Animations**: Leveraging GSAP for smooth micro-animations and status tracking.
- **Real-Time Visualization**: Monitor routing simulations and anomaly scores as they happen.

---

## 🛠️ Technology Stack

| Layer      | Technologies                                                                 |
|------------|------------------------------------------------------------------------------|
| **Frontend** | Next.js 16, React 19, Tailwind CSS 4, GSAP, TypeScript                       |
| **Backend**  | FastAPI, Python 3.x, Uvicorn                                                 |
| **ML/Engine**| NetworkX, PyTorch, TensorFlow, Scikit-learn, Pandas                          |
| **Data**     | Synthetic Network Generator, RPW Datasets                                    |

---

## 📦 Project Structure

```bash
AtlasPay/
├── data/               # Network generation & synthetic datasets
├── frontend_latest/    # Next.js frontend application
├── src/                # Backend Core
│   ├── api/            # FastAPI server & endpoints
│   ├── engine/         # Pathfinding & graph logic (Router)
│   ├── utils/          # Cost, FX, and spreadsheet utilities
│   └── main.py         # CLI simulation entry point
├── autoencoder.pth     # Pre-trained ML model for anomaly detection
├── requirements.txt    # Python dependencies
└── README.md           # Project documentation
```

---

## 🏁 Getting Started

### 1. Prerequisites
- Python 3.9+
- Node.js 18+ & npm

### 2. Backend Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Run the API server
uvicorn src.api.server:app --reload
```

### 3. Frontend Setup
```bash
cd frontend_latest

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

*Developed by the **devshouse** team .*

