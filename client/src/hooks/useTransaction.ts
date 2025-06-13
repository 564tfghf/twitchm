import { useState, useCallback } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { createWalletClient, custom, parseEther } from 'viem';
import { monadTestnet } from '../config/chains';
import { CONTRACT_ADDRESS, EXPLORER_URL } from '../config/constants';
import { CONTRACT_ABI } from '../config/contractABI';

interface TransactionResult {
  hash: string;
  explorerUrl: string;
}

export const useTransaction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { ready, authenticated, sendTransaction } = usePrivy();
  const { wallets } = useWallets();

  const sendComment = useCallback(async (username: string, message: string): Promise<TransactionResult | null> => {
    if (!ready || !authenticated || !wallets.length) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    try {
      const wallet = wallets[0];
      const walletClient = createWalletClient({
        chain: monadTestnet,
        transport: custom(wallet.provider)
      });

      // Encode function call
      const data = walletClient.encodeFunctionData({
        abi: CONTRACT_ABI,
        functionName: 'comment',
        args: [username, message]
      });

      const txRequest = {
        to: CONTRACT_ADDRESS as `0x${string}`,
        data,
        chainId: monadTestnet.id,
      };

      const result = await sendTransaction(txRequest);
      
      return {
        hash: result.transactionHash,
        explorerUrl: `${EXPLORER_URL}/tx/${result.transactionHash}`
      };
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [ready, authenticated, wallets, sendTransaction]);

  const sendReaction = useCallback(async (emojiType: string): Promise<TransactionResult | null> => {
    if (!ready || !authenticated || !wallets.length) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    try {
      const wallet = wallets[0];
      const walletClient = createWalletClient({
        chain: monadTestnet,
        transport: custom(wallet.provider)
      });

      const data = walletClient.encodeFunctionData({
        abi: CONTRACT_ABI,
        functionName: 'react',
        args: [emojiType]
      });

      const txRequest = {
        to: CONTRACT_ADDRESS as `0x${string}`,
        data,
        chainId: monadTestnet.id,
      };

      const result = await sendTransaction(txRequest);
      
      return {
        hash: result.transactionHash,
        explorerUrl: `${EXPLORER_URL}/tx/${result.transactionHash}`
      };
    } catch (error) {
      console.error('Reaction transaction failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [ready, authenticated, wallets, sendTransaction]);

  const mintMoment = useCallback(async (imageData: string): Promise<TransactionResult | null> => {
    if (!ready || !authenticated || !wallets.length) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    try {
      const wallet = wallets[0];
      const walletClient = createWalletClient({
        chain: monadTestnet,
        transport: custom(wallet.provider)
      });

      const timestamp = Math.floor(Date.now() / 1000);
      const data = walletClient.encodeFunctionData({
        abi: CONTRACT_ABI,
        functionName: 'mintMoment',
        args: [imageData, BigInt(timestamp)]
      });

      const txRequest = {
        to: CONTRACT_ADDRESS as `0x${string}`,
        data,
        chainId: monadTestnet.id,
      };

      const result = await sendTransaction(txRequest);
      
      return {
        hash: result.transactionHash,
        explorerUrl: `${EXPLORER_URL}/tx/${result.transactionHash}`
      };
    } catch (error) {
      console.error('NFT minting failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [ready, authenticated, wallets, sendTransaction]);

  return {
    sendComment,
    sendReaction,
    mintMoment,
    isLoading,
    authenticated,
    ready
  };
};