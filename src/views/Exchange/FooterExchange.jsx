import React from "react";

import "./FooterExchange.css";


import { getImageUrl } from "../../cloudinary/getImageUrl";

import TopRightArr from "../../assets/icons/TopRightArrColored";

export default function Footer() {
  return (
    <div className="Footer-exchange">
      <div className="footer-header">
        <img
          style={{ width: 60, height: 60, marginRight: 15 }}
          src={getImageUrl({
            path: "brandLogos/daoLogomark",
            format: "png",
          })}
          alt="DAO Logo"
        />

        <p style={{ margin: 0 }}>Born out of the Quickperp DAO community!</p>
      </div>
      <div className="footer-links--container">
        <a
          style={{ textDecoration: "none" }}
          href="https://t.me/QuickperpTrade"
          target="_blank"
          rel="noreferrer"
          className="footer-link--container"
        >
          <div>
            <img
              className="footer-icon"
              src={getImageUrl({
                path: "communityIcons/telegramLogo-themed--white",
              })}
              alt="Telegram Channel"
            />
            <span>Telegram</span>
          </div>
          <span style={{ marginLeft: "auto" }}>
            <TopRightArr />
          </span>
        </a>
        <a
          style={{ textDecoration: "none" }}
          href="https://twitter.com/QuickswapDEX"
          target="_blank"
          rel="noreferrer"
          className="footer-link--container"
        >
          <div>
            <img
              className="footer-icon"
              src={getImageUrl({
                path: "communityIcons/twitterLogo-bg--white",
              })}
              alt="Twitter Account"
            />
            <span>Twitter</span>
          </div>
          <span style={{ marginLeft: "auto" }}>
            <TopRightArr />
          </span>
        </a>
        <a
          style={{ textDecoration: "none" }}
          href="https://discord.gg/quickperp"
          target="_blank"
          rel="noreferrer"
          className="footer-link--container"
        >
          <div>
            <img
              className="footer-icon"
              src={getImageUrl({
                path: "communityIcons/discordLogo-themed--white",
              })}
              alt="Discord Channel"
            />
            <span>Discord</span>
          </div>
          <span style={{ marginLeft: "auto" }}>
            <TopRightArr />
          </span>
        </a>
        <a
          style={{ textDecoration: "none" }}
          href="https://medium.com/@quickperp.trade"
          target="_blank"
          rel="noreferrer"
          className="footer-link--container"
        >
          <div>
            <img
              className="footer-icon"
              src={getImageUrl({
                path: "communityIcons/medium-themed--white",
              })}
              alt="Medium Blog"
            />
            <span>Medium</span>
          </div>
          <span style={{ marginLeft: "auto" }}>
            <TopRightArr />
          </span>
        </a>
        <a
          style={{ textDecoration: "none" }}
          href="https://github.com/quickperporg/"
          target="_blank"
          rel="noreferrer"
          className="footer-link--container"
        >
          <div>
            <img
              className="footer-icon"
              src={getImageUrl({
                path: "communityIcons/githubLogo-themed--white",
              })}
              alt="Github Repo"
            />
            <span>Github</span>
          </div>
          <span style={{ marginLeft: "auto" }}>
            <TopRightArr />
          </span>
        </a>
        <a
          style={{ textDecoration: "none" }}
          href="https://docs.quickperp.trade"
          target="_blank"
          rel="noreferrer"
          className="footer-link--container"
        >
          <div>
            <img
              className="footer-icon"
              src={getImageUrl({
                path: "communityIcons/gitbookLogo-themed--white",
              })}
              alt="Gitbook Docs"
            />
            <span>Gitbook</span>
          </div>
          <span style={{ marginLeft: "auto" }}>
            <TopRightArr />
          </span>
        </a>
      </div>
    </div>
  );
}
