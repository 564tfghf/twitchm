import React from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Wallet, LogIn, LogOut } from 'lucide-react';

const WalletStatus: React.FC = () => {
  const { ready, authenticated, user, login, logout } = usePrivy();

  if (!ready) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 rounded-lg">
        <div className="w-4 h-4 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin"></div>
        <span className="text-slate-300">Loading wallet...</span>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <button
        onClick={login}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        <LogIn className="w-4 h-4" />
        Connect Wallet
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Wallet Info */}
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 rounded-lg">
        <Wallet className="w-4 h-4 text-violet-400" />
        <div className="flex flex-col">
          <span className="text-white text-sm font-medium">
            {user?.email?.address || 'Connected'}
          </span>
          <span className="text-slate-400 text-xs font-mono">
            {user?.wallet?.address ? 
              `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}` : 
              'No address'
            }
          </span>
        </div>
      </div>

      {/* Network Status */}
      <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
        <span className="text-emerald-400 text-sm font-medium">Monad Testnet</span>
      </div>

      {/* Logout Button */}
      <button
        onClick={logout}
        className="flex items-center gap-2 px-3 py-2 bg-slate-600/50 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-all duration-200"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
};

export default WalletStatus;