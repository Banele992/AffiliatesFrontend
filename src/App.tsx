import React from 'react';
import './App.css';
import ChatBot from './ChatBot';

function App() {
  return (
    <div className="dashboard-container">
      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <div className="logo-container-header" style={{ display: 'flex', alignItems: 'center', marginRight: '2rem' }}>
            <img
              src="/HollywoodLogo.png"
              alt="Hollywood Bets Logo"
              className="logo"
              style={{ height: '40px', width: 'auto', display: 'block' }}
            />
          </div>
          <div className="header-greeting" style={{ flex: 1 }}>
            <h1>Welcome to Affiliates</h1>
            <p>Your snapshot for today</p>
          </div>
          <div className="user-profile">
            <div className="avatar">A</div>
            <div className="user-info">
              <span className="user-name">Affiliate Partner</span>
            </div>
          </div>
        </header>

        <section className="dashboard-content">
          <div className="welcome-banner">
            <div className="banner-content">
              <h2>Welcome to the Hollywoodbets Affiliate Marketing Program!</h2>
              <p>Promote South Africa’s premier betting operator and earn attractive commissions today.</p>
              <button className="primary-btn">View Latest Campaigns</button>
            </div>
          </div>

        </section>
      </main>
      <ChatBot />
    </div>
  );
}

export default App;
