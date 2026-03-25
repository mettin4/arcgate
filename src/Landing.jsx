export default function Landing({ onLaunch }) {
  const S = {
    bg: '#f8f8f6', white: '#ffffff', border: '#e8e8e8',
    text: '#111', muted: '#888', mutedLight: '#bbb',
    green: '#16a34a',
    mono: "'DM Mono', monospace", sans: "'Manrope', sans-serif", logo: "'Nunito', sans-serif",
  };

  // Same logo as App.jsx navbar — SVG ters-V A + rc + Gate
  function Logo() {
    return (
      <svg width="118" height="22" viewBox="0 0 118 22" fill="none">
        <path d="M1 19.5 L8.5 2.5 L16 19.5" stroke={S.text} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"/>
        <text x="15" y="19" fontFamily={S.logo} fontSize="18" fontWeight="900" fill={S.text} letterSpacing="-0.5">rc</text>
        <text x="39" y="19" fontFamily={S.logo} fontSize="18" fontWeight="300" fill={S.text} letterSpacing="-0.3"> Gate</text>
      </svg>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: S.bg, fontFamily: S.sans, color: S.text, display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes agblink{0%,100%{opacity:1;}50%{opacity:0.25;}}
        *{box-sizing:border-box;margin:0;padding:0;}
        a{text-decoration:none;}
      `}</style>

      {/* NAV — logo sol, linkler sağ */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px', height: 64, background: S.white, borderBottom: `1px solid ${S.border}` }}>
        <Logo />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: S.green, display: 'inline-block', animation: 'agblink 2.5s ease-in-out infinite' }}/>
          <span style={{ fontFamily: S.mono, fontSize: 10.5, color: S.muted }}>Arc Testnet · Live</span>
        </div>
        <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
          {[['Arc Network', 'https://arc.network'], ['Circle Docs', 'https://developers.circle.com'], ['ArcScan', 'https://testnet.arcscan.app']].map(([label, href]) => (
            <a key={label} href={href} target="_blank" rel="noreferrer" style={{ fontFamily: S.mono, fontSize: 11, color: S.mutedLight }}>{label}</a>
          ))}
          <button onClick={onLaunch} style={{ background: S.text, border: 'none', borderRadius: 9, padding: '8px 18px', color: S.white, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: S.sans }}>
            Launch App →
          </button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '56px 48px 0', textAlign: 'center', width: '100%' }}>

        {/* Status pill */}
        <div style={{ fontFamily: S.mono, fontSize: 10, color: S.muted, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 32, background: S.white, border: `1px solid ${S.border}`, borderRadius: 20, padding: '6px 18px', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: S.green, display: 'inline-block' }}/>
          Arc Testnet — Live
        </div>

        {/* Headline */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 62, fontWeight: 800, letterSpacing: '-3px', lineHeight: 1.08 }}>Your gateway between</div>
          <div style={{ fontSize: 62, fontWeight: 300, letterSpacing: '-2.5px', lineHeight: 1.08, color: S.muted }}>EUR and USDC.</div>
        </div>

        {/* Subtext */}
        <p style={{ fontSize: 16, color: S.muted, lineHeight: 1.75, maxWidth: 500, marginBottom: 36 }}>
          Buy USDC with a bank transfer or sell USDC straight back to EUR — non-custodial, on Arc Testnet.
        </p>

        {/* CTA */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 56 }}>
          <button onClick={onLaunch} style={{ background: S.text, border: 'none', borderRadius: 12, padding: '15px 40px', color: S.white, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: S.sans }}>
            Launch App →
          </button>
          <a href="https://community.arc.network/home/forum/boards/ecosystem-showcase-and-launches-pdq/posts/arcgate-i-built-a-usdc-on-or-off-ramp-on-arc-testnet-h2c4hxm70q"
            target="_blank" rel="noreferrer"
            style={{ border: `1px solid ${S.border}`, borderRadius: 12, padding: '15px 28px', color: S.muted, fontSize: 14, fontFamily: S.sans }}>
            Read more
          </a>
        </div>

        {/* Stats — tam genişlik, ortalanmış içerik */}
        <div style={{ width: '100%', borderTop: `1px solid ${S.border}`, borderBottom: `1px solid ${S.border}`, display: 'flex' }}>
          {[['< 0.5s', 'Settlement time'], ['0.5%', 'Fee per transaction'], ['USDC', 'Native Arc asset'], ['Non-custodial', 'Your keys, always']].map(([val, label], i, arr) => (
            <div key={label} style={{ flex: 1, padding: '22px 0', textAlign: 'center', borderRight: i < arr.length - 1 ? `1px solid ${S.border}` : 'none' }}>
              <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.3px', marginBottom: 5 }}>{val}</div>
              <div style={{ fontFamily: S.mono, fontSize: 10.5, color: S.mutedLight }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div style={{ background: S.white, borderTop: `1px solid ${S.border}` }}>
        <div style={{ padding: '52px 48px' }}>
          <div style={{ fontFamily: S.mono, fontSize: 10, color: S.mutedLight, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 36, textAlign: 'center' }}>
            How it works
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16 }}>
            {[
              { num: '01', title: 'Connect wallet', desc: 'Link MetaMask to Arc Testnet. Your wallet, your keys — we never hold your funds.' },
              { num: '02', title: 'Enter amount', desc: 'Choose how much EUR to spend or USDC to sell. See the exact rate and fee upfront.' },
              { num: '03', title: 'Bank transfer', desc: 'Send EUR to our Circle Payments IBAN with your unique reference code.' },
              { num: '04', title: 'Receive USDC', desc: 'USDC is released to your wallet on Arc Testnet within 1-2 business days.' },
            ].map(({ num, title, desc }) => (
              <div key={num} style={{ background: S.bg, border: `1px solid ${S.border}`, borderRadius: 14, padding: '26px 24px' }}>
                <div style={{ fontFamily: S.mono, fontSize: 11, color: S.mutedLight, marginBottom: 14 }}>{num}</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, letterSpacing: '-0.2px' }}>{title}</div>
                <div style={{ fontSize: 13, color: S.muted, lineHeight: 1.7 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${S.border}`, padding: '20px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: S.white }}>
        <span style={{ fontFamily: S.mono, fontSize: 11, color: S.mutedLight }}>ArcGate — Built on Arc Testnet · Powered by Circle USDC</span>
        <div style={{ display: 'flex', gap: 24 }}>
          {[['Arc Network', 'https://arc.network'], ['Circle Docs', 'https://developers.circle.com'], ['ArcScan', 'https://testnet.arcscan.app']].map(([label, href]) => (
            <a key={label} href={href} target="_blank" rel="noreferrer" style={{ fontFamily: S.mono, fontSize: 11, color: S.mutedLight }}>{label}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}