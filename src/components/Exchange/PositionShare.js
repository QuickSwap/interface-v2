import { useEffect, useRef, useState } from "react";
import { toJpeg } from "html-to-image";
import cx from "classnames";
import BiCopy from "../../assets/icons/copyIcon.svg";
import RiFileDownloadLine from "../../assets/icons/downloadIcon.svg";
import FiTwitter from "../../assets/icons/twitterIcon.svg";
import { useCopyToClipboard } from "react-use";
import Modal from "../Modal/Modal";
import qpxLogo from "../../assets/logos/QuickswapLogo@2x.png";
import { getImageUrl } from "../../cloudinary/getImageUrl";
import "./PositionShare.css";
import { QRCodeSVG } from "qrcode.react";
import {
  formatAmount,
  getHomeUrl,
  getRootShareApiUrl,
  getTwitterIntentURL,
  helperToast,
  USD_DECIMALS,
} from "../../Helpers";
import { useAffiliateCodes } from "../../Api/referrals";
import SpinningLoader from "../Common/SpinningLoader";
import useLoadImage from "../../hooks/useLoadImage";

const ROOT_SHARE_URL = getRootShareApiUrl();
const UPLOAD_URL = ROOT_SHARE_URL + "/api/upload";
const UPLOAD_SHARE = ROOT_SHARE_URL + "/api/s";
const config = { quality: 0.9, canvasWidth: 660, canvasHeight:346 };

function getShareURL(imageInfo, ref) {
  if (!imageInfo) return;
  let url = `${UPLOAD_SHARE}?id=${imageInfo.id}`;
  if (ref.success) {
    url = url + `&ref=${ref.code}`;
  }
  return url;
}

function PositionShare({ setIsPositionShareModalOpen, isPositionShareModalOpen, positionToShare, account, chainId }) {
  const userAffiliateCode = useAffiliateCodes(chainId, account);
  const [uploadedImageInfo, setUploadedImageInfo] = useState();
  const [uploadedImageError, setUploadedImageError] = useState();
  const [, copyToClipboard] = useCopyToClipboard();
  const positionRef = useRef();
  const tweetLink = getTwitterIntentURL(
    `Latest $${positionToShare?.indexToken?.symbol} trade on @QuickswapDEX`,
    getShareURL(uploadedImageInfo, userAffiliateCode),
    "Polygon,zkEVM"
  );

  console.log("tweetLink", tweetLink);

  useEffect(() => {
    (async function () {
      const element = positionRef.current;
      if (element && userAffiliateCode.success && positionToShare) {
        const image = await toJpeg(element, config);
        try {
          const imageInfo = await fetch(UPLOAD_URL, { method: "POST", body: image }).then((res) => res.json());
          setUploadedImageInfo(imageInfo);
        } catch {
          setUploadedImageInfo(null);
          setUploadedImageError("Image generation error, please refresh and try again.");
        }
      }
    })();
  }, [userAffiliateCode, positionToShare]);

  async function handleDownload() {
    const { indexToken, isLong } = positionToShare;
    const element = positionRef.current;
    if (!element) return;
    const dataUrl = await toJpeg(element, config);
    const link = document.createElement("a");
    link.download = `${indexToken.symbol}-${isLong ? "long" : "short"}.jpeg`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
  }

  function handleCopy() {
    if (!uploadedImageInfo) return;
    const url = getShareURL(uploadedImageInfo, userAffiliateCode);
    copyToClipboard(url);
    helperToast.success("Link copied to clipboard.");
  }
  return (
    <Modal
      className="position-share-modal"
      isVisible={isPositionShareModalOpen}
      setIsVisible={setIsPositionShareModalOpen}
      label="Share Position"
    >
      <div style={{ padding: "16px 12px" }} className="query-modal">
        <PositionShareCard
          userAffiliateCode={userAffiliateCode}
          positionRef={positionRef}
          position={positionToShare}
          chainId={chainId}
          account={account}
          uploadedImageInfo={uploadedImageInfo}
          uploadedImageError={uploadedImageError}
        />
        {uploadedImageError && <span className="error">{uploadedImageError}</span>}

        <div className="actions query-actions">
          <button
            style={{ display: "flex", gap: 15, alignItems: "center", justifyContent: "center" }}
            disabled={!uploadedImageInfo}
            className="mr-base App-button-option share"
            onClick={handleCopy}
          >
            <img src={BiCopy} alt="Copy" />
            Copy
          </button>
          <button
            style={{ display: "flex", alignItems: "center", justifyItems: "center", gap: 15 }}
            className="mr-base App-button-option share"
            onClick={handleDownload}
          >
            <img src={RiFileDownloadLine} alt="Download" />
            Download
          </button>
          <div className={cx("tweet-link-container", { disabled: !uploadedImageInfo })}>
            <a
              style={{ display: "flex", alignItems: "center", justifyItems: "center", gap: 15 }}
              target="_blank"
              className={cx("tweet-link App-button-option share", { disabled: !uploadedImageInfo })}
              rel="noreferrer"
              href={tweetLink}
            >
              <img src={FiTwitter} alt="Twitter" />
              Tweet
            </a>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function PositionShareCard({
  positionRef,
  position,
  userAffiliateCode,
  uploadedImageInfo,
  uploadedImageError,
}) {
  const { code, success } = userAffiliateCode;
  const { deltaAfterFeesPercentageStr, isLong, leverage, indexToken, averagePrice, markPrice } = position;
  const homeURL = getHomeUrl();
  return (
    <div className="relative">
      <div
        ref={positionRef}
        className="position-share"
      >
        <div className="bg-card--backdrop">
          <img
            // width={131}
            height={20}
            className="logo"
            src={qpxLogo}
            alt="QPX Logo"
          />
          <div
            className="share-infos"
          >
            <ul
              style={{
                display: "flex",
                flexDirection: "column",
                listStyle: "none",
                marginTop: 0,
              }}
              className="info"
            >
              <li className={`side${isLong}`}>{isLong ? "LONG" : "SHORT"}</li>
              <li className="position-share-price-leverage">{deltaAfterFeesPercentageStr}</li>
            </ul>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <img
                width={40}
                height={40}
                src={getImageUrl({
                  path: `coins/others/${indexToken.symbol.toLowerCase()}-original`,
                  format:"png"
                })}
                alt=""
              />
              <div>
                <span style={{ margin: 0, fontSize: 14 }}>{indexToken.symbol} USD</span>
                <li className="position-share-price-leverage">
                  {formatAmount(leverage, 4, 2, true)}x&nbsp;
                </li>
              </div>
            </div>
          </div>
          <div className="position-share-prices">
            <div className="position-share-price">
              <span className="position-share-price-label">Entry Price</span>
              <span className="position-share-price-number">
                ${formatAmount(averagePrice, USD_DECIMALS, indexToken.displayDecimals, true)}
              </span>
            </div>
            <div className="position-share-price">
              <span className="position-share-price-label">Market Price</span>
              <span className="position-share-price-number">
                ${formatAmount(markPrice, USD_DECIMALS, indexToken.displayDecimals, true)}
              </span>
            </div>
            <div className="position-share-price-ref">
              <div>
                <QRCodeSVG size={32} value={success ? `${homeURL}/#/?ref=${code}` : `${homeURL}`} />
              </div>
              <div className="position-share-ref">
                {success&&code ? (
                  <>
                    <p className="position-share-price-label">
                      Referral Code
                    </p>
                    <p className="position-share-price-label">{code}</p>
                  </>
                ) : (
                  <p style={{ margin: 0,fontSize: 8, fontWeight: 300, maxWidth:"80px",maxHeight:"36px", wordWrap:"break-word",overflow:"hidden" }} className="">https://perps.quickswap.exchange</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {!uploadedImageInfo && !uploadedImageError && (
        <div style={{ zIndex: 100000 }} className="image-overlay-wrapper">
          <div className="image-overlay">
            <SpinningLoader />
            <p className="loading-text">Generating shareable image...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default PositionShare;
