'use client';
import React, { useEffect, useState } from 'react';

export default function DakicksTerminal() {
  const [username, setUsername] = useState('DkxFounder');
  const [activeTab, setActiveTab] = useState('terminal');
  const [email, setEmail] = useState('');
  const [isLinked, setIsLinked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      const user = window.Telegram.WebApp.initDataUnsafe?.user;
      if (user?.first_name) {
        setUsername(user.first_name);
      }
    }
  }, []);

  // EmailJS Integration Handler
  const handleEmailLink = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    const serviceID = 'service_91i0edt';
    const templateID = 'template_6a78v2d';
    const publicKey = 'UZVvtLHuf8uZWHdkg';

    const templateParams = {
      to_email: email,
      user_name: username,
      verification_code: Math.floor(100000 + Math.random() * 900000),
    };

    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: serviceID,
          template_id: templateID,
          user_id: publicKey,
          template_params: templateParams,
        }),
      });

      if (response.ok) {
        setIsLinked(true);
        alert('Verification code dispatched successfully to your Gmail.');
      } else {
        alert('Failed to dispatch verification code. Please check credentials.');
      }
    } catch (err) {
      console.error('EmailJS Error:', err);
      alert('Network error during email dispatch.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Background Video Engine - Zero Lag */}
      <video autoPlay loop muted playsInline style={styles.bgVideo}>
        <source src="/bg.mp4" type="video/mp4" />
      </video>
      <div style={styles.overlay}></div>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.userInfo}>
          <div style={styles.avatar}>{username.charAt(0).toUpperCase()}</div>
          <div>
            <div style={styles.welcomeLabel}>DKX TERMINAL</div>
            <span style={styles.usernameText}>{username}</span>
          </div>
        </div>
        <div style={styles.balanceBadge}>
          <span style={styles.platinumDot}></span> BNB #41,920,431
        </div>
      </div>

      {/* Content Area */}
      <div style={styles.content}>
        {activeTab === 'terminal' && (
          <>
            <div style={styles.sectionTitle}>Institutional Market Telemetry</div>
            <div style={styles.chartCard}>
              <div style={styles.cardHeaderTag}>REAL-TIME FEED // BINANCE:BNBUSDT</div>
              <iframe 
                src="https://s.tradingview.com/widgetembed/?symbol=BINANCE%3ABNBUSDT&interval=D&hidesidetoolbar=1&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=[]&theme=dark&style=1&timezone=Etc%2FUTC" 
                style={{ width: '100%', height: '220px', border: 'none', borderRadius: '14px' }}
                title="TradingView Live Chart"
              ></iframe>
            </div>

            {/* Gmail Verification Card */}
            <div style={styles.card}>
              <div style={styles.cardInner}>
                <span style={styles.tag}>SECURE PROTOCOL</span>
                <h3>Identity Verification Link</h3>
                <p style={styles.desc}>Link your institutional Gmail via secure cryptographic node.</p>
                {!isLinked ? (
                  <form onSubmit={handleEmailLink} style={styles.form}>
                    <input 
                      type="email" 
                      placeholder="Enter your Gmail..." 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={styles.input}
                      required
                    />
                    <button type="submit" style={styles.actionBtn} disabled={loading}>
                      {loading ? 'Dispatching...' : 'Link & Verify'}
                    </button>
                  </form>
                ) : (
                  <div style={styles.verifiedBadge}>LINKED & ENCRYPTED ✓</div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'dakicks' && (
          <div style={styles.dakicksWrapper}>
            <video autoPlay loop muted playsInline style={styles.sectionVideo}>
              <source src="/dakicks-bg.mp4" type="video/mp4" />
            </video>
            <div style={styles.sectionTitle}>Institutional RWA Architecture</div>
            <div style={styles.card}>
              <div style={styles.cardInner}>
                <span style={styles.tag}>RWA APPAREL</span>
                <h3>DAKICKS® Physical Drops</h3>
                <p>Genesis luxury footwear embedded with cryptographic NFC authenticity chips.</p>
              </div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardInner}>
                <span style={styles.tag}>TREASURY</span>
                <h3>Revenue-Share Protocol</h3>
                <p>50% of real-world footwear sales redirect into institutional buyback reserve vaults.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'community' && (
          <div style={styles.communityWrapper}>
            <video autoPlay loop muted playsInline style={styles.sectionVideo}>
              <source src="/community-bg.mp4" type="video/mp4" />
            </video>
            <div style={styles.sectionTitle}>Official Communication Nodes</div>
            <a href="https://t.me/DKXOfficial" target="_blank" rel="noreferrer" style={styles.socialCard}>
              <div>
                <h3>Telegram Network</h3>
                <p>@DKXOfficial - Core governance.</p>
              </div>
              <span style={styles.arrow}>→</span>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" style={styles.socialCard}>
              <div>
                <h3>Instagram Hub</h3>
                <p>@dakicks_dkx - Visual luxury showcase.</p>
              </div>
              <span style={styles.arrow}>→</span>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" style={styles.socialCard}>
              <div>
                <h3>X Protocol Comms</h3>
                <p>@dakicks_dkx - Real-time metrics.</p>
              </div>
              <span style={styles.arrow}>→</span>
            </a>
          </div>
        )}

        {activeTab === 'vault' && (
          <div style={styles.vaultWrapper}>
            <video autoPlay loop muted playsInline style={styles.sectionVideo}>
              <source src="/outlaybg.mp4" type="video/mp4" />
            </video>
            <div style={styles.sectionTitle}>On-Chain Smart Contract Socket</div>
            <div style={styles.card}>
              <div style={styles.cardInner}>
                <span style={styles.tag}>LIQUIDITY ALLOCATION</span>
                <h3>1,250 $DKX</h3>
                <button style={styles.actionBtn}>Claim Allocation (+2 $DKX)</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div style={styles.navBar}>
        <button style={activeTab === 'terminal' ? styles.navBtnActive : styles.navBtn} onClick={() => setActiveTab('terminal')}>Terminal</button>
        <button style={activeTab === 'dakicks' ? styles.navBtnActive : styles.navBtn} onClick={() => setActiveTab('dakicks')}>Dakicks</button>
        <button style={activeTab === 'community' ? styles.navBtnActive : styles.navBtn} onClick={() => setActiveTab('community')}>Community</button>
        <button style={activeTab === 'vault' ? styles.navBtnActive : styles.navBtn} onClick={() => setActiveTab('vault')}>Vault</button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#050507',
    color: '#f1f1f3',
    minHeight: '100vh',
    paddingBottom: '90px',
    position: 'relative',
    overflowX: 'hidden',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  bgVideo: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    objectFit: 'cover',
    zIndex: 0,
    opacity: 0.25,
    pointerEvents: 'none',
  },
  sectionVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    zIndex: 0,
    opacity: 0.15,
    pointerEvents: 'none',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(5, 5, 7, 0.85)',
    pointerEvents: 'none',
    zIndex: 1,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '18px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(12, 12, 14, 0.9)',
    backdropFilter: 'blur(20px)',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  userInfo: { display: 'flex', alignItems: 'center', gap: '12px' },
  avatar: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #2c2c30, #161618)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  welcomeLabel: { fontSize: '9px', color: '#8e8e93', fontWeight: '700', letterSpacing: '1px' },
  usernameText: { fontWeight: '700', fontSize: '15px' },
  balanceBadge: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#e5e5ea',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  platinumDot: { width: '6px', height: '6px', backgroundColor: '#fff', borderRadius: '50%', boxShadow: '0 0 8px #fff' },
  content: { padding: '20px', position: 'relative', zIndex: 2 },
  sectionTitle: { fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#8e8e93', marginBottom: '14px', fontWeight: '800' },
  chartCard: { background: '#141417', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '12px', marginBottom: '16px' },
  cardHeaderTag: { fontSize: '10px', color: '#98989f', marginBottom: '8px', fontWeight: '700' },
  card: { background: 'rgba(20, 20, 23, 0.85)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px', marginBottom: '16px', position: 'relative', overflow: 'hidden' },
  cardInner: { position: 'relative', zIndex: 1 },
  tag: { display: 'inline-block', background: 'rgba(255,255,255,0.08)', padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: '700', color: '#d1d1d6', marginBottom: '8px' },
  desc: { fontSize: '13px', color: '#8e8e93', marginBottom: '12px' },
  form: { display: 'flex', flexDirection: 'column', gap: '10px' },
  input: { background: '#09090b', border: '1px solid rgba(255,255,255,0.12)', padding: '12px', borderRadius: '10px', color: '#fff', fontSize: '14px' },
  actionBtn: { background: '#fff', color: '#000', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', marginTop: '8px' },
  verifiedBadge: { background: 'rgba(0,255,128,0.1)', border: '1px solid rgba(0,255,128,0.3)', color: '#00ff80', padding: '10px', borderRadius: '10px', textAlign: 'center', fontWeight: '700', fontSize: '13px' },
  socialCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(20, 20, 23, 0.85)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '18px', marginBottom: '14px', textDecoration: 'none', color: '#fff' },
  arrow: { fontSize: '18px', color: '#8e8e93' },
  dakicksWrapper: { position: 'relative', overflow: 'hidden', borderRadius: '18px', padding: '4px' },
  communityWrapper: { position: 'relative', overflow: 'hidden', borderRadius: '18px', padding: '4px' },
  vaultWrapper: { position: 'relative', overflow: 'hidden', borderRadius: '18px', padding: '4px' },
  navBar: { position: 'fixed', bottom: 0, left: 0, width: '100%', height: '65px', background: 'rgba(12, 12, 14, 0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 100 },
  navBtn: { background: 'transparent', border: 'none', color: '#72727a', fontSize: '12px', fontWeight: '700', cursor: 'pointer' },
  navBtnActive: { background: 'transparent', border: 'none', color: '#ffffff', fontSize: '12px', fontWeight: '800', cursor: 'pointer', textShadow: '0 0 10px rgba(255,255,255,0.5)' },
};
