import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// index.html <head> içine ekle:
// <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@300;900&family=Manrope:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

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

const S = {
  bg: '#f8f8f6', white: '#ffffff', border: '#e8e8e8', borderLight: '#f0f0f0',
  text: '#111', muted: '#999', mutedLight: '#bbb',
  green: '#16a34a', greenBg: '#f0fdf4', greenBorder: 'rgba(22,163,74,0.2)',
  red: '#dc2626', yellow: '#d97706',
  mono: "'DM Mono', monospace", sans: "'Manrope', sans-serif", logo: "'Nunito', sans-serif",
};

function Logo() {
  return (
    <svg width="118" height="22" viewBox="0 0 118 22" fill="none">
      <path d="M1 19.5 L8.5 2.5 L16 19.5" stroke={S.text} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"/>
      <text x="15" y="19" fontFamily={S.logo} fontSize="18" fontWeight="900" fill={S.text} letterSpacing="-0.5">rc</text>
      <text x="39" y="19" fontFamily={S.logo} fontSize="18" fontWeight="300" fill={S.text} letterSpacing="-0.3"> Gate</text>
    </svg>
  );
}

function NetDot({ color = S.green }) {
  return <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0, animation: 'agblink 2.5s ease-in-out infinite' }}/>;
}

function StepBar({ step, total }) {
  return (
    <div style={{ display: 'flex', gap: 5, marginBottom: 22 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ flex: 1, height: 2.5, borderRadius: 99, background: i < step ? S.text : S.border, transition: 'background 0.3s' }}/>
      ))}
    </div>
  );
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      style={{ background: copied ? S.greenBg : S.bg, border: `1px solid ${copied ? S.greenBorder : S.border}`, borderRadius: 6, color: copied ? S.green : S.muted, fontSize: 10, padding: '3px 8px', cursor: 'pointer', fontFamily: S.mono, transition: 'all 0.2s' }}>
      {copied ? '✓ Copied' : 'Copy'}
    </button>
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
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { background: ${S.bg}; font-family: ${S.sans}; }
      input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
      input[type=number] { -moz-appearance: textfield; }
      @keyframes agblink { 0%,100%{opacity:1;} 50%{opacity:0.25;} }
      a { text-decoration: none; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    function fetchRate() {
      fetch('https://api.coingecko.com/api/v3/simple/price?ids=usd-coin&vs_currencies=eur')
        .then(r => r.json())
        .then(d => { if (d['usd-coin']?.eur) setEurRate(1 / d['usd-coin'].eur); })
        .catch(() => {})
        .finally(() => setRateLoading(false));
    }
    fetchRate();
    const interval = setInterval(fetchRate, 30000);
    fetch(RPC_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_blockNumber', params: [], id: 1 }) })
      .then(r => r.json()).then(() => setNetworkStatus('online')).catch(() => setNetworkStatus('offline'));
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (onCountdown === null || onCountdown <= 0) return;
    const t = setTimeout(() => setOnCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [onCountdown]);

  function addHistory(type, amount, currency, walletAddr) {
    const addr = walletAddr || wallet;
    if (!addr) return;
    const key = 'arcgate_history_' + addr;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const entry = { id: Date.now(), type, amount, currency, status: 'completed', date: new Date().toISOString() };
    const updated = [entry, ...existing].slice(0, 10);
    setTxHistory(updated);
    localStorage.setItem(key, JSON.stringify(updated));
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
    const key = 'arcgate_history_' + address;
    const saved = localStorage.getItem(key);
    setTxHistory(saved ? JSON.parse(saved) : []);
  }

  function disconnectWallet() { setWallet(null); setBalance('0'); setTxHistory([]); }

  async function refreshBalance(address) {
    const rp = new ethers.JsonRpcProvider(RPC_URL);
    const usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, rp);
    const bal = await usdc.balanceOf(address);
    setBalance(ethers.formatUnits(bal, 6));
  }

  function handleOnAmount(val) { if (val === '' || parseFloat(val) >= 0) setOnAmount(val); }
  function handleOffAmount(val) { if (val === '' || (parseFloat(val) >= 0 && parseFloat(val) <= parseFloat(balance))) setOffAmount(val); }
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
    } catch (e) { setOffStatus('error'); }
    setOffLoading(false);
  }

  function resetOn() { setOnStep(1); setOnAmount(''); setOnRef(''); setOnStatus(''); setOnCountdown(null); }
  function resetOff() { setOffStep(1); setOffAmount(''); setOffIban(''); setOffName(''); setOffStatus(''); setOffTxHash(''); }

  const netColor = networkStatus === 'online' ? S.green : networkStatus === 'offline' ? S.red : S.yellow;

  // Shared styles
  const inp = { width: '100%', padding: '11px 14px', background: S.bg, border: `1.5px solid ${S.border}`, borderRadius: 10, fontSize: 14, color: S.text, outline: 'none', fontFamily: S.sans, marginBottom: 12 };
  const btnPrimary = (disabled) => ({ width: '100%', padding: '13px', background: S.text, color: S.white, border: 'none', borderRadius: 11, fontSize: 13, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: S.sans, marginTop: 14, opacity: disabled ? 0.4 : 1 });
  const btnGhost = { width: '100%', padding: '12px', background: 'transparent', color: S.muted, border: `1px solid ${S.border}`, borderRadius: 11, fontSize: 13, cursor: 'pointer', fontFamily: S.sans, marginTop: 8 };
  const drow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: `1px solid ${S.borderLight}`, fontSize: 13 };
  const feeBox = { background: S.bg, border: `1.5px solid ${S.border}`, borderRadius: 10, padding: '10px 14px', marginBottom: 14 };

  const onRampSteps = [
    ['Connect wallet', 'Link MetaMask to Arc Testnet'],
    ['Enter EUR amount', 'Choose how much EUR to spend'],
    ['Send bank transfer', 'Transfer to our Circle Payments IBAN'],
    ['Receive USDC', 'Automatically released to your wallet'],
  ];
  const offRampSteps = [
    ['Connect wallet', 'Link MetaMask to Arc Testnet'],
    ['Enter USDC amount', 'Choose how much USDC to sell'],
    ['Enter your IBAN', 'Provide your EUR bank account details'],
    ['Receive EUR', 'Arrives in your bank within 1-2 business days'],
  ];

  return (
    <div style={{ minHeight: '100vh', background: S.bg, color: S.text, fontFamily: S.sans }}>

      {/* NAVBAR */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: 60, background: S.white, borderBottom: `1px solid ${S.border}`, position: 'sticky', top: 0, zIndex: 100 }}>
        <Logo />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <NetDot color={netColor} />
          <span style={{ fontFamily: S.mono, fontSize: 10.5, color: S.muted }}>
            Arc Testnet · {networkStatus === 'online' ? 'Live' : networkStatus === 'offline' ? 'Offline' : 'Checking…'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontFamily: S.mono, fontSize: 10.5, color: S.mutedLight, background: '#f5f5f5', border: `1px solid ${S.border}`, borderRadius: 7, padding: '5px 10px' }}>
            {rateLoading ? '…' : `1 EUR = ${eurRate.toFixed(4)} USDC`}
          </div>
          {wallet ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#f5f5f5', border: `1px solid ${S.border}`, borderRadius: 9, padding: '6px 12px 6px 8px' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'conic-gradient(from 200deg,#111,#555,#111)' }}/>
                <span style={{ fontFamily: S.mono, fontSize: 10.5, color: '#888' }}>{wallet.slice(0,6)}…{wallet.slice(-4)}</span>
                <span style={{ fontFamily: S.mono, fontSize: 10.5, color: S.mutedLight }}>·</span>
                <span style={{ fontFamily: S.mono, fontSize: 10.5, fontWeight: 500 }}>{parseFloat(balance).toFixed(2)} USDC</span>
              </div>
              <button onClick={disconnectWallet} style={{ background: '#fef2f2', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 8, padding: '6px 11px', color: S.red, fontSize: 12, cursor: 'pointer', fontFamily: S.sans }}>Disconnect</button>
            </>
          ) : (
            <button onClick={connectWallet} style={{ background: S.text, border: 'none', borderRadius: 9, padding: '8px 16px', color: S.white, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: S.sans }}>Connect wallet</button>
          )}
        </div>
      </nav>

      {/* BODY */}
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '40px 32px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 28, alignItems: 'start' }}>

        {/* LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Hero */}
          <div>
            <h1 style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.8px', lineHeight: 1.2, marginBottom: 10 }}>
              Buy & sell USDC<br/>
              <span style={{ fontWeight: 300, color: S.muted }}>instantly on Arc Testnet</span>
            </h1>
            <p style={{ fontSize: 14, color: S.muted, lineHeight: 1.7 }}>EUR bank transfer → USDC on Arc Network. Sub-second settlement. Non-custodial. Open source.</p>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {[
              ['Rate', rateLoading ? '…' : `1 EUR = ${eurRate.toFixed(4)} USDC`, 'Updates every 30s'],
              ['Settlement', '< 0.5s', 'Arc Testnet finality'],
              ['Fee', '0.5%', 'Per transaction'],
            ].map(([label, val, sub]) => (
              <div key={label} style={{ background: S.white, border: `1px solid ${S.border}`, borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ fontFamily: S.mono, fontSize: 9, color: S.mutedLight, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
                <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.3px', marginBottom: 3 }}>{val}</div>
                <div style={{ fontFamily: S.mono, fontSize: 10, color: S.mutedLight }}>{sub}</div>
              </div>
            ))}
          </div>

          {/* How it works */}
          <div style={{ background: S.white, border: `1px solid ${S.border}`, borderRadius: 14, padding: '22px 24px' }}>
            <div style={{ fontFamily: S.mono, fontSize: 9.5, color: S.mutedLight, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 16 }}>
              How it works — {tab === 'onramp' ? 'EUR → USDC' : 'USDC → EUR'}
            </div>
            {(tab === 'onramp' ? onRampSteps : offRampSteps).map(([title, desc], i, arr) => (
              <div key={i} style={{ display: 'flex', gap: 14, padding: '11px 0', borderBottom: i < arr.length - 1 ? `1px solid ${S.borderLight}` : 'none' }}>
                <div style={{ width: 26, height: 26, background: S.bg, border: `1px solid ${S.border}`, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: S.mono, fontSize: 11, color: S.muted, flexShrink: 0 }}>{i + 1}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{title}</div>
                  <div style={{ fontSize: 12, color: S.muted }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* History */}
          <div style={{ background: S.white, border: `1px solid ${S.border}`, borderRadius: 14, padding: '22px 24px' }}>
            <div style={{ fontFamily: S.mono, fontSize: 9.5, color: S.mutedLight, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 16 }}>Recent activity</div>
            {!wallet ? (
              <p style={{ fontSize: 13, color: S.mutedLight }}>Connect your wallet to see transaction history.</p>
            ) : txHistory.length === 0 ? (
              <p style={{ fontSize: 13, color: S.mutedLight }}>No transactions yet.</p>
            ) : txHistory.map((tx, i) => (
              <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < txHistory.length - 1 ? `1px solid ${S.borderLight}` : 'none' }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: tx.type === 'buy' ? S.greenBg : '#faf5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{tx.type === 'buy' ? '↓' : '↑'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{tx.type === 'buy' ? 'Bought USDC' : 'Sold USDC'}</div>
                  <div style={{ fontFamily: S.mono, fontSize: 10, color: S.mutedLight, marginTop: 1 }}>{new Date(tx.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: S.mono, fontSize: 12, fontWeight: 500, color: tx.type === 'buy' ? S.green : '#7c3aed' }}>{tx.type === 'buy' ? '+' : '-'}{tx.amount} {tx.currency}</div>
                  <div style={{ fontFamily: S.mono, fontSize: 10, color: S.green, marginTop: 2 }}>confirmed</div>
                </div>
              </div>
            ))}
          </div>

          {/* Badges */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {['Powered by Circle USDC', 'Built on Arc Testnet', 'Non-custodial', 'Open Source'].map(b => (
              <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: S.muted }}><span style={{ color: S.green }}>✓</span>{b}</div>
            ))}
          </div>
        </div>

        {/* RIGHT — Trade panel */}
        <div style={{ position: 'sticky', top: 76 }}>
          <div style={{ background: S.white, border: `1px solid ${S.border}`, borderRadius: 18, overflow: 'hidden' }}>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: `1px solid ${S.border}` }}>
              {[['onramp', 'Buy USDC'], ['offramp', 'Sell USDC']].map(([t, label]) => (
                <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '15px 0', border: 'none', background: tab === t ? S.white : S.bg, color: tab === t ? S.text : S.muted, fontSize: 13, fontWeight: tab === t ? 600 : 400, cursor: 'pointer', fontFamily: S.sans, borderBottom: tab === t ? `2px solid ${S.text}` : '2px solid transparent', transition: 'all 0.15s' }}>
                  {label}
                </button>
              ))}
            </div>

            <div style={{ padding: '22px 20px' }}>

              {/* ══ BUY (onramp) ══ */}
              {tab === 'onramp' && (
                <>
                  {onStatus !== 'success' && <StepBar step={onStep} total={3} />}

                  {onStep === 1 && !onStatus && (
                    <>
                      <div style={{ fontFamily: S.mono, fontSize: 9.5, color: S.mutedLight, letterSpacing: '1.6px', textTransform: 'uppercase', marginBottom: 8 }}>You pay</div>
                      <div style={{ background: S.bg, border: `1.5px solid ${S.border}`, borderRadius: 13, padding: '14px 16px', marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <input type="number" placeholder="0.00" value={onAmount} onChange={e => handleOnAmount(e.target.value)} style={{ background: 'none', border: 'none', outline: 'none', fontFamily: S.sans, fontSize: 28, fontWeight: 300, color: S.text, width: 160 }}/>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: S.white, border: `1px solid ${S.border}`, borderRadius: 20, padding: '6px 11px', fontSize: 12, fontWeight: 600 }}>
                            <span style={{ fontSize: 13, color: S.mutedLight }}>€</span> EUR <span style={{ opacity: 0.35, fontSize: 9 }}>▾</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: S.mono, fontSize: 10, color: S.mutedLight, marginTop: 7 }}>
                          <span>Bank · Card · Apple Pay</span><span>Min €10 · Max €10,000</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                        {['10', '50', '100', '500'].map(v => (
                          <button key={v} onClick={() => setOnAmount(v)} style={{ flex: 1, padding: '7px 0', fontSize: 11, fontFamily: S.mono, background: onAmount === v ? S.text : S.bg, color: onAmount === v ? S.white : S.muted, border: `1px solid ${onAmount === v ? S.text : S.border}`, borderRadius: 8, cursor: 'pointer' }}>€{v}</button>
                        ))}
                      </div>

                      <div style={{ fontFamily: S.mono, fontSize: 9.5, color: S.mutedLight, letterSpacing: '1.6px', textTransform: 'uppercase', marginBottom: 8 }}>You receive</div>
                      <div style={{ background: S.bg, border: `1.5px solid ${S.border}`, borderRadius: 13, padding: '14px 16px', marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ fontSize: 28, fontWeight: 300 }}>{onReceive}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: S.white, border: `1px solid ${S.border}`, borderRadius: 20, padding: '6px 11px', fontSize: 12, fontWeight: 600 }}>
                            <div style={{ width: 17, height: 17, borderRadius: '50%', background: '#2775ca', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 800, color: '#fff' }}>$</div>
                            USDC <span style={{ opacity: 0.35, fontSize: 9 }}>▾</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: S.mono, fontSize: 10, color: S.mutedLight, marginTop: 7 }}>
                          <span>Arc Testnet</span>
                        </div>
                      </div>

                      {onAmount && parseFloat(onAmount) > 0 && (
                        <div style={feeBox}>
                          {[['Rate', `1 EUR = ${eurRate.toFixed(4)} USDC`], ['Fee (0.5%)', `€${onFeeAmt}`]].map(([l, r]) => (
                            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: S.mono, fontSize: 10.5, color: S.mutedLight, padding: '4px 0', borderBottom: `1px solid ${S.borderLight}` }}><span>{l}</span><span>{r}</span></div>
                          ))}
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: S.mono, fontSize: 10.5, color: S.text, fontWeight: 600, paddingTop: 8 }}><span>Total received</span><span>{onReceive} USDC</span></div>
                        </div>
                      )}

                      {onAmount && parseFloat(onAmount) > 0 && parseFloat(onAmount) < 10 && (
                        <p style={{ fontFamily: S.mono, fontSize: 11, color: S.red, marginBottom: 10 }}>Minimum amount is €10</p>
                      )}
                      <button onClick={startOnRamp} disabled={!onAmountValid || !wallet} style={btnPrimary(!onAmountValid || !wallet)}>
                        {wallet ? 'Continue to payment →' : 'Connect wallet to continue'}
                      </button>
                    </>
                  )}

                  {onStep === 2 && (
                    <>
                      <button onClick={() => setOnStep(1)} style={{ background: 'none', border: 'none', color: S.muted, cursor: 'pointer', fontSize: 12, padding: '0 0 16px', fontFamily: S.sans }}>← Back</button>
                      <div style={{ fontFamily: S.mono, fontSize: 9.5, color: S.mutedLight, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 12 }}>Bank transfer details</div>
                      <p style={{ fontSize: 13, color: S.muted, marginBottom: 14 }}>Transfer exactly <strong style={{ color: S.text }}>€{onAmount} EUR</strong> to the account below.</p>
                      <div style={{ background: '#fffbeb', border: '1px solid rgba(217,119,6,0.25)', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
                        <p style={{ fontSize: 12, color: S.yellow }}>⚠ Always include the reference code. Transfers without reference cannot be matched.</p>
                      </div>
                      <div style={{ background: S.bg, border: `1px solid ${S.border}`, borderRadius: 12, padding: '4px 14px', marginBottom: 14 }}>
                        {[['Bank', PLATFORM_BANK], ['IBAN', PLATFORM_IBAN], ['BIC/SWIFT', PLATFORM_BIC], ['Amount', `€${onAmount} EUR`], ['Reference', onRef]].map(([k, v]) => (
                          <div key={k} style={{ ...drow, borderBottomColor: S.borderLight }}>
                            <span style={{ color: S.muted }}>{k}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontWeight: k === 'Reference' ? 600 : 400, fontFamily: k === 'Reference' ? S.mono : S.sans, fontSize: 13 }}>{v}</span>
                              <CopyBtn text={v} />
                            </div>
                          </div>
                        ))}
                      </div>
                      <button onClick={confirmSent} style={btnPrimary(false)}>I've sent the transfer</button>
                      <button onClick={() => setOnStep(1)} style={btnGhost}>Cancel</button>
                    </>
                  )}

                  {onStep === 3 && onStatus === 'pending' && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ width: 56, height: 56, background: '#fffbeb', border: '1px solid rgba(217,119,6,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 22 }}>⏳</div>
                      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Waiting for payment</div>
                      <p style={{ fontSize: 13, color: S.muted, marginBottom: 18, lineHeight: 1.6 }}>We're monitoring incoming transfers. Once your EUR payment arrives, USDC will be released to your wallet.</p>
                      <div style={{ background: S.bg, border: `1px solid ${S.border}`, borderRadius: 12, padding: '4px 14px', marginBottom: 16, textAlign: 'left' }}>
                        <div style={drow}><span style={{ color: S.muted }}>Expected</span><span>€{onAmount} EUR</span></div>
                        <div style={drow}><span style={{ color: S.muted }}>You'll receive</span><span style={{ fontWeight: 600 }}>{onReceive} USDC</span></div>
                        <div style={{ ...drow, borderBottom: 'none' }}><span style={{ color: S.muted }}>Reference</span><span style={{ fontFamily: S.mono, fontSize: 12, fontWeight: 600 }}>{onRef}</span></div>
                      </div>
                      <div style={{ background: S.greenBg, border: `1px solid ${S.greenBorder}`, borderRadius: 12, padding: 16 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: S.green, marginBottom: 6 }}>✓ Transfer details received</p>
                        <p style={{ fontFamily: S.mono, fontSize: 11, color: S.green, lineHeight: 1.6 }}>Once your EUR payment arrives, USDC will be released to your wallet within 1-2 business days.</p>
                      </div>
                    </div>
                  )}

                  {onStatus === 'success' && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ width: 60, height: 60, background: S.greenBg, border: `1px solid ${S.greenBorder}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 24, color: S.green }}>✓</div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: S.green, marginBottom: 4 }}>{onReceive} USDC</div>
                      <p style={{ fontSize: 13, color: S.muted, marginBottom: 18 }}>Successfully received in your wallet</p>
                      <div style={{ background: S.bg, border: `1px solid ${S.border}`, borderRadius: 12, padding: '4px 14px', marginBottom: 16, textAlign: 'left' }}>
                        <div style={drow}><span style={{ color: S.muted }}>EUR paid</span><span>€{onAmount}</span></div>
                        <div style={drow}><span style={{ color: S.muted }}>USDC received</span><span style={{ fontWeight: 600, color: S.green }}>{onReceive} USDC</span></div>
                        <div style={{ ...drow, borderBottom: 'none' }}><span style={{ color: S.muted }}>Wallet</span><span style={{ fontFamily: S.mono, fontSize: 12 }}>{wallet?.slice(0,6)}…{wallet?.slice(-4)}</span></div>
                      </div>
                      <button onClick={resetOn} style={btnPrimary(false)}>New transaction</button>
                    </div>
                  )}
                </>
              )}

              {/* ══ SELL (offramp) ══ */}
              {tab === 'offramp' && (
                <>
                  {offStatus !== 'success' && <StepBar step={offStep} total={3} />}

                  {offStep === 1 && !offStatus && (
                    <>
                      <div style={{ fontFamily: S.mono, fontSize: 9.5, color: S.mutedLight, letterSpacing: '1.6px', textTransform: 'uppercase', marginBottom: 8 }}>You sell</div>
                      <div style={{ background: S.bg, border: `1.5px solid ${S.border}`, borderRadius: 13, padding: '14px 16px', marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <input type="number" placeholder="0.00" value={offAmount} onChange={e => handleOffAmount(e.target.value)} style={{ background: 'none', border: 'none', outline: 'none', fontFamily: S.sans, fontSize: 28, fontWeight: 300, color: S.text, width: 160 }}/>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: S.white, border: `1px solid ${S.border}`, borderRadius: 20, padding: '6px 11px', fontSize: 12, fontWeight: 600 }}>
                            <div style={{ width: 17, height: 17, borderRadius: '50%', background: '#2775ca', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 800, color: '#fff' }}>$</div>
                            USDC <span style={{ opacity: 0.35, fontSize: 9 }}>▾</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: S.mono, fontSize: 10, color: S.mutedLight, marginTop: 7 }}>
                          <span>Arc Testnet</span>
                          {wallet && <span>Bal: {parseFloat(balance).toFixed(2)} USDC</span>}
                        </div>
                      </div>

                      {wallet && (
                        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                          {['1', '5', '10'].map(v => {
                            const disabled = parseFloat(balance) < parseFloat(v);
                            return <button key={v} onClick={() => !disabled && setOffAmount(v)} style={{ flex: 1, padding: '7px 0', fontSize: 11, fontFamily: S.mono, background: offAmount === v ? S.text : S.bg, color: offAmount === v ? S.white : disabled ? S.border : S.muted, border: `1px solid ${offAmount === v ? S.text : S.border}`, borderRadius: 8, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1 }}>{v} USDC</button>;
                          })}
                          <button onClick={() => setOffAmount(parseFloat(balance).toFixed(6))} style={{ flex: 1, padding: '7px 0', fontSize: 11, fontFamily: S.mono, background: S.bg, color: S.muted, border: `1px solid ${S.border}`, borderRadius: 8, cursor: 'pointer' }}>Max</button>
                        </div>
                      )}

                      <div style={{ fontFamily: S.mono, fontSize: 9.5, color: S.mutedLight, letterSpacing: '1.6px', textTransform: 'uppercase', marginBottom: 8 }}>You receive</div>
                      <div style={{ background: S.bg, border: `1.5px solid ${S.border}`, borderRadius: 13, padding: '14px 16px', marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ fontSize: 28, fontWeight: 300 }}>{offReceive}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: S.white, border: `1px solid ${S.border}`, borderRadius: 20, padding: '6px 11px', fontSize: 12, fontWeight: 600 }}>
                            <span style={{ fontSize: 13, color: S.mutedLight }}>€</span> EUR <span style={{ opacity: 0.35, fontSize: 9 }}>▾</span>
                          </div>
                        </div>
                        <div style={{ fontFamily: S.mono, fontSize: 10, color: S.mutedLight, marginTop: 7 }}>Bank transfer · 1-2 days</div>
                      </div>

                      {offAmount && parseFloat(offAmount) > 0 && (
                        <div style={feeBox}>
                          {[['Rate', `1 USDC = €${USDC_TO_EUR.toFixed(4)}`], ['Fee (0.5%)', `${offFeeAmt} USDC`]].map(([l, r]) => (
                            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: S.mono, fontSize: 10.5, color: S.mutedLight, padding: '4px 0', borderBottom: `1px solid ${S.borderLight}` }}><span>{l}</span><span>{r}</span></div>
                          ))}
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: S.mono, fontSize: 10.5, color: S.text, fontWeight: 600, paddingTop: 8 }}><span>Total received</span><span>€{offReceive} EUR</span></div>
                        </div>
                      )}

                      {offAmount && parseFloat(offAmount) > parseFloat(balance) && (
                        <p style={{ fontFamily: S.mono, fontSize: 11, color: S.red, marginBottom: 10 }}>Insufficient balance ({parseFloat(balance).toFixed(2)} USDC available)</p>
                      )}
                      <button onClick={() => offAmountValid && wallet && setOffStep(2)} disabled={!offAmountValid || !wallet} style={btnPrimary(!offAmountValid || !wallet)}>
                        {wallet ? 'Continue →' : 'Connect wallet to continue'}
                      </button>
                    </>
                  )}

                  {offStep === 2 && !offStatus && (
                    <>
                      <button onClick={() => setOffStep(1)} style={{ background: 'none', border: 'none', color: S.muted, cursor: 'pointer', fontSize: 12, padding: '0 0 16px', fontFamily: S.sans }}>← Back</button>
                      <div style={{ fontFamily: S.mono, fontSize: 9.5, color: S.mutedLight, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 12 }}>Your bank details</div>
                      <p style={{ fontSize: 13, color: S.muted, marginBottom: 14 }}>EUR will be sent to this account within 1-2 business days.</p>
                      <div style={{ fontFamily: S.mono, fontSize: 9.5, color: S.mutedLight, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 6 }}>Account holder name</div>
                      <input placeholder="John Doe" value={offName} onChange={e => setOffName(e.target.value)} style={inp} />
                      <div style={{ fontFamily: S.mono, fontSize: 9.5, color: S.mutedLight, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 6 }}>IBAN (EUR account)</div>
                      <input placeholder="DE89 3704 0044 0532 0130 00" value={offIban} onChange={e => setOffIban(e.target.value)} style={{ ...inp, borderColor: offIban && !validateIBAN(offIban) ? 'rgba(220,38,38,0.5)' : S.border }} />
                      {offIban && !validateIBAN(offIban) && <p style={{ fontFamily: S.mono, fontSize: 11, color: S.red, marginTop: -8, marginBottom: 10 }}>Please enter a valid IBAN</p>}
                      <div style={{ background: S.bg, border: `1px solid ${S.border}`, borderRadius: 10, padding: '12px 14px', marginBottom: 4 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>Sell {offAmount} USDC → €{offReceive} EUR</div>
                        <div style={{ fontFamily: S.mono, fontSize: 11, color: S.mutedLight }}>Estimated arrival: {arrivalDate}</div>
                      </div>
                      <button onClick={() => offName && offIban && validateIBAN(offIban) && setOffStep(3)} style={btnPrimary(!(offName && offIban && validateIBAN(offIban)))}>Review & confirm →</button>
                    </>
                  )}

                  {offStep === 3 && !offStatus && (
                    <>
                      <button onClick={() => setOffStep(2)} style={{ background: 'none', border: 'none', color: S.muted, cursor: 'pointer', fontSize: 12, padding: '0 0 16px', fontFamily: S.sans }}>← Back</button>
                      <div style={{ fontFamily: S.mono, fontSize: 9.5, color: S.mutedLight, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 14 }}>Confirm sale</div>
                      <div style={{ background: S.bg, border: `1px solid ${S.border}`, borderRadius: 12, padding: '4px 14px', marginBottom: 14 }}>
                        {[['You send', `${offAmount} USDC`], ['You receive', `€${offReceive} EUR`], ['Fee', `${offFeeAmt} USDC`], ['Account holder', offName], ['IBAN', offIban.slice(0,8) + '…' + offIban.slice(-4)], ['Arrival', arrivalDate]].map(([k, v]) => (
                          <div key={k} style={{ ...drow, borderBottomColor: S.borderLight }}><span style={{ color: S.muted }}>{k}</span><span style={{ fontWeight: 500 }}>{v}</span></div>
                        ))}
                      </div>
                      <div style={{ background: '#fffbeb', border: '1px solid rgba(217,119,6,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 4 }}>
                        <p style={{ fontSize: 12, color: S.yellow }}>By confirming, {offAmount} USDC will leave your wallet immediately.</p>
                      </div>
                      <button onClick={executeOffRamp} disabled={offLoading} style={btnPrimary(offLoading)}>
                        {offLoading ? 'Processing…' : 'Confirm & sell USDC'}
                      </button>
                    </>
                  )}

                  {offStatus === 'pending' && <div style={{ textAlign: 'center', padding: 20 }}><p style={{ fontSize: 14, color: S.yellow }}>⏳ Confirming on Arc Testnet…</p></div>}

                  {offStatus === 'success' && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ width: 60, height: 60, background: S.greenBg, border: `1px solid ${S.greenBorder}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 24, color: S.green }}>✓</div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: S.green, marginBottom: 4 }}>€{offReceive} EUR</div>
                      <p style={{ fontSize: 13, color: S.muted, marginBottom: 18 }}>On its way to your bank account</p>
                      <div style={{ background: S.bg, border: `1px solid ${S.border}`, borderRadius: 12, padding: '4px 14px', marginBottom: 16, textAlign: 'left' }}>
                        <div style={drow}><span style={{ color: S.muted }}>USDC sold</span><span>{offAmount} USDC</span></div>
                        <div style={drow}><span style={{ color: S.muted }}>EUR incoming</span><span style={{ fontWeight: 600, color: S.green }}>€{offReceive}</span></div>
                        <div style={drow}><span style={{ color: S.muted }}>IBAN</span><span style={{ fontFamily: S.mono, fontSize: 12 }}>{offIban.slice(0,8)}…{offIban.slice(-4)}</span></div>
                        <div style={{ ...drow, borderBottom: 'none' }}><span style={{ color: S.muted }}>Est. arrival</span><span>{arrivalDate}</span></div>
                      </div>
                      {offTxHash && <a href={`https://testnet.arcscan.app/tx/${offTxHash}`} target="_blank" rel="noreferrer" style={{ fontFamily: S.mono, fontSize: 12, color: S.muted, display: 'block', marginBottom: 14 }}>View on ArcScan →</a>}
                      <button onClick={resetOff} style={btnPrimary(false)}>New transaction</button>
                    </div>
                  )}

                  {offStatus === 'error' && (
                    <div style={{ textAlign: 'center', padding: 16 }}>
                      <p style={{ fontSize: 13, color: S.red, marginBottom: 14 }}>Transaction failed. Please try again.</p>
                      <button onClick={() => setOffStatus('')} style={btnGhost}>Try again</button>
                    </div>
                  )}
                </>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${S.border}`, padding: '20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Logo />
          <span style={{ fontFamily: S.mono, fontSize: 11, color: S.mutedLight }}>Built on Arc Testnet</span>
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          {[['Arc Network', 'https://arc.network'], ['Circle Docs', 'https://developers.circle.com'], ['ArcScan', 'https://testnet.arcscan.app']].map(([label, href]) => (
            <a key={label} href={href} target="_blank" rel="noreferrer" style={{ fontFamily: S.mono, fontSize: 11, color: S.mutedLight }}>{label}</a>
          ))}
        </div>
      </footer>

    </div>
  );
}