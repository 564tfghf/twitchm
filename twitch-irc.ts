import { WebSocket } from 'ws';

interface TwitchMessage {
  username: string;
  message: string;
  timestamp: Date;
  channel: string;
}

class TwitchIRCClient {
  private ws: WebSocket | null = null;
  private currentChannel: string = '';
  private messageHandlers: ((message: TwitchMessage) => void)[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor() {
    this.connect();
  }

  private connect() {
    try {
      this.ws = new WebSocket('wss://irc-ws.chat.twitch.tv:443');
      
      this.ws.on('open', () => {
        console.log('Connected to Twitch IRC');
        this.reconnectAttempts = 0;
        
        // Send authentication (anonymous)
        this.send('CAP REQ :twitch.tv/tags twitch.tv/commands');
        this.send('PASS SCHMOOPIIE');
        this.send('NICK justinfan12345');
        
        if (this.currentChannel) {
          this.joinChannel(this.currentChannel);
        }
      });

      this.ws.on('message', (data) => {
        const message = data.toString();
        this.handleMessage(message);
      });

      this.ws.on('close', () => {
        console.log('Twitch IRC connection closed');
        this.reconnect();
      });

      this.ws.on('error', (error) => {
        console.error('Twitch IRC error:', error);
        this.reconnect();
      });
    } catch (error) {
      console.error('Failed to connect to Twitch IRC:', error);
      this.reconnect();
    }
  }

  private reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    setTimeout(() => {
      console.log(`Reconnecting to Twitch IRC (attempt ${this.reconnectAttempts})`);
      this.connect();
    }, delay);
  }

  private send(message: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(message + '\r\n');
    }
  }

  private handleMessage(data: string) {
    const lines = data.split('\r\n');
    
    for (const line of lines) {
      if (line.trim() === '') continue;

      // Handle PING
      if (line.startsWith('PING')) {
        this.send('PONG :tmi.twitch.tv');
        continue;
      }

      // Parse PRIVMSG (chat messages)
      const privmsgMatch = line.match(/:(\w+)!\w+@\w+\.tmi\.twitch\.tv PRIVMSG #(\w+) :(.+)/);
      if (privmsgMatch) {
        const [, username, channel, message] = privmsgMatch;
        
        const twitchMessage: TwitchMessage = {
          username,
          message,
          timestamp: new Date(),
          channel
        };

        this.messageHandlers.forEach(handler => handler(twitchMessage));
      }
    }
  }

  public joinChannel(channel: string) {
    this.currentChannel = channel.toLowerCase();
    this.send(`JOIN #${this.currentChannel}`);
    console.log(`Joined Twitch channel: ${this.currentChannel}`);
  }

  public onMessage(handler: (message: TwitchMessage) => void) {
    this.messageHandlers.push(handler);
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Simulated chat messages for channels without active chat
const SIMULATED_MESSAGES = [
  "Epic gameplay! 🔥",
  "This stream is amazing",
  "Love the blockchain integration",
  "PogChamp",
  "Great moves!",
  "This is so cool",
  "Amazing play!",
  "Keep it up!",
  "Incredible stream",
  "Best streamer ever",
  "Wow that was insane",
  "GG EZ",
  "Stream goals right here",
  "This is why I love Twitch",
  "Legendary gameplay"
];

const SIMULATED_USERNAMES = [
  "BlockchainGamer", "CryptoViewer", "StreamFan123", "TwitchLover", 
  "GameMaster", "DigitalNomad", "NFTCollector", "StreamWatcher",
  "TechEnthusiast", "GameVibes", "StreamLife", "CryptoFan"
];

class SimulatedChat {
  private intervalId: NodeJS.Timeout | null = null;
  private messageHandlers: ((message: TwitchMessage) => void)[] = [];

  public startSimulation(channel: string) {
    this.stopSimulation();
    
    this.intervalId = setInterval(() => {
      const randomMessage = SIMULATED_MESSAGES[Math.floor(Math.random() * SIMULATED_MESSAGES.length)];
      const randomUsername = SIMULATED_USERNAMES[Math.floor(Math.random() * SIMULATED_USERNAMES.length)];
      
      const message: TwitchMessage = {
        username: randomUsername,
        message: randomMessage,
        timestamp: new Date(),
        channel
      };

      this.messageHandlers.forEach(handler => handler(message));
    }, Math.random() * 5000 + 2000); // Random interval between 2-7 seconds
  }

  public stopSimulation() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public onMessage(handler: (message: TwitchMessage) => void) {
    this.messageHandlers.push(handler);
  }
}

export { TwitchIRCClient, SimulatedChat, type TwitchMessage };