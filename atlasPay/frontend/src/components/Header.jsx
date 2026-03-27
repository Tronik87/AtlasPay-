import React, { useState, useEffect } from 'react';
import { BrowserProvider } from 'ethers';

const AMOY_CHAIN_ID = '0x13882'; // 80002 in hex

function Header({ walletAddress, setWalletAddress }) {
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask to use this app');
      return;
    }

    try {
      setIsConnecting(true);
      const provider = new BrowserProvider(window.ethereum);
      
      // Request account access
      const accounts = await provider.send("eth_requestAccounts", []);
      
      // Check network
      const network = await provider.getNetwork();
      
      if (network.chainId !== 80002n) {
        // Try to switch to Amoy
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: AMOY_CHAIN_ID }],
          });
        } catch (switchError) {
          // Chain not added, try to add it
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: AMOY_CHAIN_ID,
                chainName: 'Polygon Amoy Testnet',
                nativeCurrency: {
                  name: 'MATIC',
                  symbol: 'MATIC',
                  decimals: 18
                },
                rpcUrls: ['https://rpc-amoy.polygon.technology'],
                blockExplorerUrls: ['https://amoy.polygonscan.com/']
              }]
            });
          } else {
            throw switchError;
          }
        }
      }
      
      setWalletAddress(accounts[0]);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet: ' + error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const truncateAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          setWalletAddress(null);
        } else {
          setWalletAddress(accounts[0]);
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, [setWalletAddress]);

  return (
    <header className="bg-gray-900 border-b border-blue-800 shadow-lg">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="text-3xl font-bold">
            <span className="text-white">Atlas</span>
            <span className="text-green-400">Pay</span>
          </div>
          <span className="px-3 py-1 bg-purple-900 text-purple-200 text-sm rounded-full font-mono">
            Polygon Amoy Testnet
          </span>
        </div>
        
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${
            walletAddress
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isConnecting ? (
            'Connecting...'
          ) : walletAddress ? (
            <span className="font-mono">{truncateAddress(walletAddress)}</span>
          ) : (
            'Connect Wallet'
          )}
        </button>
      </div>
    </header>
  );
}

export default Header;
