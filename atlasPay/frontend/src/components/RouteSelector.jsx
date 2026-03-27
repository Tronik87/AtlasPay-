import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

const COUNTRIES = ['India', 'USA', 'Brazil', 'Japan', 'UK', 'Singapore', 'UAE'];

function RouteSelector({ onRouteSelect, selectedRoute }) {
  const [senderCountry, setSenderCountry] = useState('USA');
  const [receiverCountry, setReceiverCountry] = useState('India');
  const [amount, setAmount] = useState(1000);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRoutes();
  }, [senderCountry, receiverCountry, amount]);

  const fetchRoutes = async () => {
    if (!amount || amount <= 0) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/route-options`, {
        params: {
          sender_country: senderCountry,
          receiver_country: receiverCountry,
          amount: amount
        }
      });
      setRoutes(response.data.routes);
    } catch (error) {
      console.error('Error fetching routes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-2xl border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-6">
        🌍 Route Comparison
      </h2>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-gray-300 mb-2 text-sm font-semibold">
            Sender Country
          </label>
          <select
            value={senderCountry}
            onChange={(e) => setSenderCountry(e.target.value)}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:outline-none focus:border-blue-500"
          >
            {COUNTRIES.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-300 mb-2 text-sm font-semibold">
            Receiver Country
          </label>
          <select
            value={receiverCountry}
            onChange={(e) => setReceiverCountry(e.target.value)}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:outline-none focus:border-blue-500"
          >
            {COUNTRIES.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-300 mb-2 text-sm font-semibold">
            Amount (USD)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:outline-none focus:border-blue-500"
            placeholder="Enter amount"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400">Loading routes...</div>
      ) : (
        <div className="space-y-3">
          {routes.map((route, index) => (
            <div
              key={index}
              onClick={() => onRouteSelect(route)}
              className={`p-4 rounded-lg cursor-pointer transition-all border-2 ${
                route.recommended
                  ? 'bg-green-900 border-green-500'
                  : 'bg-gray-700 border-gray-600 hover:border-blue-500'
              } ${
                selectedRoute?.rail === route.rail
                  ? 'ring-2 ring-blue-400'
                  : ''
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-white font-bold text-lg">
                    {route.rail}
                  </h3>
                  {route.recommended && (
                    <span className="text-green-400 text-xs font-semibold">
                      ⭐ RECOMMENDED
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-white font-bold">
                    ${route.fee_usd.toFixed(2)}
                  </div>
                  <div className="text-gray-400 text-sm">fee</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-400">Time:</span>
                  <span className="text-white ml-2">{route.estimated_time}</span>
                </div>
                <div>
                  <span className="text-gray-400">FX Spread:</span>
                  <span className="text-white ml-2">{route.fx_spread_percent}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RouteSelector;
