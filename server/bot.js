import { EventEmitter } from 'events';
import axios from 'axios';
import { Keypair, Connection, clusterApiUrl, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { AccountLayout } from '@solana/spl-token';
import pkg from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import fs from 'fs';
import bs58 from 'bs58';

const { Builder } = pkg;

export class TradingBot extends EventEmitter {
  constructor() {
    super();
    this.status = 'stopped';
    this.currentTrade = null;
    this.settings = {
      minimumBuyAmount: parseFloat(process.env.MINIMUM_BUY_AMOUNT || 0.015),
      maxBondingCurveProgress: parseInt(process.env.MAX_BONDING_CURVE_PROGRESS || 10),
      sellBondingCurveProgress: parseInt(process.env.SELL_BONDING_CURVE_PROGRESS || 15),
      profitTarget1: 1.25,
      profitTarget2: 1.25,
      stopLossLimit: 0.90,
      monitorInterval: 5000,
      sellTimeout: 120000,
      tradeDelay: 90000,
      priorityFee: 0.0003
    };
    
    this.initializeWallet();
    this.isRunning = false;
    this.resetTimerFlag = false;
  }

  initializeWallet() {
    try {
      const walletPath = process.env.SOLANA_WALLET_PATH;
      const keypair = fs.readFileSync(walletPath, 'utf8');
      const keypairArray = JSON.parse(keypair);
      
      if (Array.isArray(keypairArray)) {
        this.privateKey = Uint8Array.from(keypairArray);
        this.payer = Keypair.fromSecretKey(this.privateKey);
        this.connection = new Connection(clusterApiUrl('mainnet-beta'));
        
        this.emit('log', {
          timestamp: Date.now(),
          message: 'Wallet initialized successfully',
          type: 'success'
        });
      } else {
        throw new Error('Invalid keypair format');
      }
    } catch (error) {
      this.emit('log', {
        timestamp: Date.now(),
        message: `Error initializing wallet: ${error.message}`,
        type: 'error'
      });
    }
  }

  async start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.status = 'running';
    this.emit('statusChange', this.status);
    
    // Start the main trading loop
    this.tradingLoop();
    
    // Start account monitoring
    this.startAccountMonitoring();
  }

  async stop() {
    this.isRunning = false;
    this.status = 'stopped';
    this.currentTrade = null;
    this.emit('statusChange', this.status);
  }

  getStatus() {
    return this.status;
  }

  async getAccountData() {
    try {
      const balance = await this.connection.getBalance(this.payer.publicKey);
      const tokens = await this.fetchSPLTokens();
      
      return {
        address: this.payer.publicKey.toString(),
        balance: balance / 1e9,
        tokens: tokens
      };
    } catch (error) {
      this.emit('log', {
        timestamp: Date.now(),
        message: `Error fetching account data: ${error.message}`,
        type: 'error'
      });
      
      return {
        address: this.payer?.publicKey?.toString() || '',
        balance: 0,
        tokens: []
      };
    }
  }

  async fetchSPLTokens() {
    try {
      const tokenAccounts = await this.connection.getTokenAccountsByOwner(
        this.payer.publicKey, 
        { programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") }
      );
      
      return tokenAccounts.value.map(accountInfo => {
        const accountData = AccountLayout.decode(accountInfo.account.data);
        return {
          mint: new PublicKey(accountData.mint).toString(),
          amount: Number(accountData.amount) / 10 ** 6
        };
      }).filter(token => token.amount > 1);
    } catch (error) {
      this.emit('log', {
        timestamp: Date.now(),
        message: `Error fetching SPL tokens: ${error.message}`,
        type: 'error'
      });
      return [];
    }
  }

  async fetchNewPairs(limit = 5) {
    const url = "https://pumpapi.fun/api/get_newer_mints";
    try {
      const response = await axios.get(url, { params: { limit } });
      return response.data.mint || [];
    } catch (error) {
      this.emit('log', {
        timestamp: Date.now(),
        message: `Error fetching new pairs: ${error.message}`,
        type: 'error'
      });
      return [];
    }
  }

  async scrapeTokenInfo(contractAddress) {
    let options = new chrome.Options();
    options.addArguments('--headless');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');

    let driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();

    try {
      await driver.get(`https://pump.fun/${contractAddress}`);
      await driver.sleep(5000);

      const pageSource = await driver.getPageSource();

      const extractText = (source, keyword) => {
        const index = source.indexOf(keyword);
        if (index !== -1) {
          const start = source.indexOf(':', index) + 2;
          const end = source.indexOf('<', start);
          return source.substring(start, end).trim();
        }
        return null;
      };

      const ticker = extractText(pageSource, 'Ticker');
      const marketcap = parseFloat(extractText(pageSource, 'Market cap').replace(/\$|,/g, ''));
      const bondingCurve = parseInt(extractText(pageSource, 'bonding curve progress').replace('%', ''));

      return { ticker, marketcap, bondingCurve };
    } catch (error) {
      this.emit('log', {
        timestamp: Date.now(),
        message: `Error scraping token info: ${error.message}`,
        type: 'error'
      });
      return null;
    } finally {
      await driver.quit();
    }
  }

  async pumpFunBuy(mint, amount) {
    const url = "https://pumpapi.fun/api/trade";
    const data = {
      trade_type: "buy",
      mint,
      amount,
      slippage: 5,
      priorityFee: this.settings.priorityFee,
      userPrivateKey: bs58.encode(this.privateKey)
    };

    try {
      const response = await axios.post(url, data);
      return response.data.tx_hash;
    } catch (error) {
      this.emit('log', {
        timestamp: Date.now(),
        message: `Error executing buy transaction: ${error.message}`,
        type: 'error'
      });
      return null;
    }
  }

  async pumpFunSell(mint, amount) {
    const url = "https://pumpapi.fun/api/trade";
    const data = {
      trade_type: "sell",
      mint,
      amount: amount.toString(),
      slippage: 5,
      priorityFee: this.settings.priorityFee,
      userPrivateKey: bs58.encode(this.privateKey)
    };

    try {
      const response = await axios.post(url, data);
      return response.data.tx_hash;
    } catch (error) {
      this.emit('log', {
        timestamp: Date.now(),
        message: `Error executing sell transaction: ${error.message}`,
        type: 'error'
      });
      return null;
    }
  }

  async sellAllTokens() {
    const tokens = await this.fetchSPLTokens();
    for (const token of tokens) {
      if (token.amount >= 1) {
        this.emit('log', {
          timestamp: Date.now(),
          message: `Selling ${token.amount} of token ${token.mint}`,
          type: 'warning'
        });

        let attempts = 5;
        let txHash = null;
        while (attempts > 0) {
          txHash = await this.pumpFunSell(token.mint, token.amount);
          if (txHash) {
            this.emit('log', {
              timestamp: Date.now(),
              message: `Sold ${token.amount} of token ${token.mint} with transaction hash: ${txHash}`,
              type: 'success'
            });
            break;
          } else {
            attempts--;
            await new Promise(resolve => setTimeout(resolve, 5000));
          }
        }

        if (!txHash) {
          this.emit('log', {
            timestamp: Date.now(),
            message: `Failed to sell token ${token.mint} after multiple attempts`,
            type: 'error'
          });
        }
      }
    }
  }

  async sellPercentage(percentage) {
    if (!this.currentTrade) return;
    
    const tokens = await this.fetchSPLTokens();
    const token = tokens.find(t => t.mint === this.currentTrade.mint);
    
    if (token) {
      const amountToSell = token.amount * (percentage / 100);
      if (amountToSell >= 1) {
        const txHash = await this.pumpFunSell(token.mint, amountToSell);
        if (txHash) {
          this.emit('log', {
            timestamp: Date.now(),
            message: `Sold ${percentage}% (${amountToSell}) of ${token.mint}`,
            type: 'success'
          });
        }
      }
    }
  }

  resetTimer() {
    this.resetTimerFlag = true;
  }

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    this.emit('log', {
      timestamp: Date.now(),
      message: 'Bot settings updated',
      type: 'info'
    });
  }

  async tradingLoop() {
    while (this.isRunning) {
      try {
        const newPairs = await this.fetchNewPairs();
        
        for (const mint of newPairs) {
          if (!this.isRunning) break;
          
          const tokenInfo = await this.scrapeTokenInfo(mint);
          
          if (tokenInfo && tokenInfo.bondingCurve < this.settings.maxBondingCurveProgress) {
            this.emit('log', {
              timestamp: Date.now(),
              message: `Found potential trade: ${tokenInfo.ticker} (${tokenInfo.bondingCurve}% bonding curve)`,
              type: 'info'
            });

            // Execute buy
            const txHash = await this.pumpFunBuy(mint, this.settings.minimumBuyAmount);
            
            if (txHash) {
              this.status = 'trading';
              this.emit('statusChange', this.status);
              
              this.currentTrade = {
                mint,
                ticker: tokenInfo.ticker,
                initialMarketCap: tokenInfo.marketcap,
                currentMarketCap: tokenInfo.marketcap,
                bondingCurve: tokenInfo.bondingCurve,
                profitLoss: 0,
                timeRemaining: this.settings.sellTimeout / 1000,
                buyPrice: tokenInfo.marketcap,
                currentPrice: tokenInfo.marketcap
              };

              this.emit('tradeUpdate', this.currentTrade);
              this.emit('log', {
                timestamp: Date.now(),
                message: `Buy executed for ${tokenInfo.ticker}: ${txHash}`,
                type: 'success'
              });

              // Start monitoring this trade
              await this.monitorTrade();
              
              this.status = 'running';
              this.currentTrade = null;
              this.emit('statusChange', this.status);
            }
          }
        }
        
        // Wait before checking for new pairs again
        await new Promise(resolve => setTimeout(resolve, 5000));
        
      } catch (error) {
        this.emit('log', {
          timestamp: Date.now(),
          message: `Trading loop error: ${error.message}`,
          type: 'error'
        });
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }
  }

  async monitorTrade() {
    let endTime = Date.now() + this.settings.sellTimeout;
    
    while (Date.now() < endTime && this.isRunning && this.currentTrade) {
      try {
        const tokenInfo = await this.scrapeTokenInfo(this.currentTrade.mint);
        
        if (tokenInfo) {
          const marketCapChange = ((tokenInfo.marketcap - this.currentTrade.initialMarketCap) / this.currentTrade.initialMarketCap) * 100;
          
          this.currentTrade.currentMarketCap = tokenInfo.marketcap;
          this.currentTrade.bondingCurve = tokenInfo.bondingCurve;
          this.currentTrade.profitLoss = marketCapChange;
          this.currentTrade.timeRemaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
          this.currentTrade.currentPrice = tokenInfo.marketcap;
          
          this.emit('tradeUpdate', this.currentTrade);
          
          // Check trading conditions
          if (marketCapChange >= 25) {
            this.emit('log', {
              timestamp: Date.now(),
              message: `Market cap increased by 25%. Selling 50% of tokens`,
              type: 'success'
            });
            await this.sellPercentage(50);
          } else if (marketCapChange <= -10) {
            this.emit('log', {
              timestamp: Date.now(),
              message: `Stop loss triggered. Selling all tokens`,
              type: 'warning'
            });
            await this.sellPercentage(100);
            break;
          } else if (tokenInfo.bondingCurve >= this.settings.sellBondingCurveProgress) {
            this.emit('log', {
              timestamp: Date.now(),
              message: `Bonding curve reached ${this.settings.sellBondingCurveProgress}%. Selling 75%`,
              type: 'warning'
            });
            await this.sellPercentage(75);
            break;
          }
          
          if (this.resetTimerFlag) {
            endTime = Date.now() + this.settings.sellTimeout;
            this.resetTimerFlag = false;
            this.emit('log', {
              timestamp: Date.now(),
              message: 'Timer reset',
              type: 'info'
            });
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, this.settings.monitorInterval));
        
      } catch (error) {
        this.emit('log', {
          timestamp: Date.now(),
          message: `Monitor trade error: ${error.message}`,
          type: 'error'
        });
      }
    }
    
    // Time expired, sell remaining tokens
    if (this.currentTrade) {
      this.emit('log', {
        timestamp: Date.now(),
        message: 'Trade timeout reached. Selling 75% of remaining tokens',
        type: 'warning'
      });
      await this.sellPercentage(75);
    }
  }

  startAccountMonitoring() {
    const updateAccount = async () => {
      if (this.isRunning) {
        const accountData = await this.getAccountData();
        this.emit('accountUpdate', accountData);
        setTimeout(updateAccount, 10000); // Update every 10 seconds
      }
    };
    updateAccount();
  }
}