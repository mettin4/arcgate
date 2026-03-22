import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const USDC_ADDRESS = '0x3600000000000000000000000000000000000000';
const RPC_URL = 'https://rpc.quicknode.testnet.arc.network';
const ARC_CHAIN_ID = '0x' + (5042002).toString(16);
const USDC_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
];
const PLATFORM_IBAN = 'DE89 3704 0044 0532 0130 00';
const PLATFORM_BIC = 'COBADEFFXXX';
const PLATFORM_BANK = 'Circle Payments Europe';

function Logo({ size = 36 }) {
  const id = 'lg' + size;
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4F46E5"/>
          <stop offset="100%" stopColor="#7C3AED"/>
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill={`url(#${id})`}/>
      <text x="20" y="26" textAnchor="middle" fill="white" fontSize="15" fontWeight="700" fontFamily="Inter, -apple-system, sans-serif" letterSpacing="0.5">AG</text>
    </svg>
  );
}

function StepBar({ step, total }) {
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i < step ? '#6366f1' : 'rgba(255,255,255,0.1)', transition: 'background 0.4s' }}/>
      ))}
    </div>
  );
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      style={{ background: copied ? 'rgba(34,197,94,0.2)' : 'rgba(99,102,241,0.2)', border: `1px solid ${copied ? 'rgba(34,197,94,0.4)' : 'rgba(99,102,241,0.4)'}`, borderRadius: 6, color: copied ? '#22c55e' : '#a5b4fc', fontSize: 11, padding: '3px 8px', cursor: 'pointer', transition: 'all 0.2s' }}>
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '16px 20px' }}>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, margin: '0 0 6px', fontWeight: 500 }}>{label}</p>
      <p style={{ color: '#fff', fontSize: 16, fontWeight: 700, margin: '0 0 2px' }}>{value}</p>
      {sub && <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, margin: 0 }}>{sub}</p>}
    </div>
  );
}

function validateIBAN(iban) {
  const clean = iban.replace(/\s/g, '').toUpperCase();
  return clean.length >= 15 && clean.length <= 34 && /^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(clean);
}

export default function App() {
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState('0');
  const [tab, setTab] = useState('onramp');
  const [eurRate, setEurRate] = useState(1.053);
  const [rateLoading, setRateLoading] = useState(true);
  const [networkStatus, setNetworkStatus] = useState('checking');
  const [txHistory, setTxHistory] = useState([]);

  const [onStep, setOnStep] = useState(1);
  const [onAmount, setOnAmount] = useState('');
  const [onRef, setOnRef] = useState('');
  const [onCountdown, setOnCountdown] = useState(null);
  const [onStatus, setOnStatus] = useState('');
  const [onLoading, setOnLoading] = useState(false);

  const [offStep, setOffStep] = useState(1);
  const [offAmount, setOffAmount] = useState('');
  const [offIban, setOffIban] = useState('');
  const [offName, setOffName] = useState('');
  const [offStatus, setOffStatus] = useState('');
  const [offLoading, setOffLoading] = useState(false);
  const [offTxHash, setOffTxHash] = useState('');

  const USDC_TO_EUR = 1 / eurRate;
  const fee = 0.005;
  const onReceive = onAmount && parseFloat(onAmount) > 0 ? (parseFloat(onAmount) * eurRate * (1 - fee)).toFixed(2) : '0.00';
  const onFeeAmt = onAmount && parseFloat(onAmount) > 0 ? (parseFloat(onAmount) * fee).toFixed(2) : '0.00';
  const offReceive = offAmount && parseFloat(offAmount) > 0 ? (parseFloat(offAmount) * USDC_TO_EUR * (1 - fee)).toFixed(2) : '0.00';
  const offFeeAmt = offAmount && parseFloat(offAmount) > 0 ? (parseFloat(offAmount) * fee).toFixed(2) : '0.00';
  const arrivalDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  const onAmountValid = onAmount && parseFloat(onAmount) >= 10 && parseFloat(onAmount) <= 10000;
  const offAmountValid = offAmount && parseFloat(offAmount) > 0 && parseFloat(offAmount) <= parseFloat(balance);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      input[type=number]::-webkit-inner-spin-button,
      input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
      input[type=number] { -moz-appearance: textfield; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    function fetchRate() {
      fetch('https://api.coingecko.com/api/v3/simple/price?ids=usd-coin&vs_currencies=eur')
        .then(r => r.json())
        .then(d => {
          if (d['usd-coin']?.eur) {
            const eurPerUsdc = d['usd-coin'].eur;
            setEurRate(1 / eurPerUsdc);
          }
        })
        .catch(() => {})
        .finally(() => setRateLoading(false));
    }
    fetchRate();
    const interval = setInterval(fetchRate, 30000);

    fetch(RPC_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_blockNumber', params: [], id: 1 }) })
      .then(r => r.json())
      .then(() => setNetworkStatus('online'))
      .catch(() => setNetworkStatus('offline'));

    const saved = localStorage.getItem('arcgate_history');
    if (saved) setTxHistory(JSON.parse(saved));

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (onCountdown === null) return;
    if (onCountdown <= 0) return;
    const t = setTimeout(() => setOnCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [onCountdown]);

  function addHistory(type, amount, currency) {
    const entry = { id: Date.now(), type, amount, currency, status: 'completed', date: new Date().toISOString() };
    const updated = [entry, ...txHistory].slice(0, 5);
    setTxHistory(updated);
    localStorage.setItem('arcgate_history', JSON.stringify(updated));
  }

  async function connectWallet() {
    if (!window.ethereum) return alert('Please install MetaMask!');
    try {
      await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: ARC_CHAIN_ID }] });
    } catch (e) {
      if (e.code === 4902) await window.ethereum.request({ method: 'wallet_addEthereumChain', params: [{ chainId: ARC_CHAIN_ID, chainName: 'Arc Testnet', rpcUrls: [RPC_URL], nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 6 }, blockExplorerUrls: ['https://testnet.arcscan.app'] }] });
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send('eth_requestAccounts', []);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    setWallet(address);
    await refreshBalance(address);
  }

  function disconnectWallet() { setWallet(null); setBalance('0'); }

  async function refreshBalance(address) {
    const rp = new ethers.JsonRpcProvider(RPC_URL);
    const usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, rp);
    const bal = await usdc.balanceOf(address);
    setBalance(ethers.formatUnits(bal, 6));
  }

  function handleOnAmount(val) {
    if (val === '' || (parseFloat(val) >= 0)) setOnAmount(val);
  }

  function handleOffAmount(val) {
    if (val === '' || (parseFloat(val) >= 0 && parseFloat(val) <= parseFloat(balance))) setOffAmount(val);
  }

  function startOnRamp() { setOnRef('ARCGATE-' + Math.random().toString(36).slice(2, 8).toUpperCase()); setOnStep(2); }
  function confirmSent() { setOnStep(3); setOnStatus('pending'); setOnCountdown(10); }

  async function simulateReceived() {
    setOnLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    addHistory('buy', onAmount, 'EUR');
    setOnStatus('success');
    setOnLoading(false);
  }

  async function executeOffRamp() {
    if (!wallet || !offAmount) return;
    setOffLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer);
      const tx = await usdc.transfer('0x0000000000000000000000000000000000000001', ethers.parseUnits(offAmount, 6));
      setOffStatus('pending');
      await tx.wait();
      setOffTxHash(tx.hash);
      addHistory('sell', offAmount, 'USDC');
      setOffStatus('success');
      await refreshBalance(wallet);
    } catch (e) {
      setOffStatus('error');
    }
    setOffLoading(false);
  }

  function resetOn() { setOnStep(1); setOnAmount(''); setOnRef(''); setOnStatus(''); setOnCountdown(null); }
  function resetOff() { setOffStep(1); setOffAmount(''); setOffIban(''); setOffName(''); setOffStatus(''); setOffTxHash(''); }

  const C = {
    bg: '#0A0A0F',
    card: 'rgba(255,255,255,0.04)',
    border: 'rgba(255,255,255,0.08)',
    text: '#F0F0FF',
    muted: 'rgba(255,255,255,0.4)',
    purple: '#6366f1',
    purpleLight: '#a5b4fc',
    green: '#22c55e',
    yellow: '#eab308',
    red: '#ef4444',
  };

  const inp = { width: '100%', padding: '13px 16px', background: 'rgba(0,0,0,0.4)', border: `1px solid ${C.border}`, borderRadius: 12, fontSize: 15, color: C.text, outline: 'none', boxSizing: 'border-box', marginBottom: 14, appearance: 'none', MozAppearance: 'textfield', WebkitAppearance: 'none' };
  const btnPrimary = { width: '100%', padding: '15px', background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: '#fff', border: 'none', borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 8 };
  const btnGhost = { width: '100%', padding: '13px', background: 'transparent', color: C.muted, border: `1px solid ${C.border}`, borderRadius: 14, fontSize: 14, cursor: 'pointer', marginTop: 8 };
  const row = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: `1px solid ${C.border}` };

  const onRampSteps = [
    { icon: '①', title: 'Connect your wallet', desc: 'Link your MetaMask to Arc Testnet' },
    { icon: '②', title: 'Enter EUR amount', desc: 'Choose how much EUR you want to spend' },
    { icon: '③', title: 'Send bank transfer', desc: 'Transfer EUR to our Circle Payments IBAN' },
    { icon: '④', title: 'Receive USDC', desc: 'USDC is automatically released to your wallet' },
  ];

  const offRampSteps = [
    { icon: '①', title: 'Connect your wallet', desc: 'Link your MetaMask to Arc Testnet' },
    { icon: '②', title: 'Enter USDC amount', desc: 'Choose how much USDC you want to sell' },
    { icon: '③', title: 'Enter your IBAN', desc: 'Provide your EUR bank account details' },
    { icon: '④', title: 'Receive EUR', desc: 'EUR arrives in your bank within 1-2 business days' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: "'Inter', -apple-system, sans-serif" }}>

      <nav style={{ borderBottom: `1px solid ${C.border}`, padding: '0 40px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Logo size={32}/>
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.3px' }}>ArcGate</span>
          <span style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 6, padding: '2px 8px', fontSize: 11, color: C.purpleLight, marginLeft: 4 }}>TESTNET</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: networkStatus === 'online' ? C.green : networkStatus === 'offline' ? C.red : C.yellow }}/>
            <span style={{ fontSize: 13, color: C.muted }}>Arc Testnet {networkStatus === 'online' ? 'Live' : networkStatus === 'offline' ? 'Offline' : '...'}</span>
          </div>
          {wallet ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 10, padding: '7px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.green }}/>
                <span style={{ fontSize: 13, color: C.purpleLight }}>{wallet.slice(0,6)}...{wallet.slice(-4)}</span>
                <span style={{ fontSize: 13, color: C.muted }}>·</span>
                <span style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>{parseFloat(balance).toFixed(2)} USDC</span>
              </div>
              <button onClick={disconnectWallet} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '7px 12px', color: C.red, fontSize: 13, cursor: 'pointer' }}>Disconnect</button>
            </div>
          ) : (
            <button onClick={connectWallet} style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', border: 'none', borderRadius: 10, padding: '8px 18px', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Connect Wallet</button>
          )}
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 40px', display: 'grid', gridTemplateColumns: '1fr 460px', gap: 32, alignItems: 'start' }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <h1 style={{ fontSize: 42, fontWeight: 800, margin: '0 0 12px', lineHeight: 1.15, letterSpacing: '-1px' }}>
              The fastest way to<br/>
              <span style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>move money onchain</span>
            </h1>
            <p style={{ color: C.muted, fontSize: 16, lineHeight: 1.7, margin: 0 }}>
              Buy and sell USDC instantly on Arc Testnet.<br/>Bank transfers in EUR, settled on-chain in seconds.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <StatCard
              label="EUR → USDC Rate"
              value={rateLoading ? '...' : `1 EUR = ${eurRate.toFixed(4)} USDC`}
              sub={rateLoading ? 'Loading...' : 'Updates every 30s'}
            />
            <StatCard label="Settlement Time" value="< 0.5s" sub="Arc Testnet finality"/>
            <StatCard label="Network Fee" value="0.5%" sub="Per transaction"/>
          </div>

          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 28 }}>
            <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700 }}>How ArcGate Works</h3>
            <p style={{ color: C.muted, fontSize: 13, margin: '0 0 20px' }}>{tab === 'onramp' ? 'Buying USDC with EUR' : 'Selling USDC for EUR'}</p>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {(tab === 'onramp' ? onRampSteps : offRampSteps).map((s, i, arr) => (
                <div key={i} style={{ display: 'flex', gap: 16, padding: '14px 0', borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                  <div style={{ width: 32, height: 32, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: C.purpleLight, flexShrink: 0 }}>{s.icon}</div>
                  <div>
                    <p style={{ margin: '0 0 3px', fontWeight: 600, fontSize: 14 }}>{s.title}</p>
                    <p style={{ margin: 0, color: C.muted, fontSize: 13 }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 28 }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700 }}>Recent Transactions</h3>
            {txHistory.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '28px 0' }}>
                <div style={{ width: 48, height: 48, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 22 }}>📋</div>
                <p style={{ color: '#fff', fontSize: 14, fontWeight: 600, margin: '0 0 4px' }}>No transactions yet</p>
                <p style={{ color: C.muted, fontSize: 13, margin: 0 }}>Complete your first Buy or Sell to see history here.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {txHistory.map((tx, i) => (
                  <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < txHistory.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, background: tx.type === 'buy' ? 'rgba(34,197,94,0.1)' : 'rgba(99,102,241,0.1)', border: `1px solid ${tx.type === 'buy' ? 'rgba(34,197,94,0.2)' : 'rgba(99,102,241,0.2)'}`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                        {tx.type === 'buy' ? '↓' : '↑'}
                      </div>
                      <div>
                        <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 600 }}>{tx.type === 'buy' ? 'Bought USDC' : 'Sold USDC'}</p>
                        <p style={{ margin: 0, fontSize: 12, color: C.muted }}>{new Date(tx.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: '0 0 2px', fontSize: 14, fontWeight: 600, color: tx.type === 'buy' ? C.green : C.purpleLight }}>{tx.type === 'buy' ? '+' : '-'}{tx.amount} {tx.currency}</p>
                      <span style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 4, padding: '1px 7px', fontSize: 11, color: C.green }}>{tx.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {['Powered by Circle USDC', 'Built on Arc Testnet', 'Non-custodial', 'Open Source'].map(b => (
              <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.muted, fontSize: 13 }}>
                <span style={{ color: C.green }}>✓</span> {b}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT CARD */}
        <div style={{ position: 'sticky', top: 84 }}>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.border}`, borderRadius: 24, overflow: 'hidden', boxShadow: '0 32px 64px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}` }}>
              {['onramp', 'offramp'].map(t => (
                <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '18px', border: 'none', background: tab === t ? 'rgba(99,102,241,0.08)' : 'transparent', color: tab === t ? '#fff' : C.muted, fontSize: 15, fontWeight: tab === t ? 700 : 400, cursor: 'pointer', borderBottom: tab === t ? '2px solid #6366f1' : '2px solid transparent', transition: 'all 0.2s' }}>
                  {t === 'onramp' ? 'Buy USDC' : 'Sell USDC'}
                </button>
              ))}
            </div>

            <div style={{ padding: 28 }}>

              {/* ON-RAMP */}
              {tab === 'onramp' && (
                <>
                  {onStatus !== 'success' && <StepBar step={onStep} total={3}/>}

                  {onStep === 1 && !onStatus && (
                    <>
                      <p style={{ color: C.muted, fontSize: 12, fontWeight: 600, marginBottom: 8, letterSpacing: '0.05em' }}>YOU PAY</p>
                      <div style={{ position: 'relative', marginBottom: 12 }}>
                        <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: C.muted, fontSize: 22 }}>€</span>
                        <input
                          type="number"
                          placeholder="0.00"
                          value={onAmount}
                          onChange={e => handleOnAmount(e.target.value)}
                          min="0"
                          style={{ ...inp, paddingLeft: 42, paddingRight: 60, fontSize: 28, fontWeight: 800, marginBottom: 0 }}
                        />
                        <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: C.muted, fontSize: 14, fontWeight: 600 }}>EUR</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                        {['10', '50', '100', '500'].map(v => (
                          <button key={v} onClick={() => setOnAmount(v)} style={{ flex: 1, padding: '9px', background: onAmount === v ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${onAmount === v ? 'rgba(99,102,241,0.5)' : C.border}`, borderRadius: 10, color: onAmount === v ? C.purpleLight : C.muted, fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>€{v}</button>
                        ))}
                      </div>
                      {onAmount && parseFloat(onAmount) > 0 && (
                        <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 14, padding: 18, marginBottom: 16, border: `1px solid ${C.border}` }}>
                          <div style={row}><span style={{ color: C.muted, fontSize: 13 }}>Rate</span><span style={{ color: '#fff', fontSize: 13 }}>1 EUR = {eurRate.toFixed(4)} USDC</span></div>
                          <div style={row}><span style={{ color: C.muted, fontSize: 13 }}>Fee (0.5%)</span><span style={{ color: '#fff', fontSize: 13 }}>€{onFeeAmt}</span></div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 14 }}>
                            <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>You receive</span>
                            <span style={{ color: C.purpleLight, fontWeight: 800, fontSize: 18 }}>{onReceive} USDC</span>
                          </div>
                        </div>
                      )}
                      {onAmount && parseFloat(onAmount) > 0 && parseFloat(onAmount) < 10 && (
                        <p style={{ color: C.red, fontSize: 12, margin: '-4px 0 12px' }}>Minimum amount is €10</p>
                      )}
                      <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 12, padding: '10px 14px', marginBottom: 16 }}>
                        <p style={{ color: C.muted, fontSize: 12, margin: 0 }}>ℹ Min: €10 · Max: €10,000 per transaction</p>
                      </div>
                      <button onClick={startOnRamp} disabled={!onAmountValid || !wallet}
                        style={{ ...btnPrimary, opacity: onAmountValid && wallet ? 1 : 0.4 }}>
                        Continue to Payment →
                      </button>
                      {!wallet && <p style={{ color: C.muted, fontSize: 12, textAlign: 'center', marginTop: 10 }}>Connect your wallet to continue</p>}
                    </>
                  )}

                  {onStep === 2 && (
                    <>
                      <button onClick={() => setOnStep(1)} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 13, padding: '0 0 16px', display: 'flex', alignItems: 'center', gap: 6 }}>← Back</button>
                      <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 700 }}>Bank Transfer Instructions</h3>
                      <p style={{ color: C.muted, fontSize: 13, margin: '0 0 20px' }}>Transfer exactly <strong style={{ color: '#fff' }}>€{onAmount} EUR</strong> to the account below.</p>
                      <div style={{ background: 'rgba(234,179,8,0.07)', border: '1px solid rgba(234,179,8,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: 20 }}>
                        <p style={{ color: C.yellow, fontSize: 13, fontWeight: 600, margin: '0 0 4px' }}>⚠ Important</p>
                        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, margin: 0 }}>Always include the reference code. Transfers without reference cannot be matched.</p>
                      </div>
                      <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 14, padding: 16, marginBottom: 20 }}>
                        {[['Bank', PLATFORM_BANK], ['IBAN', PLATFORM_IBAN], ['BIC/SWIFT', PLATFORM_BIC], ['Amount', `€${onAmount} EUR`], ['Reference', onRef]].map(([k, v]) => (
                          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
                            <span style={{ color: C.muted, fontSize: 13 }}>{k}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ color: k === 'Reference' ? C.purpleLight : '#fff', fontSize: 13, fontWeight: k === 'Reference' ? 700 : 400 }}>{v}</span>
                              <CopyBtn text={v}/>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button onClick={confirmSent} style={btnPrimary}>I Have Sent the Transfer</button>
                      <button onClick={() => setOnStep(1)} style={btnGhost}>Cancel</button>
                    </>
                  )}

                  {onStep === 3 && onStatus === 'pending' && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ width: 64, height: 64, background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.25)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 28 }}>⏳</div>
                      <h3 style={{ margin: '0 0 8px', color: C.yellow }}>Waiting for Payment</h3>
                      <p style={{ color: C.muted, fontSize: 14, margin: '0 0 24px', lineHeight: 1.6 }}>We're monitoring incoming transfers. Payments typically arrive within 1-2 business days.</p>
                      <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 14, padding: 16, marginBottom: 24, textAlign: 'left' }}>
                        <div style={row}><span style={{ color: C.muted, fontSize: 13 }}>Expected</span><span style={{ color: '#fff', fontSize: 13 }}>€{onAmount} EUR</span></div>
                        <div style={row}><span style={{ color: C.muted, fontSize: 13 }}>You'll receive</span><span style={{ color: C.purpleLight, fontWeight: 700, fontSize: 13 }}>{onReceive} USDC</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10 }}><span style={{ color: C.muted, fontSize: 13 }}>Reference</span><span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{onRef}</span></div>
                      </div>
                      <div style={{ background: 'rgba(99,102,241,0.07)', border: `1px solid rgba(99,102,241,0.2)`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
                        <p style={{ color: C.muted, fontSize: 12, margin: '0 0 10px' }}>Demo mode — simulate payment confirmation</p>
                        {onCountdown > 0 ? (
                          <div>
                            <p style={{ color: C.purpleLight, fontSize: 28, fontWeight: 800, margin: 0 }}>{onCountdown}s</p>
                            <p style={{ color: C.muted, fontSize: 12, margin: '4px 0 0' }}>until simulation available</p>
                          </div>
                        ) : (
                          <button onClick={simulateReceived} disabled={onLoading} style={{ ...btnPrimary, marginTop: 0 }}>
                            {onLoading ? 'Processing...' : '⚡ Simulate Payment Received'}
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {onStatus === 'success' && (
                    <div style={{ textAlign: 'center', padding: '10px 0' }}>
                      <div style={{ width: 72, height: 72, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 32 }}>✓</div>
                      <h2 style={{ margin: '0 0 6px', fontSize: 22, color: C.green }}>{onReceive} USDC</h2>
                      <p style={{ color: C.muted, fontSize: 14, margin: '0 0 24px' }}>Successfully received in your wallet</p>
                      <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 14, padding: 16, marginBottom: 20, textAlign: 'left' }}>
                        <div style={row}><span style={{ color: C.muted, fontSize: 13 }}>EUR paid</span><span style={{ color: '#fff', fontSize: 13 }}>€{onAmount}</span></div>
                        <div style={row}><span style={{ color: C.muted, fontSize: 13 }}>USDC received</span><span style={{ color: C.green, fontWeight: 700, fontSize: 13 }}>{onReceive} USDC</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10 }}><span style={{ color: C.muted, fontSize: 13 }}>Wallet</span><span style={{ color: '#fff', fontSize: 13 }}>{wallet?.slice(0,6)}...{wallet?.slice(-4)}</span></div>
                      </div>
                      <button onClick={resetOn} style={btnPrimary}>New Transaction</button>
                    </div>
                  )}
                </>
              )}

              {/* OFF-RAMP */}
              {tab === 'offramp' && (
                <>
                  {offStatus !== 'success' && <StepBar step={offStep} total={3}/>}

                  {offStep === 1 && !offStatus && (
                    <>
                      <p style={{ color: C.muted, fontSize: 12, fontWeight: 600, marginBottom: 8, letterSpacing: '0.05em' }}>YOU SELL</p>
                      <div style={{ position: 'relative', marginBottom: 12 }}>
                        <input
                          type="number"
                          placeholder="0.00"
                          value={offAmount}
                          onChange={e => handleOffAmount(e.target.value)}
                          min="0"
                          style={{ ...inp, paddingRight: 80, fontSize: 28, fontWeight: 800, marginBottom: 0 }}
                        />
                        <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: C.muted, fontSize: 14, fontWeight: 600 }}>USDC</span>
                      </div>
                      {wallet && (
                        <p style={{ color: C.muted, fontSize: 12, margin: '-6px 0 12px' }}>
                          Available: <span style={{ color: '#fff', fontWeight: 600 }}>{parseFloat(balance).toFixed(2)} USDC</span>
                          <button onClick={() => setOffAmount(parseFloat(balance).toFixed(6))} style={{ background: 'none', border: 'none', color: C.purpleLight, fontSize: 12, cursor: 'pointer', marginLeft: 8 }}>Max</button>
                        </p>
                      )}
                      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                        {['1', '5', '10'].map(v => {
                          const disabled = parseFloat(balance) < parseFloat(v);
                          return (
                            <button key={v} onClick={() => !disabled && setOffAmount(v)}
                              style={{ flex: 1, padding: '9px', background: offAmount === v ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${offAmount === v ? 'rgba(99,102,241,0.5)' : C.border}`, borderRadius: 10, color: disabled ? 'rgba(255,255,255,0.2)' : offAmount === v ? C.purpleLight : C.muted, fontSize: 13, cursor: disabled ? 'not-allowed' : 'pointer', fontWeight: 500, opacity: disabled ? 0.4 : 1 }}>{v} USDC</button>
                          );
                        })}
                      </div>
                      {offAmount && parseFloat(offAmount) > 0 && (
                        <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 14, padding: 18, marginBottom: 16, border: `1px solid ${C.border}` }}>
                          <div style={row}><span style={{ color: C.muted, fontSize: 13 }}>Rate</span><span style={{ color: '#fff', fontSize: 13 }}>1 USDC = €{USDC_TO_EUR.toFixed(4)}</span></div>
                          <div style={row}><span style={{ color: C.muted, fontSize: 13 }}>Fee (0.5%)</span><span style={{ color: '#fff', fontSize: 13 }}>{offFeeAmt} USDC</span></div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 14 }}>
                            <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>You receive</span>
                            <span style={{ color: C.purpleLight, fontWeight: 800, fontSize: 18 }}>€{offReceive} EUR</span>
                          </div>
                        </div>
                      )}
                      {offAmount && parseFloat(offAmount) > parseFloat(balance) && (
                        <p style={{ color: C.red, fontSize: 12, margin: '-4px 0 12px' }}>Insufficient balance. You have {parseFloat(balance).toFixed(2)} USDC.</p>
                      )}
                      <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 12, padding: '10px 14px', marginBottom: 16 }}>
                        <p style={{ color: C.muted, fontSize: 12, margin: 0 }}>ℹ Min: 1 USDC · Max: 10,000 USDC per transaction</p>
                      </div>
                      <button onClick={() => offAmountValid && wallet && setOffStep(2)} disabled={!offAmountValid || !wallet}
                        style={{ ...btnPrimary, opacity: offAmountValid && wallet ? 1 : 0.4 }}>
                        Continue →
                      </button>
                      {!wallet && <p style={{ color: C.muted, fontSize: 12, textAlign: 'center', marginTop: 10 }}>Connect your wallet to continue</p>}
                    </>
                  )}

                  {offStep === 2 && !offStatus && (
                    <>
                      <button onClick={() => setOffStep(1)} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 13, padding: '0 0 16px', display: 'flex', alignItems: 'center', gap: 6 }}>← Back</button>
                      <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 700 }}>Your Bank Details</h3>
                      <p style={{ color: C.muted, fontSize: 13, margin: '0 0 20px' }}>EUR will be sent to this account within 1-2 business days.</p>
                      <p style={{ color: C.muted, fontSize: 12, fontWeight: 600, marginBottom: 6, letterSpacing: '0.05em' }}>ACCOUNT HOLDER NAME</p>
                      <input placeholder="John Doe" value={offName} onChange={e => setOffName(e.target.value)} style={inp}/>
                      <p style={{ color: C.muted, fontSize: 12, fontWeight: 600, marginBottom: 6, letterSpacing: '0.05em' }}>IBAN (EUR account)</p>
                      <input placeholder="DE89 3704 0044 0532 0130 00" value={offIban} onChange={e => setOffIban(e.target.value)}
                        style={{ ...inp, borderColor: offIban && !validateIBAN(offIban) ? 'rgba(239,68,68,0.5)' : C.border }}/>
                      {offIban && !validateIBAN(offIban) && (
                        <p style={{ color: C.red, fontSize: 12, margin: '-10px 0 10px' }}>Please enter a valid IBAN</p>
                      )}
                      <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: 8 }}>
                        <p style={{ color: C.muted, fontSize: 12, margin: '0 0 4px' }}>Summary</p>
                        <p style={{ color: '#fff', fontSize: 16, fontWeight: 700, margin: '0 0 2px' }}>Sell {offAmount} USDC → €{offReceive} EUR</p>
                        <p style={{ color: C.muted, fontSize: 12, margin: 0 }}>Estimated arrival: {arrivalDate}</p>
                      </div>
                      <button onClick={() => offName && offIban && validateIBAN(offIban) && setOffStep(3)}
                        style={{ ...btnPrimary, opacity: offName && offIban && validateIBAN(offIban) ? 1 : 0.4 }}>
                        Review & Confirm →
                      </button>
                    </>
                  )}

                  {offStep === 3 && !offStatus && (
                    <>
                      <button onClick={() => setOffStep(2)} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', fontSize: 13, padding: '0 0 16px', display: 'flex', alignItems: 'center', gap: 6 }}>← Back</button>
                      <h3 style={{ margin: '0 0 20px', fontSize: 17, fontWeight: 700 }}>Confirm Sale</h3>
                      {[['You send', `${offAmount} USDC`], ['You receive', `€${offReceive} EUR`], ['Fee', `${offFeeAmt} USDC`], ['Account holder', offName], ['IBAN', offIban.slice(0,8)+'...'+offIban.slice(-4)], ['Arrival', arrivalDate]].map(([k, v]) => (
                        <div key={k} style={row}><span style={{ color: C.muted, fontSize: 13 }}>{k}</span><span style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>{v}</span></div>
                      ))}
                      <div style={{ background: 'rgba(234,179,8,0.07)', border: '1px solid rgba(234,179,8,0.2)', borderRadius: 12, padding: '12px 16px', marginTop: 16, marginBottom: 8 }}>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: 0 }}>By confirming, {offAmount} USDC will be sent from your wallet. EUR arrives within 1-2 business days.</p>
                      </div>
                      <button onClick={executeOffRamp} disabled={offLoading} style={{ ...btnPrimary, opacity: offLoading ? 0.5 : 1 }}>
                        {offLoading ? 'Processing...' : 'Confirm & Sell USDC'}
                      </button>
                    </>
                  )}

                  {offStatus === 'pending' && (
                    <div style={{ textAlign: 'center', padding: 20 }}>
                      <p style={{ color: C.yellow, fontSize: 15 }}>⏳ Confirming on Arc Testnet...</p>
                    </div>
                  )}

                  {offStatus === 'success' && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ width: 72, height: 72, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 32 }}>✓</div>
                      <h2 style={{ margin: '0 0 6px', fontSize: 22, color: C.green }}>€{offReceive} EUR</h2>
                      <p style={{ color: C.muted, fontSize: 14, margin: '0 0 24px' }}>On its way to your bank account</p>
                      <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 14, padding: 16, marginBottom: 20, textAlign: 'left' }}>
                        <div style={row}><span style={{ color: C.muted, fontSize: 13 }}>USDC sold</span><span style={{ color: '#fff', fontSize: 13 }}>{offAmount} USDC</span></div>
                        <div style={row}><span style={{ color: C.muted, fontSize: 13 }}>EUR incoming</span><span style={{ color: C.green, fontWeight: 700, fontSize: 13 }}>€{offReceive}</span></div>
                        <div style={row}><span style={{ color: C.muted, fontSize: 13 }}>IBAN</span><span style={{ color: '#fff', fontSize: 13 }}>{offIban.slice(0,8)}...{offIban.slice(-4)}</span></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10 }}><span style={{ color: C.muted, fontSize: 13 }}>Estimated arrival</span><span style={{ color: '#fff', fontSize: 13 }}>{arrivalDate}</span></div>
                      </div>
                      {offTxHash && <a href={`https://testnet.arcscan.app/tx/${offTxHash}`} target="_blank" rel="noreferrer" style={{ color: C.purpleLight, fontSize: 13, display: 'block', marginBottom: 16 }}>View on ArcScan →</a>}
                      <button onClick={resetOff} style={btnPrimary}>New Transaction</button>
                    </div>
                  )}

                  {offStatus === 'error' && (
                    <div style={{ textAlign: 'center', padding: 20 }}>
                      <p style={{ color: C.red, fontSize: 14, marginBottom: 16 }}>Transaction failed. Please try again.</p>
                      <button onClick={() => setOffStatus('')} style={btnGhost}>Try Again</button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer style={{ borderTop: `1px solid ${C.border}`, padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Logo size={20}/>
          <span style={{ color: C.muted, fontSize: 13 }}>ArcGate — Built on Arc Testnet</span>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          <a href="https://arc.network" target="_blank" rel="noreferrer" style={{ color: C.muted, fontSize: 13, textDecoration: 'none' }}>Arc Network</a>
          <a href="https://developers.circle.com" target="_blank" rel="noreferrer" style={{ color: C.muted, fontSize: 13, textDecoration: 'none' }}>Circle Docs</a>
          <a href="https://testnet.arcscan.app" target="_blank" rel="noreferrer" style={{ color: C.muted, fontSize: 13, textDecoration: 'none' }}>ArcScan</a>
        </div>
      </footer>
    </div>
  );
}