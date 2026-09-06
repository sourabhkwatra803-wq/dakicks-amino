'use client';
import React, { useEffect, useState } from 'react';

export default function DakicksTerminal() {
  const [username, setUsername] = useState('Investor');
  const [activeTab, setActiveTab] = useState('terminal');

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

  return (
    <div style={styles.container}>
      {/* Ultra-Luxury Ambient Backdrop */}
      <div style={styles.ambientGlow}></div>

      {/* Header - Rolex / Apple Grade Finish */}
      <div style={styles.header}>
        <div style={styles.userInfo}>
          <div style={styles.avatar}>{username.charAt(0).toUpperCase()}</div>
          <div>
            <div style={styles.welcomeLabel}>PORTFOLIO NODE</div>
            <span style={styles.usernameText}>{username}</span>
          </div>
        </div>
        <div style={styles.balanceBadge}>
          <span style={styles.platinumDot}></span> BNB #41,920,431
        </div>
      </div>

      {/* Main Dynamic View */}
      <div style={styles.content}>
        {activeTab === 'terminal' && (
          <>
            <div style={styles.sectionTitle}>Institutional Market Telemetry</div>
            
            {/* TradingView Live Chart - Clean Luxury Theme */}
            <div style={styles.chartCard}>
              <div style={styles.cardHeaderTag}>REAL-TIME FEED // BINANCE:BNBUSDT</div>
              <iframe 
                src="https://s.tradingview.com/widgetembed/?symbol=BINANCE%3ABNBUSDT&interval=D&hidesidetoolbar=1&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=[]&theme=dark&style=1&timezone=Etc%2FUTC&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&locale=en" 
                style={{ width: '100%', height: '230px', border: 'none', borderRadius: '14px' }}
                title="TradingView Live Chart"
              ></iframe>
            </div>

            <div style={styles.card}>
              <div style={styles.cardInner}>
                <span style={styles.tag}>RWA LUXURY ASSET</span>
                <h3>DAKICKS® Genesis Physical Vault</h3>
                <p>NFC-authenticated rare physical footwear mapped securely onto institutional decentralized ledgers.</p>
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardInner}>
                <span style={styles.tag}>YIELD PROTOCOL</span>
                <h3>Global Revenue Allocation</h3>
                <p>50% of real-world retail transactions automatically flow into automated institutional buyback vaults.</p>
              </div>
            </div>
          </>
        )}

        {activeTab === 'socials' && (
          <>
            <div style={styles.sectionTitle}>Official Global Channels</div>
            <a href="https://t.me/DKXOfficial" target="_blank" rel="noreferrer" style={styles.socialCard}>
              <div style={styles.socialInfo}>
                <h3>Telegram Governance</h3>
                <p>@DKXOfficial - Official community and global announcements.</p>
              </div>
              <span style={styles.arrow}>→</span>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" style={styles.socialCard}>
              <div style={styles.socialInfo}>
                <h3>Instagram Visual Showcase</h3>
                <p>Explore high-end physical drops and brand collaborations.</p>
              </div>
              <span style={styles.arrow}>→</span>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" style={styles.socialCard}>
              <div style={styles.socialInfo}>
                <h3>X (Twitter) Network</h3>
                <p>Real-time protocol updates and asset verification metrics.</p>
              </div>
              <span style={styles.arrow}>→</span>
            </a>
          </>
        )}
      </div>

      {/* Luxury Bottom Navigation */}
      <div style={styles.navBar}>
        <button style={activeTab === 'terminal' ? styles.navBtnActive : styles.navBtn} onClick={() => setActiveTab('terminal')}>
          Terminal
        </button>
        <button style={activeTab === 'socials' ? styles.navBtnActive : styles.navBtn} onClick={() => setActiveTab('socials')}>
          Ecosystem
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#0c0c0e',
    color: '#f1f1f3',
    minHeight: '100vh',
    paddingBottom: '90px',
    position: 'relative',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
  },
  ambientGlow: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'radial-gradient(circle at 50% 10%, rgba(255,255,255,0.03) 0%, rgba(12,12,14,1) 70%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '18px 22px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    background: 'rgba(12, 12, 14, 0.85)',
    backdropFilter: 'blur(25px)',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  userInfo: { display: 'flex', alignItems: 'center', gap: '12px' },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #2c2c30, #161618)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    color: '#ffffff',
    border: '1px solid rgba(255,255,255,0.12)',
  },
  welcomeLabel: { fontSize: '10px', color: '#8e8e93', fontWeight: '600', letterSpacing: '1px' },
  usernameText: { fontWeight: '600', fontSize: '15px', color: '#fff' },
  balanceBadge: {
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    padding: '7px 14px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#e5e5ea',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  platinumDot: {
    width: '6px',
    height: '6px',
    backgroundColor: '#ffffff',
    borderRadius: '50%',
    boxShadow: '0 0 10px rgba(255,255,255,0.6)',
  },
  content: { padding: '20px', position: 'relative', zIndex: 1 },
  sectionTitle: {
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    color: '#8e8e93',
    marginBottom: '14px',
    fontWeight: '700',
  },
  chartCard: {
    background: '#141417',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '18px',
    padding: '14px',
    marginBottom: '18px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
  },
  cardHeaderTag: {
    fontSize: '10px',
    color: '#98989f',
    marginBottom: '10px',
    fontWeight: '600',
    letterSpacing: '0.8px',
  },
  card: {
    background: 'linear-gradient(145deg, #161619, #101012)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '18px',
    padding: '22px',
    marginBottom: '16px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
  },
  cardInner: { position: 'relative', zIndex: 1 },
  tag: {
    display: 'inline-block',
    background: 'rgba(255,255,255,0.06)',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '10px',
    fontWeight: '600',
    color: '#d1d1d6',
    marginBottom: '10px',
    letterSpacing: '0.5px',
  },
  socialCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#141417',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '16px',
    padding: '18px 20px',
    marginBottom: '14px',
    textDecoration: 'none',
    color: '#fff',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
  },
  socialInfo: { flex: 1 },
  arrow: { fontSize: '18px', color: '#8e8e93', fontWeight: '500' },
  navBar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '65px',
    background: 'rgba(12, 12, 14, 0.9)',
    backdropFilter: 'blur(25px)',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 100,
  },
  navBtn: {
    background: 'transparent',
    border: 'none',
    color: '#8e8e93',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    letterSpacing: '0.3px',
  },
  navBtnActive: {
    background: 'transparent',
    border: 'none',
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    letterSpacing: '0.3px',
    textShadow: '0 0 12px rgba(255,255,255,0.4)',
  },
};
          
