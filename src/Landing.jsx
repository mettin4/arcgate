export default function Landing({ onLaunch }) {
  const S = {
    bg: '#f8f8f6', white: '#ffffff', border: '#e8e8e8',
    text: '#111', muted: '#888', mutedLight: '#bbb',
    green: '#16a34a',
    mono: "'DM Mono', monospace", sans: "'Manrope', sans-serif", logo: "'Nunito', sans-serif",
  };

  return (
    <div style={{ minHeight: '100vh', background: S.bg, fontFamily: S.sans, color: S.text, display: 'flex', flexDirection: 'column' }}>
      <style>{`@keyframes agblink{0%,100%{opacity:1;}50%{opacity:0.25;}}`}</style>

      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px', height: 60 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: S.green, display: 'inline-block', animation: 'agblink 2.5s ease-in-out infinite' }}/>
          <span style={{ fontFamily: S.mono, fontSize: 10.5, color: S.muted }}>Arc Testnet · Live</span>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {[['Arc Network', 'https://arc.network'], ['Circle Docs', 'https://developers.circle.com'], ['ArcScan', 'https://testnet.arcscan.app']].map(([label, href]) => (
            <a key={label} href={href} target="_blank" rel="noreferrer" style={{ fontFamily: S.mono, fontSize: 11, color: S.mutedLight, textDecoration: 'none' }}>{label}</a>
          ))}
        </div>
      </nav>

      {/* HERO */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 48px 48px', textAlign: 'center' }}>

        {/* Logo — centered, same as navbar */}
        <div style={{ marginBottom: 36 }}>
          <svg width="140" height="26" viewBox="0 0 140 26" fill="none">
            <path d="M1 23 L10 3 L19 23" stroke={S.text} strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round"/>
            <text x="18" y="22" fontFamily={S.logo} fontSize="21" fontWeight="900" fill={S.text} letterSpacing="-0.5">rc</text>
            <text x="46" y="22" fontFamily={S.logo} fontSize="21" fontWeight="300" fill={S.text} letterSpacing="-0.3"> Gate</text>
          </svg>
        </div>

        {/* Status pill */}
        <div style={{ fontFamily: S.mono, fontSize: 10, color: S.muted, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 32, background: S.white, border: `1px solid ${S.border}`, borderRadius: 20, padding: '5px 16px', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: S.green, display: 'inline-block' }}/>
          Arc Testnet — Live
        </div>

        {/* Headline */}
        <h1 style={{ fontSize: 56, fontWeight: 800, letterSpacing: '-2.5px', lineHeight: 1.08, marginBottom: 10, maxWidth: 700 }}>
          Your gateway between
        </h1>
        <h1 style={{ fontSize: 56, fontWeight: 300, letterSpacing: '-2px', lineHeight: 1.08, marginBottom: 26, maxWidth: 700, color: S.muted }}>
          EUR and USDC.
        </h1>

        {/* Subtext */}
        <p style={{ fontSize: 16, color: S.muted, lineHeight: 1.75, maxWidth: 460, marginBottom: 40 }}>
          Buy USDC with a bank transfer or sell USDC straight back to EUR — non-custodial, on Arc Testnet.
        </p>

        {/* CTA */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 64 }}>
          <button onClick={onLaunch} style={{ background: S.text, border: 'none', borderRadius: 12, padding: '15px 36px', color: S.white, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: S.sans, letterSpacing: '-0.2px' }}>
            Launch App →
          </button>
          <a href="https://community.arc.network/home/forum/boards/ecosystem-showcase-and-launches-pdq/posts/arcgate-i-built-a-usdc-on-or-off-ramp-on-arc-testnet-h2c4hxm70q"
            target="_blank" rel="noreferrer"
            style={{ background: 'transparent', border: `1px solid ${S.border}`, borderRadius: 12, padding: '15px 24px', color: S.muted, fontSize: 14, fontFamily: S.sans, textDecoration: 'none' }}>
            Read more
          </a>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', borderTop: `1px solid ${S.border}`, borderBottom: `1px solid ${S.border}`, width: '100%', maxWidth: 560 }}>
          {[['< 0.5s', 'Settlement'], ['0.5%', 'Fee per tx'], ['USDC', 'Native asset'], ['Non-custodial', 'Your keys']].map(([val, label], i, arr) => (
            <div key={label} style={{ flex: 1, padding: '20px 0', textAlign: 'center', borderRight: i < arr.length - 1 ? `1px solid ${S.border}` : 'none' }}>
              <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.3px', marginBottom: 4 }}>{val}</div>
              <div style={{ fontFamily: S.mono, fontSize: 10, color: S.mutedLight }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div style={{ background: S.white, borderTop: `1px solid ${S.border}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '52px 48px' }}>
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
              <div key={num} style={{ background: S.bg, border: `1px solid ${S.border}`, borderRadius: 14, padding: '24px 22px' }}>
                <div style={{ fontFamily: S.mono, fontSize: 11, color: S.mutedLight, marginBottom: 14 }}>{num}</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, letterSpacing: '-0.2px' }}>{title}</div>
                <div style={{ fontSize: 13, color: S.muted, lineHeight: 1.65 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${S.border}`, padding: '20px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: S.white }}>
        <span style={{ fontFamily: S.mono, fontSize: 11, color: S.mutedLight }}>ArcGate — Built on Arc Testnet · Powered by Circle USDC</span>
        <div style={{ display: 'flex', gap: 20 }}>
          {[['Arc Network', 'https://arc.network'], ['Circle Docs', 'https://developers.circle.com'], ['ArcScan', 'https://testnet.arcscan.app']].map(([label, href]) => (
            <a key={label} href={href} target="_blank" rel="noreferrer" style={{ fontFamily: S.mono, fontSize: 11, color: S.mutedLight, textDecoration: 'none' }}>{label}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}