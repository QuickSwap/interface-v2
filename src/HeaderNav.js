import React from 'react'
import { NavLink } from "react-router-dom";
import './HeaderNav.css'

export default function HeaderNav() { 
  return (
    <div className="App-header-links mobile-header-padding" style={{display:'flex'}}>
      <div className="App-header-link-container">
        <NavLink activeClassName="active" to="/trade">
          Trade
        </NavLink>
      </div>
      <div className="App-header-link-container">
        <NavLink activeClassName="active" to="/dashboard">
          Dashboard
        </NavLink>
      </div>
      <div className="App-header-link-container">
        <NavLink activeClassName="active" to="/liquidity">
        Liquidity
        </NavLink>
      </div>
      <div className="App-header-link-container">
        <NavLink activeClassName="active" to="/referrals">
          Referrals
        </NavLink>
      </div>
      <div className="App-header-link-container">
      <a href="https://perps-leaderboard.quickswap.exchange" target="_blank" rel="noopener noreferrer">
          <span
            className="hover-white"
          >
            Leaderboard
          </span>
        </a>
      </div>
      <div className="App-header-link-container">
      <a href="https://perps-analytics.quickswap.exchange" target="_blank" rel="noopener noreferrer">
          <span
            className="hover-white"
          >
            Analytics
          </span>
        </a>
      </div>
      <div className="App-header-link-container">
      <a href="https://perps-docs.quickswap.exchange" target="_blank" rel="noopener noreferrer">
          <span
            className="hover-white"
          >
            Docs
          </span>
        </a>
      </div>

    </div>
  )
}
