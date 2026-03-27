import React, { useState, useEffect } from 'react';

function PreValidation({ onComplete }) {
  const [steps, setSteps] = useState([
    { id: 1, label: 'IBAN / Wallet format valid', status: 'pending' },
    { id: 2, label: 'Sanctions screening: CLEAR', status: 'pending' },
    { id: 3, label: 'Currency compatibility: PASS', status: 'pending' },
    { id: 4, label: 'Rail availability: CONFIRMED', status: 'pending' },
  ]);

  useEffect(() => {
    runValidation();
  }, []);

  const runValidation = async () => {
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setSteps(prev => prev.map((step, idx) => 
        idx === i ? { ...step, status: 'complete' } : step
      ));
    }
    
    // Wait a bit then call onComplete
    setTimeout(() => {
      onComplete();
    }, 500);
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-2xl border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-6">
        ✓ Pre-Flight Validation
      </h2>
      
      <div className="space-y-4">
        {steps.map((step) => (
          <div key={step.id} className="flex items-center space-x-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              step.status === 'complete' 
                ? 'bg-green-500' 
                : 'bg-gray-600 animate-pulse'
            }`}>
              {step.status === 'complete' && (
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <span className={`text-lg font-mono ${
              step.status === 'complete' ? 'text-green-400' : 'text-gray-400'
            }`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {steps.every(s => s.status === 'complete') && (
        <div className="mt-6 p-4 bg-green-900 rounded-lg border border-green-500">
          <p className="text-green-200 font-semibold text-center">
            ✓ All checks passed. Ready to send!
          </p>
        </div>
      )}
    </div>
  );
}

export default PreValidation;
