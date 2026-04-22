import { useEffect, useRef } from "react";

const ZEFFY_FORM_URL = "/embed/ticketing/the-local-fore-scramble--2026";
const ZEFFY_IFRAME_URL = "https://www.zeffy.com/embed/ticketing/the-local-fore-scramble--2026";
const ZEFFY_SCRIPT = "https://www.zeffy.com/embed/v2/zeffy-embed.js";

export default function ZeffyEmbed() {
  const fallbackRef = useRef(null);

  useEffect(() => {
    // Avoid injecting the script twice on navigation
    if (document.querySelector(`script[src="${ZEFFY_SCRIPT}"]`)) return;
    const script = document.createElement("script");
    script.src = ZEFFY_SCRIPT;
    script.async = true;
    script.onerror = () => {
      if (fallbackRef.current) fallbackRef.current.style.display = "block";
    };
    document.body.appendChild(script);
  }, []);

  return (
    <div data-testid="zeffy-embed-wrapper">
      <div data-zeffy-embed="true" data-form-url={ZEFFY_FORM_URL} />
      <div
        ref={fallbackRef}
        data-zeffy-embed-fallback="true"
        style={{ display: "none" }}
      >
        <div style={{ position: "relative", overflow: "hidden", height: 450, width: "100%", paddingTop: 450 }}>
          <iframe
            title="Donation form powered by Zeffy"
            style={{ position: "absolute", border: 0, top: 0, left: 0, bottom: 0, right: 0, width: "100%", height: "100%" }}
            src={ZEFFY_IFRAME_URL}
            allowpaymentrequest="true"
            allowtransparency="true"
          />
        </div>
      </div>
    </div>
  );
}
