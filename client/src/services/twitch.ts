import { Client } from 'tmi.js';

export interface TwitchMessage {
  id: string;
  username: string;
  message: string;
  timestamp: number;
}

let twitchClient: Client | null = null;
let currentChannel = '';
let messageHandler: ((message: TwitchMessage) => void) | null = null;

export const initTwitchClient = async (channel: string): Promise<boolean> => {
  try {
    // Disconnect existing client
    if (twitchClient) {
      await twitchClient.disconnect();
    }

    console.log(`Connecting to Twitch channel: ${channel}`);
    
    const normalizedChannel = channel.toLowerCase().trim();

    twitchClient = new Client({
      options: { 
        debug: false,
        skipMembership: true
      },
      connection: {
        reconnect: true,
        secure: true,
        timeout: 30000,
        maxReconnectAttempts: 5,
        maxReconnectInverval: 10000
      },
      channels: [normalizedChannel]
    });

    twitchClient.on('message', (channel, tags, message, self) => {
      if (self || !messageHandler) return;
      
      const twitchMessage: TwitchMessage = {
        username: tags.username || 'anonymous',
        message,
        id: tags.id || Date.now().toString(),
        timestamp: Date.now()
      };
      
      messageHandler(twitchMessage);
    });

    twitchClient.on('connected', () => {
      console.log('Connected to Twitch chat');
      currentChannel = normalizedChannel;
    });

    twitchClient.on('disconnected', (reason) => {
      console.log('Disconnected from Twitch chat:', reason);
    });

    await twitchClient.connect();
    return true;
  } catch (error) {
    console.error('Error initializing Twitch client:', error);
    return false;
  }
};

export const changeChannel = async (newChannel: string): Promise<boolean> => {
  if (!newChannel || typeof newChannel !== 'string' || newChannel.trim() === '') {
    return false;
  }

  const normalizedNewChannel = newChannel.toLowerCase().trim();
  if (normalizedNewChannel === currentChannel) return true;
  
  try {
    if (twitchClient) {
      await twitchClient.part(currentChannel);
      await twitchClient.join(normalizedNewChannel);
      currentChannel = normalizedNewChannel;
      return true;
    } else {
      return initTwitchClient(normalizedNewChannel);
    }
  } catch (error) {
    console.error('Error changing channel:', error);
    return false;
  }
};

export const setMessageHandler = (handler: (message: TwitchMessage) => void): void => {
  messageHandler = handler;
};

export const getCurrentChannel = (): string => {
  return currentChannel;
};