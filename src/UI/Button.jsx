import React from "react";

const fallbackClassName =
  "bg-primary py-[1.5rem] px-[3rem] rounded-[10px] font-semibold text-[1.5rem] leading-[2.3rem] tracking-[-0.01em] hover:bg-primary-hover";

function Button({ className, title, type, url, children }) {
  if (type === "link") {
    return (
      <a className="nav-button" href={url ? url : "/"} rel="noreferrer" target="_blank">
        <button style={{ fontWeight: 600 }} className={className || fallbackClassName}>
          {title || children}
        </button>
      </a>
    );
  }

  if (type === "button") {
    return <button className={className || fallbackClassName}>{title || children}</button>;
  }
}

export default Button;
