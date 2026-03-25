export default function Landing({ onLaunch }) {
  const S = {
    bg: '#f8f8f6', white: '#ffffff', border: '#e8e8e8', borderLight: '#f0f0f0',
    text: '#111', muted: '#999', mutedLight: '#bbb',
    green: '#16a34a', mono: "'DM Mono', monospace", sans: "'Manrope', sans-serif", logo: "'Nunito', sans-serif",
  };

  const features = [
    { icon: '€', title: 'EUR → USDC', desc: 'Buy USDC with a bank transfer. Get a unique reference code tied to your wallet.' },
    { icon: '$', title: 'USDC → EUR', desc: 'Sell USDC directly from your wallet. Funds arrive in your bank within 1-2 days.' },
    { icon: '⚡', title: 'Sub-second settlement', desc: 'Arc Testnet finalizes transactions in under 0.5 seconds.' },
    { icon: '🔒', title: 'Non-custodial', desc: 'Your wallet, your keys. We never hold your funds.' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: S.bg, fontFamily: S.sans, color: S.text, display: 'flex', flexDirection: 'column' }}>

      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px', height: 64, background: S.white, borderBottom: `1px solid ${S.border}` }}>
        <svg width="118" height="22" viewBox="0 0 118 22" fill="none">
          <path d="M1 19.5 L8.5 2.5 L16 19.5" stroke={S.text} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"/>
          <text x="15" y="19" fontFamily={S.logo} fontSize="18" fontWeight="900" fill={S.text} letterSpacing="-0.5">rc</text>
          <text x="39" y="19" fontFamily={S.logo} fontSize="18" fontWeight="300" fill={S.text} letterSpacing="-0.3"> Gate</text>
        </svg>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: S.green, display: 'inline-block' }}/>
          <span style={{ fontFamily: S.mono, fontSize: 10.5, color: S.muted }}>Arc Testnet</span>
        </div>
        <button onClick={onLaunch} style={{ background: S.text, border: 'none', borderRadius: 9, padding: '9px 20px', color: S.white, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: S.sans }}>
          Launch App →
        </button>
      </nav>

      {/* HERO */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 48px 60px', textAlign: 'center' }}>

        <div style={{ fontFamily: S.mono, fontSize: 10, color: S.muted, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 24, background: S.white, border: `1px solid ${S.border}`, borderRadius: 20, padding: '5px 14px', display: 'inline-block' }}>
          Built on Arc Testnet · Powered by Circle USDC
        </div>

        <h1 style={{ fontSize: 56, fontWeight: 800, letterSpacing: '-2px', lineHeight: 1.1, marginBottom: 20, maxWidth: 700 }}>
          Move money<br/>
          <span style={{ fontWeight: 300, color: S.muted }}>between EUR and USDC.</span>
        </h1>

        <p style={{ fontSize: 16, color: S.muted, lineHeight: 1.8, maxWidth: 480, marginBottom: 40 }}>
          ArcGate is a non-custodial on/off ramp on Arc Testnet. Buy USDC with a bank transfer or sell USDC straight back to EUR.
        </p>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={onLaunch} style={{ background: S.text, border: 'none', borderRadius: 12, padding: '14px 32px', color: S.white, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: S.sans }}>
            Launch App →
          </button>
          <a href="https://community.arc.network/home/forum/boards/ecosystem-showcase-and-launches-pdq/posts/arcgate-i-built-a-usdc-on-or-off-ramp-on-arc-testnet-h2c4hxm70q" target="_blank" rel="noreferrer"
            style={{ background: 'transparent', border: `1px solid ${S.border}`, borderRadius: 12, padding: '14px 24px', color: S.muted, fontSize: 14, fontWeight: 400, cursor: 'pointer', fontFamily: S.sans, textDecoration: 'none' }}>
            Read more
          </a>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 40, marginTop: 60, paddingTop: 40, borderTop: `1px solid ${S.border}` }}>
          {[['< 0.5s', 'Settlement time'], ['0.5%', 'Fee per transaction'], ['USDC', 'Native Arc asset']].map(([val, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 4 }}>{val}</div>
              <div style={{ fontFamily: S.mono, fontSize: 10, color: S.muted, letterSpacing: '0.5px' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <div style={{ padding: '60px 48px', background: S.white, borderTop: `1px solid ${S.border}` }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ fontFamily: S.mono, fontSize: 10, color: S.muted, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 40, textAlign: 'center' }}>
            How it works
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 20 }}>
            {features.map(({ icon, title, desc }) => (
              <div key={title} style={{ background: S.bg, border: `1px solid ${S.border}`, borderRadius: 14, padding: '22px 20px' }}>
                <div style={{ fontSize: 22, marginBottom: 12 }}>{icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.2px' }}>{title}</div>
                <div style={{ fontSize: 12, color: S.muted, lineHeight: 1.6 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${S.border}`, padding: '20px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: S.white }}>
        <span style={{ fontFamily: S.mono, fontSize: 11, color: S.mutedLight }}>ArcGate — Built on Arc Testnet</span>
        <div style={{ display: 'flex', gap: 20 }}>
          {[['Arc Network', 'https://arc.network'], ['Circle Docs', 'https://developers.circle.com'], ['ArcScan', 'https://testnet.arcscan.app']].map(([label, href]) => (
            <a key={label} href={href} target="_blank" rel="noreferrer" style={{ fontFamily: S.mono, fontSize: 11, color: S.mutedLight, textDecoration: 'none' }}>{label}</a>
          ))}
        </div>
      </footer>

    </div>
  );
}