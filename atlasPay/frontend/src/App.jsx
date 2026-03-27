import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import RouteSelector from './components/RouteSelector';
import PaymentForm from './components/PaymentForm';
import SettlementPanel from './components/SettlementPanel';
import TransactionDetail from './components/TransactionDetail';
import PreValidation from './components/PreValidation';

function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [transactionData, setTransactionData] = useState(null);
  const [txId, setTxId] = useState(null);
  const [showValidation, setShowValidation] = useState(false);
  const [validationComplete, setValidationComplete] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <Header 
        walletAddress={walletAddress}
        setWalletAddress={setWalletAddress}
      />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Cross-Border Payments, <span className="text-green-400">Reimagined</span>
          </h1>
          <p className="text-gray-300 text-lg">
            Real-time settlement powered by Polygon blockchain
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <RouteSelector 
            onRouteSelect={setSelectedRoute}
            selectedRoute={selectedRoute}
          />
          
          {showValidation && (
            <PreValidation
              onComplete={() => setValidationComplete(true)}
            />
          )}
        </div>

        {selectedRoute && (
          <PaymentForm
            walletAddress={walletAddress}
            selectedRoute={selectedRoute}
            onTransactionSubmit={(data) => {
              setTransactionData(data);
              setTxId(data.tx_id);
            }}
            showValidation={showValidation}
            setShowValidation={setShowValidation}
            validationComplete={validationComplete}
            setValidationComplete={setValidationComplete}
          />
        )}

        {txId && transactionData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <TransactionDetail txId={txId} />
            <SettlementPanel 
              txId={txId}
              transactionData={transactionData}
            />
          </div>
        )}
      </div>

      <footer className="text-center py-8 text-gray-500">
        <p>AtlasPay © 2026 • Polygon Amoy Testnet • Demo Only</p>
      </footer>
    </div>
  );
}

export default App;
