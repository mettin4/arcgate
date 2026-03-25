export default function Landing({ onLaunch }) {
  const S = {
    bg: '#f8f8f6', white: '#ffffff', border: '#e8e8e8',
    text: '#111', muted: '#888', mutedLight: '#bbb',
    green: '#16a34a',
    mono: "'DM Mono', monospace", sans: "'Manrope', sans-serif", logo: "'Nunito', sans-serif",
  };

  return (
    <div style={{ minHeight: '100vh', background: S.bg, fontFamily: S.sans, color: S.text, display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes agblink{0%,100%{opacity:1;}50%{opacity:0.25;}}
        * { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; }
      `}</style>

      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px', height: 64, background: S.white, borderBottom: `1px solid ${S.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: S.green, display: 'inline-block', animation: 'agblink 2.5s ease-in-out infinite' }}/>
          <span style={{ fontFamily: S.mono, fontSize: 11, color: S.muted }}>Arc Testnet · Live</span>
        </div>
        <div style={{ display: 'flex', gap: 28 }}>
          {[['Arc Network', 'https://arc.network'], ['Circle Docs', 'https://developers.circle.com'], ['ArcScan', 'https://testnet.arcscan.app']].map(([label, href]) => (
            <a key={label} href={href} target="_blank" rel="noreferrer" style={{ fontFamily: S.mono, fontSize: 11, color: S.mutedLight }}>{label}</a>
          ))}
        </div>
      </nav>

      {/* HERO — full width centered */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '72px 0 56px', textAlign: 'center', width: '100%' }}>

        {/* Logo — pure text, no SVG tricks */}
        <div style={{ fontFamily: S.logo, fontSize: 28, fontWeight: 900, letterSpacing: '-0.8px', marginBottom: 28, display: 'flex', alignItems: 'baseline', gap: 0 }}>
          <span style={{ fontWeight: 900 }}>Arc</span>
          <span style={{ fontWeight: 300, color: S.muted }}>Gate</span>
        </div>

        {/* Status pill */}
        <div style={{ fontFamily: S.mono, fontSize: 10, color: S.muted, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 36, background: S.white, border: `1px solid ${S.border}`, borderRadius: 20, padding: '6px 18px', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: S.green, display: 'inline-block' }}/>
          Arc Testnet — Live
        </div>

        {/* Headline */}
        <div style={{ marginBottom: 24, lineHeight: 1.08 }}>
          <div style={{ fontSize: 64, fontWeight: 800, letterSpacing: '-3px' }}>Your gateway between</div>
          <div style={{ fontSize: 64, fontWeight: 300, letterSpacing: '-2.5px', color: S.muted }}>EUR and USDC.</div>
        </div>

        {/* Subtext */}
        <p style={{ fontSize: 17, color: S.muted, lineHeight: 1.75, maxWidth: 520, marginBottom: 44, padding: '0 24px' }}>
          Buy USDC with a bank transfer or sell USDC straight back to EUR — non-custodial, on Arc Testnet.
        </p>

        {/* CTA */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 72 }}>
          <button onClick={onLaunch} style={{ background: S.text, border: 'none', borderRadius: 12, padding: '16px 40px', color: S.white, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: S.sans }}>
            Launch App →
          </button>
          <a href="https://community.arc.network/home/forum/boards/ecosystem-showcase-and-launches-pdq/posts/arcgate-i-built-a-usdc-on-or-off-ramp-on-arc-testnet-h2c4hxm70q"
            target="_blank" rel="noreferrer"
            style={{ background: 'transparent', border: `1px solid ${S.border}`, borderRadius: 12, padding: '16px 28px', color: S.muted, fontSize: 14, fontFamily: S.sans }}>
            Read more
          </a>
        </div>

        {/* Stats — full width */}
        <div style={{ width: '100%', borderTop: `1px solid ${S.border}`, borderBottom: `1px solid ${S.border}`, display: 'flex' }}>
          {[['< 0.5s', 'Settlement time'], ['0.5%', 'Fee per transaction'], ['USDC', 'Native Arc asset'], ['Non-custodial', 'Your keys, always']].map(([val, label], i, arr) => (
            <div key={label} style={{ flex: 1, padding: '24px 0', textAlign: 'center', borderRight: i < arr.length - 1 ? `1px solid ${S.border}` : 'none' }}>
              <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.4px', marginBottom: 5 }}>{val}</div>
              <div style={{ fontFamily: S.mono, fontSize: 10.5, color: S.mutedLight }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS — full width */}
      <div style={{ background: S.white, borderTop: `1px solid ${S.border}` }}>
        <div style={{ padding: '56px 48px' }}>
          <div style={{ fontFamily: S.mono, fontSize: 10, color: S.mutedLight, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 40, textAlign: 'center' }}>
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
                <div style={{ fontFamily: S.mono, fontSize: 11, color: S.mutedLight, marginBottom: 16 }}>{num}</div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10, letterSpacing: '-0.2px' }}>{title}</div>
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