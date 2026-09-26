import { useEffect, useRef, useState } from "react";
import { api } from "../../lib/api";
import FormError from "../../components/FormError";

// Turning 2FA on: scan the QR code, then prove the app works by entering a code
export default function TwoFactorSetup({ onEnabled, onCancel }) {
  const [setup, setSetup] = useState(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  // StrictMode runs effects twice in development; one setup request is enough
  const requested = useRef(false);

  useEffect(() => {
    if (requested.current) return;
    requested.current = true;
    api("/auth/2fa/setup", { method: "POST" })
      .then(setSetup)
      .catch((err) => setError(err.message));
  }, []);

  const confirm = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { recoveryCodes } = await api("/auth/2fa/enable", { method: "POST", body: { code } });
      onEnabled(recoveryCodes);
    } catch (err) {
      setError(err.message);
      setCode("");
      setBusy(false);
    }
  };

  if (!setup) {
    return error ? <FormError message={error} /> : <p className="muted">Preparing…</p>;
  }

  // Show the key in groups of four so it's easier to type by hand
  const groupedSecret = setup.secret.match(/.{1,4}/g).join(" ");

  return (
    <div className="stack">
      <ol className="setup-steps">
        <li>
          <span className="setup-steps__title">Scan this with your authenticator app</span>
          <span className="field__hint">Google Authenticator, 1Password, Authy, Microsoft Authenticator — any TOTP app works.</span>
          <img className="qr" src={setup.qrCode} alt="QR code for your authenticator app" width="180" height="180" />
          <details className="manual-key">
            <summary>Can't scan? Enter this key instead</summary>
            <code className="manual-key__value">{groupedSecret}</code>
          </details>
        </li>
        <li>
          <form className="stack" onSubmit={confirm}>
            <label className="field">
              <span className="setup-steps__title">Enter the 6-digit code it shows</span>
              <input
                className="input input--mono input--code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000000"
                required
              />
            </label>
            <FormError message={error} />
            <div className="button-row">
              <button className="button" disabled={busy || code.length !== 6}>
                {busy ? "Checking…" : "Turn on"}
              </button>
              <button type="button" className="button button--ghost" onClick={onCancel}>
                Cancel
              </button>
            </div>
          </form>
        </li>
      </ol>
    </div>
  );
}
