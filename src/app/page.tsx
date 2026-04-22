"use client";

import React, { useEffect, useState } from "react";
import Script from "next/script";
import { Menu, X, Wallet } from "lucide-react";

// --- Types ---
type CoinConfig = { symbol: string; name: string; short: string; color: string; };

const COINS_CONFIG: CoinConfig[] = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', short: 'BTC', color: 'bg-orange-500' },
  { symbol: 'ETHUSDT', name: 'Ethereum', short: 'ETH', color: 'bg-indigo-500' },
  { symbol: 'BNBUSDT', name: 'BNB Chain', short: 'BNB', color: 'bg-yellow-500' },
  { symbol: 'SOLUSDT', name: 'Solana', short: 'SOL', color: 'bg-teal-500' },
  { symbol: 'TRXUSDT', name: 'TRON', short: 'TRX', color: 'bg-red-500' }
];

const TRANSLATIONS = {
  zh: {
    top: "机构级情报",
    title: "发现市场异动信号",
    subtitle: "我们的分析团队刚刚检测到 3 个高潜力机会",
    items: [
      { title: "10倍潜力山寨币名单", desc: "基于链上资金流向与筹码分布的独家研报", icon: "📈" },
      { title: "巨鲸地址实时监控", desc: "获取大户在底部悄悄建仓的币种通知", icon: "🐳" }
    ],
    cta: "立即获取完整分析报告",
    skip: "暂时忽略",
    members: "已有 5,280+ 位交易员加入",
    footer: "在我们的 WhatsApp 社区获取每日分析",
    wsTip: "加入内部群"
  },
  en: {
    top: "Institutional Intel",
    title: "Market Anomaly Detected",
    subtitle: "Our analysis team just detected 3 high-potential opportunities",
    items: [
      { title: "10x Potential Altcoin List", desc: "Exclusive research based on on-chain flows & distribution", icon: "📈" },
      { title: "Real-time Whale Tracking", desc: "Get notified of coins accumulated quietly by whales", icon: "🐳" }
    ],
    cta: "Get Complete Analysis Report",
    skip: "Remind Me Later",
    members: "5,280+ traders have joined",
    footer: "Get daily analysis in our WhatsApp community",
    wsTip: "Join Group"
  }
};

export default function Home() {
  const [lang, setLang] = useState<"zh" | "en">("en");
  const [prices, setPrices] = useState<Record<string, any>>({});
  const [currentCoin, setCurrentCoin] = useState(COINS_CONFIG[0]);
  const [showModal, setShowModal] = useState(false);
  const [checkInCount, setCheckInCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTVLoaded, setIsTVLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'market' | 'airdrop' | 'whale' | 'tools'>('market');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [contactConfig, setContactConfig] = useState({ wsNumber: '', groupLink: '', checkInReward: '1' });

  const handleConnectWallet = () => {
    if (walletAddress) {
      setWalletAddress(null);
    } else {
      setWalletAddress(`0x${Math.random().toString(16).slice(2, 6).toUpperCase()}...${Math.random().toString(16).slice(2, 6).toUpperCase()}`);
    }
  };

  useEffect(() => {
    // Force English language
    setLang('en');

    // Init CheckIn
    const checkInData = JSON.parse(localStorage.getItem('web3_checkin_v6') || '{"count":0,"last":0}');
    setCheckInCount(checkInData.count);

    // Fetch contact config
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        if (data) setContactConfig(data);
      })
      .catch(console.error);

    // Modal timeout (8 seconds)
    const timer = setTimeout(() => setShowModal(true), 8000);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const symbolsArr = COINS_CONFIG.map(c => c.symbol);
        const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=${JSON.stringify(symbolsArr)}`);
        const data = await res.json();
        const priceMap: Record<string, any> = {};
        data.forEach((item: any) => {
          priceMap[item.symbol] = {
            price: parseFloat(item.lastPrice).toLocaleString(),
            change: parseFloat(item.priceChangePercent).toFixed(2),
            isUp: parseFloat(item.priceChangePercent) >= 0
          };
        });
        setPrices(priceMap);
      } catch (e) {
        console.error(e);
      }
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCheckIn = () => {
    const data = JSON.parse(localStorage.getItem('web3_checkin_v6') || '{"count":0,"last":0}');
    if (new Date(data.last).toDateString() === new Date().toDateString()) return;
    
    data.count = data.count >= 7 ? 1 : data.count + 1;
    data.last = Date.now();
    localStorage.setItem('web3_checkin_v6', JSON.stringify(data));
    setCheckInCount(data.count);
  };

  const t = TRANSLATIONS[lang];

  // Load TradingView chart
  useEffect(() => {
    if (activeTab === 'market' && isTVLoaded && typeof window !== "undefined" && (window as any).TradingView) {
      new (window as any).TradingView.widget({
        "width": "100%",
        "height": 500,
        "symbol": `BINANCE:${currentCoin.symbol}`,
        "interval": "60",
        "theme": "dark",
        "style": "1",
        "locale": lang === 'zh' ? "zh_CN" : "en",
        "container_id": "tradingview_widget",
        "backgroundColor": "#131722",
      });
    }
  }, [currentCoin, lang, isTVLoaded, activeTab]);

  return (
    <div className="p-4 md:p-8 pb-24">
      {/* 顶部数据栏 */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-wrap items-center gap-4 text-[11px] font-medium text-slate-400">
        <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50">
          <span className="text-orange-400">⛽ Gas:</span>
          <span className="text-white">12 Gwei</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50">
          <span className="text-blue-400">💎 ETH Burn:</span>
          <span className="text-white">0.82 ETH/min</span>
        </div>
        <div className="flex-1 overflow-hidden relative h-6 hidden md:block">
          <div className="whale-scroll absolute whitespace-nowrap flex items-center gap-8">
            <span className="flex items-center gap-1"><span className="text-yellow-500">🚨 Whale Alert:</span> 1,200 #BTC (78,420,112 USD) transferred from Unknown Wallet to Binance</span>
            <span className="flex items-center gap-1"><span className="text-yellow-500">🚨 Whale Alert:</span> 15,000 #ETH (34,120,550 USD) transferred from Coinbase to Unknown Wallet</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* 导航栏 */}
        <header className="flex justify-between items-center mb-8 relative">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/30">I</div>
            <h1 className="text-2xl font-bold tracking-tight">InsiderCoin<span className="text-indigo-400">Club</span></h1>
          </div>
          
          <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-400">
            {[
              { id: 'market', label: 'K线行情' },
              { id: 'airdrop', label: '空投雷达' },
              { id: 'whale', label: '鲸鱼动态' },
              { id: 'tools', label: '工具箱' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`transition pb-1 border-b-2 ${activeTab === tab.id ? 'text-white font-bold border-indigo-500' : 'border-transparent hover:text-white hover:border-slate-600'}`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <button onClick={handleConnectWallet} className="bg-indigo-600 hover:bg-indigo-500 px-6 py-2 rounded-full text-sm font-semibold transition shadow-lg shadow-indigo-500/20 flex items-center gap-2">
              <Wallet size={16} />
              {walletAddress ? walletAddress : '连接钱包'}
            </button>
          </div>

          <button 
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* 移动端菜单 */}
          {isMobileMenuOpen && (
            <div className="absolute top-14 left-0 w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl z-50 flex flex-col gap-4 md:hidden">
              {[
                { id: 'market', label: 'K线行情' },
                { id: 'airdrop', label: '空投雷达' },
                { id: 'whale', label: '鲸鱼动态' },
                { id: 'tools', label: '工具箱' }
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id as any); setIsMobileMenuOpen(false); }}
                  className={`text-left font-medium py-2 border-b border-slate-800 ${activeTab === tab.id ? 'text-indigo-400' : 'text-slate-400 hover:text-white'}`}
                >
                  {tab.label}
                </button>
              ))}
              <button onClick={() => { handleConnectWallet(); setIsMobileMenuOpen(false); }} className="bg-indigo-600 hover:bg-indigo-500 w-full py-3 rounded-full text-sm font-semibold transition shadow-lg shadow-indigo-500/20 flex justify-center items-center gap-2 mt-2">
                <Wallet size={16} />
                {walletAddress ? walletAddress : '连接钱包'}
              </button>
            </div>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 左侧：热门资产列表 */}
          <aside className="lg:col-span-3 order-2 lg:order-1 space-y-4">
            <div className="glass-card rounded-2xl p-4">
              <h3 className="text-sm font-bold text-slate-400 mb-4 px-2 uppercase tracking-wider">实时行情</h3>
              <div id="crypto-list" className="space-y-1 overflow-y-auto max-h-[400px] pr-1">
                {COINS_CONFIG.map(coin => {
                  const pData = prices[coin.symbol] || { price: '--', change: '+0.00', isUp: true };
                  const isActive = currentCoin.symbol === coin.symbol;
                  
                  return (
                    <div 
                      key={coin.symbol}
                      onClick={() => setCurrentCoin(coin)}
                      className={`crypto-item flex justify-between items-center p-3 rounded-xl cursor-pointer transition ${isActive ? 'bg-indigo-500/20 border-indigo-500/50' : 'border-transparent hover:bg-indigo-500/10'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 ${coin.color} rounded-full flex items-center justify-center font-bold text-[10px] text-white`}>
                          {coin.short[0]}
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase mb-1">{coin.short}</p>
                          <p className="text-[9px] text-slate-500">{coin.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold">{pData.price}</p>
                        <p className={`text-[9px] ${pData.isUp ? 'trend-up' : 'trend-down'}`}>
                          {pData.isUp ? '+' : ''}{pData.change}%
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 签到引流模块 */}
            <section className="glass-card rounded-2xl p-5 border-t-2 border-indigo-500/50">
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2 text-yellow-400">
                <span>🎁</span> 签到领 {contactConfig.checkInReward || '1'} USDT，签到后添加客服可以免费领取USDT！
              </h3>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[1,2,3,4,5,6,7].map(day => (
                  <div key={day} className={`check-in-dot w-full aspect-square rounded-lg flex items-center justify-center text-[10px] border ${day <= checkInCount ? 'active bg-indigo-500 border-indigo-400' : 'bg-slate-800 border-slate-700'}`}>
                    {day}
                  </div>
                ))}
              </div>
              <button 
                onClick={handleCheckIn} 
                className="w-full bg-indigo-600 hover:bg-indigo-500 py-2 rounded-xl text-xs font-bold transition"
              >
                立即签到
              </button>
            </section>
          </aside>

          {/* 右侧：主内容区 */}
          <main className="lg:col-span-9 order-1 lg:order-2 space-y-6">
            {activeTab === 'market' && (
              <>
                <div className="glass-card rounded-3xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold">{currentCoin.name}</span>
                      <span className="text-sm text-slate-400 font-mono">{currentCoin.short} / USDT</span>
                    </div>
                  </div>
                  <div id="chart-wrapper">
                    <div id="tradingview_widget" className="w-full h-full"></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="glass-card rounded-2xl p-6">
                    <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">市场情绪 (F&G)</p>
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-indigo-400">68</div>
                      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500" style={{ width: '68%' }}></div>
                      </div>
                      <span className="text-xs text-green-400">贪婪</span>
                    </div>
                  </div>
                  <div className="glass-card rounded-2xl p-6">
                    <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">24H 爆仓统计</p>
                    <div className="text-2xl font-bold text-red-400">$128.42M</div>
                    <p className="text-[10px] text-slate-500 mt-1">多单爆仓占 64%</p>
                  </div>
                  <div onClick={() => contactConfig.groupLink ? window.open(contactConfig.groupLink, '_blank') : setShowModal(true)} className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 relative overflow-hidden group cursor-pointer">
                    <div className="relative z-10">
                      <h3 className="font-bold mb-1 italic">Web3 VIP 策略群 ↗</h3>
                      <p className="text-[10px] text-indigo-100">今日已捕捉 12 个异动信号</p>
                    </div>
                    <div className="absolute -right-2 -bottom-2 text-6xl opacity-20 group-hover:scale-110 transition">💎</div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'airdrop' && (
              <div className="glass-card rounded-3xl p-6 animate-pop">
                <h2 className="text-2xl font-bold mb-6">空投雷达 Airdrop Radar</h2>
                <div className="space-y-4">
                  <div className="bg-slate-800/50 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-slate-700/50 hover:border-indigo-500/30 transition">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center font-bold text-lg shadow-lg shadow-purple-500/20">zk</div>
                      <div>
                        <h4 className="font-bold text-base">zkSync Era</h4>
                        <p className="text-xs text-slate-400 mt-1">L2 Rollup 龙头 - 快照预计第四季度</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <span className="text-[10px] font-mono text-orange-400 bg-orange-400/10 border border-orange-400/20 px-2 py-1 rounded">极高潜力</span>
                      <button onClick={() => setShowModal(true)} className="bg-indigo-600 hover:bg-indigo-500 px-5 py-2 rounded-xl text-xs font-bold transition ml-auto shadow-lg shadow-indigo-500/20">获取教程</button>
                    </div>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-slate-700/50 hover:border-indigo-500/30 transition">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-500/20">L0</div>
                      <div>
                        <h4 className="font-bold text-base">LayerZero</h4>
                        <p className="text-xs text-slate-400 mt-1">全链互操作性协议 - 持续交互追踪中</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <span className="text-[10px] font-mono text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-1 rounded">确认发币</span>
                      <button onClick={() => setShowModal(true)} className="bg-indigo-600 hover:bg-indigo-500 px-5 py-2 rounded-xl text-xs font-bold transition ml-auto shadow-lg shadow-indigo-500/20">获取教程</button>
                    </div>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-slate-700/50 hover:border-indigo-500/30 transition">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center font-bold text-black text-lg shadow-lg shadow-yellow-500/20">M</div>
                      <div>
                        <h4 className="font-bold text-base">MetaMask</h4>
                        <p className="text-xs text-slate-400 mt-1">去中心化钱包 - 建议埋伏 Swap 交互</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <span className="text-[10px] font-mono text-blue-400 bg-blue-400/10 border border-blue-400/20 px-2 py-1 rounded">早期埋伏</span>
                      <button onClick={() => setShowModal(true)} className="bg-indigo-600 hover:bg-indigo-500 px-5 py-2 rounded-xl text-xs font-bold transition ml-auto shadow-lg shadow-indigo-500/20">获取教程</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'whale' && (
              <div className="glass-card rounded-3xl p-6 animate-pop">
                <h2 className="text-2xl font-bold mb-6">鲸鱼动态 Whale Tracker</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm min-w-[600px]">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-700/50">
                        <th className="pb-4 font-medium px-2">时间</th>
                        <th className="pb-4 font-medium px-2">资产</th>
                        <th className="pb-4 font-medium px-2">金额</th>
                        <th className="pb-4 font-medium px-2">流向</th>
                        <th className="pb-4 font-medium px-2 text-right">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      <tr className="hover:bg-indigo-500/5 transition">
                        <td className="py-5 px-2 text-slate-300">10 分钟前</td>
                        <td className="py-5 px-2 font-bold text-orange-400">BTC</td>
                        <td className="py-5 px-2 font-mono">1,200 ($78.4M)</td>
                        <td className="py-5 px-2 text-red-400 flex items-center gap-2">
                          <span className="truncate max-w-[100px]" title="未知钱包">未知钱包</span>
                          <span>➔</span>
                          <span className="font-bold">Binance</span>
                        </td>
                        <td className="py-5 px-2 text-right"><button className="text-indigo-400 hover:text-indigo-300 text-xs font-medium border border-indigo-500/30 px-3 py-1 rounded-lg">Tx Hash</button></td>
                      </tr>
                      <tr className="hover:bg-indigo-500/5 transition">
                        <td className="py-5 px-2 text-slate-300">15 分钟前</td>
                        <td className="py-5 px-2 font-bold text-indigo-400">ETH</td>
                        <td className="py-5 px-2 font-mono">15,000 ($34.1M)</td>
                        <td className="py-5 px-2 text-green-400 flex items-center gap-2">
                          <span className="font-bold">Coinbase</span>
                          <span>➔</span>
                          <span className="truncate max-w-[100px]" title="未知钱包">未知钱包</span>
                        </td>
                        <td className="py-5 px-2 text-right"><button className="text-indigo-400 hover:text-indigo-300 text-xs font-medium border border-indigo-500/30 px-3 py-1 rounded-lg">Tx Hash</button></td>
                      </tr>
                      <tr className="hover:bg-indigo-500/5 transition">
                        <td className="py-5 px-2 text-slate-300">1 小时前</td>
                        <td className="py-5 px-2 font-bold text-teal-400">USDT</td>
                        <td className="py-5 px-2 font-mono">50,000,000</td>
                        <td className="py-5 px-2 text-green-400 flex items-center gap-2">
                          <span className="font-bold">Tether</span>
                          <span>➔</span>
                          <span className="truncate max-w-[100px]" title="未知钱包">未知钱包</span>
                        </td>
                        <td className="py-5 px-2 text-right"><button className="text-indigo-400 hover:text-indigo-300 text-xs font-medium border border-indigo-500/30 px-3 py-1 rounded-lg">Tx Hash</button></td>
                      </tr>
                      <tr className="hover:bg-indigo-500/5 transition">
                        <td className="py-5 px-2 text-slate-300">2 小时前</td>
                        <td className="py-5 px-2 font-bold text-purple-400">SOL</td>
                        <td className="py-5 px-2 font-mono">250,000 ($28.5M)</td>
                        <td className="py-5 px-2 text-red-400 flex items-center gap-2">
                          <span className="truncate max-w-[100px]" title="未知钱包">未知钱包</span>
                          <span>➔</span>
                          <span className="font-bold">Kraken</span>
                        </td>
                        <td className="py-5 px-2 text-right"><button className="text-indigo-400 hover:text-indigo-300 text-xs font-medium border border-indigo-500/30 px-3 py-1 rounded-lg">Tx Hash</button></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'tools' && (
              <div className="glass-card rounded-3xl p-6 animate-pop">
                <h2 className="text-2xl font-bold mb-6">Web3 工具箱 Toolbox</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 hover:border-indigo-500/50 transition cursor-pointer group">
                    <div className="text-3xl mb-3 group-hover:scale-110 transition origin-left inline-block">⛽</div>
                    <h4 className="font-bold text-lg mb-1">Gas 追踪器</h4>
                    <p className="text-xs text-slate-400 mb-4 leading-relaxed">实时监控以太坊网络及各大 L2 的 Gas 费用波动，帮助您在最佳时机发送交易，节省高昂的手续费。</p>
                    <button className="text-xs font-bold text-indigo-400 group-hover:text-indigo-300 flex items-center gap-1">使用工具 <span className="group-hover:translate-x-1 transition">➔</span></button>
                  </div>
                  <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 hover:border-indigo-500/50 transition cursor-pointer group">
                    <div className="text-3xl mb-3 group-hover:scale-110 transition origin-left inline-block">🧮</div>
                    <h4 className="font-bold text-lg mb-1">无常损失计算器</h4>
                    <p className="text-xs text-slate-400 mb-4 leading-relaxed">一键计算提供 DEX 流动性 (LP) 时的潜在无常损失，对比持有单币的收益率，为挖矿决策提供数据支撑。</p>
                    <button className="text-xs font-bold text-indigo-400 group-hover:text-indigo-300 flex items-center gap-1">使用工具 <span className="group-hover:translate-x-1 transition">➔</span></button>
                  </div>
                  <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 hover:border-indigo-500/50 transition cursor-pointer group">
                    <div className="text-3xl mb-3 group-hover:scale-110 transition origin-left inline-block">🔐</div>
                    <h4 className="font-bold text-lg mb-1">授权取消 (Revoke)</h4>
                    <p className="text-xs text-slate-400 mb-4 leading-relaxed">检查您的钱包地址历史授权记录，并一键取消过期或可疑合约的代币无限授权，保障资产安全。</p>
                    <button className="text-xs font-bold text-indigo-400 group-hover:text-indigo-300 flex items-center gap-1">使用工具 <span className="group-hover:translate-x-1 transition">➔</span></button>
                  </div>
                  <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 hover:border-indigo-500/50 transition cursor-pointer group">
                    <div className="text-3xl mb-3 group-hover:scale-110 transition origin-left inline-block">🛡️</div>
                    <h4 className="font-bold text-lg mb-1">代币安全检测</h4>
                    <p className="text-xs text-slate-400 mb-4 leading-relaxed">自动扫描智能合约代码，一键识别貔貅盘 (Honeypot)、增发漏洞及后门风险，预防冲土狗被骗。</p>
                    <button className="text-xs font-bold text-indigo-400 group-hover:text-indigo-300 flex items-center gap-1">使用工具 <span className="group-hover:translate-x-1 transition">➔</span></button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* 引导弹窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/20 animate-pop">
            <div className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 p-8 text-center relative">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.1)_0%,_transparent_70%)]"></div>
              
              <div className="inline-block bg-white/10 backdrop-blur-md px-4 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] mb-4 text-white/90 border border-white/20 relative z-10">
                <span>{t.top}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight relative z-10">
                {t.title}
              </h2>
              <p className="text-indigo-100 text-sm mt-3 font-medium relative z-10">
                {t.subtitle}
              </p>
            </div>
            
            <div className="p-8 bg-slate-900">
              <ul className="space-y-6 mb-8">
                {t.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 mt-0.5 rounded-full bg-slate-800 flex items-center justify-center text-xl shadow-inner">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white mb-1 leading-tight">{item.title}</h4>
                      <p className="text-xs text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
              
              <div className="flex flex-col gap-3">
                <a href={contactConfig.groupLink || "https://wa.me/#"} target="_blank" rel="noreferrer" className="w-full bg-white text-indigo-900 py-4 rounded-2xl font-bold text-base text-center hover:bg-slate-100 transition shadow-lg active:scale-[0.98]">
                  {t.cta}
                </a>
                <button onClick={() => setShowModal(false)} className="w-full bg-slate-800 text-slate-300 py-4 rounded-2xl font-medium text-sm hover:bg-slate-700 transition">
                  {t.skip}
                </button>
              </div>
              
              <div className="mt-8 flex items-center justify-between border-t border-slate-800 pt-6">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-slate-700 border border-slate-900 flex items-center justify-center text-[10px]">👤</div>
                    <div className="w-6 h-6 rounded-full bg-indigo-700 border border-slate-900 flex items-center justify-center text-[10px]">👤</div>
                    <div className="w-6 h-6 rounded-full bg-purple-700 border border-slate-900 flex items-center justify-center text-[10px]">👤</div>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">{t.members}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-[#0b1016] border-t border-slate-800/50 px-6 py-4 flex items-center gap-3">
              <div className="w-6 h-6 bg-green-900/50 rounded-md flex items-center justify-center text-[10px]">📞</div>
              <p className="text-xs text-slate-400">{t.footer}</p>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp 客服浮标 */}
      <a href={contactConfig.wsNumber ? `https://wa.me/${contactConfig.wsNumber}` : "https://wa.me/#"} target="_blank" rel="noreferrer" className="ws-float">
        <span className="ws-tooltip">{t.wsTip}</span>
        <div className="ws-badge"></div>
        <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.284l-.579 2.116 2.165-.568c.963.523 1.941.835 3.163.835 3.182 0 5.769-2.587 5.77-5.767 0-3.182-2.587-5.766-5.77-5.766zm3.377 8.203c-.144.405-.833.748-1.159.796-.33.049-.77.067-1.242-.086-.307-.1-.709-.236-1.274-.482-2.415-1.053-3.967-3.513-4.085-3.673-.117-.161-1.047-1.386-1.047-2.645 0-1.258.643-1.876.877-2.13.233-.255.518-.319.691-.319.174 0 .348.003.501.011.161.008.377-.061.591.45.221.529.756 1.843.823 1.976.067.135.111.293.021.472-.09.18-.135.293-.27.45-.136.159-.285.355-.407.476-.135.135-.277.282-.12.551.157.269.697 1.15 1.492 1.862.833.744 1.537.974 1.761 1.086.224.113.355.093.487-.06.133-.153.565-.66.716-.885.151-.225.302-.189.508-.113s1.31.618 1.536.731c.227.113.378.169.433.264.054.095.054.55-.09.955z"/>
          <path d="M12 1c-6.075 0-11 4.925-11 11s4.925 11 11 11 11-4.925 11-11-4.925-11-11-11zm0 20c-4.963 0-9-4.037-9-9s4.037-9 9-9 9 4.037 9 9-4.037 9-9 9z"/>
        </svg>
      </a>

      {/* Load TradingView script */}
      <Script 
        src="https://s3.tradingview.com/tv.js" 
        strategy="afterInteractive" 
        onLoad={() => setIsTVLoaded(true)} 
      />
    </div>
  );
}
