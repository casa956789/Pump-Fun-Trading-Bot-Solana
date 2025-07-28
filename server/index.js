import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import 'dotenv/config';
import { TradingBot } from './bot.js';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

const bot = new TradingBot();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Send initial data
  socket.emit('botStatus', bot.getStatus());
  socket.emit('accountUpdate', bot.getAccountData());

  // Bot control events
  socket.on('startBot', async () => {
    try {
      await bot.start();
      io.emit('botStatus', bot.getStatus());
      io.emit('log', {
        timestamp: Date.now(),
        message: 'Bot started successfully',
        type: 'success'
      });
    } catch (error) {
      io.emit('log', {
        timestamp: Date.now(),
        message: `Failed to start bot: ${error.message}`,
        type: 'error'
      });
    }
  });

  socket.on('stopBot', async () => {
    try {
      await bot.stop();
      io.emit('botStatus', bot.getStatus());
      io.emit('log', {
        timestamp: Date.now(),
        message: 'Bot stopped',
        type: 'info'
      });
    } catch (error) {
      io.emit('log', {
        timestamp: Date.now(),
        message: `Failed to stop bot: ${error.message}`,
        type: 'error'
      });
    }
  });

  socket.on('sellAll', async () => {
    try {
      await bot.sellAllTokens();
      io.emit('log', {
        timestamp: Date.now(),
        message: 'Selling all tokens...',
        type: 'warning'
      });
    } catch (error) {
      io.emit('log', {
        timestamp: Date.now(),
        message: `Failed to sell all tokens: ${error.message}`,
        type: 'error'
      });
    }
  });

  socket.on('resetTimer', () => {
    bot.resetTimer();
    io.emit('log', {
      timestamp: Date.now(),
      message: 'Timer reset',
      type: 'info'
    });
  });

  socket.on('sellPercentage', async (percentage) => {
    try {
      await bot.sellPercentage(percentage);
      io.emit('log', {
        timestamp: Date.now(),
        message: `Selling ${percentage}% of current position`,
        type: 'warning'
      });
    } catch (error) {
      io.emit('log', {
        timestamp: Date.now(),
        message: `Failed to sell ${percentage}%: ${error.message}`,
        type: 'error'
      });
    }
  });

  socket.on('updateSettings', (settings) => {
    bot.updateSettings(settings);
    io.emit('log', {
      timestamp: Date.now(),
      message: 'Settings updated',
      type: 'success'
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Set up bot event listeners
bot.on('log', (entry) => {
  io.emit('log', entry);
});

bot.on('accountUpdate', (data) => {
  io.emit('accountUpdate', data);
});

bot.on('tradeUpdate', (data) => {
  io.emit('tradeUpdate', data);
});

bot.on('statusChange', (status) => {
  io.emit('botStatus', status);
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});