import { useState } from "react";
import FormError from "../../components/FormError";

// Password + current code, required before weakening 2FA or replacing recovery codes
export default function ConfirmIdentityForm({ submitLabel, danger, onSubmit, onCancel }) {
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await onSubmit({ password, code });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <form className="stack confirm-identity" onSubmit={submit}>
      <label className="field">
        <span className="field__label">Password</span>
        <input className="input" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required autoFocus />
      </label>
      <label className="field">
        <span className="field__label">Authenticator code or a recovery code</span>
        <input className="input input--mono" value={code} onChange={(e) => setCode(e.target.value)} autoComplete="one-time-code" spellCheck={false} required />
      </label>
      <FormError message={error} />
      <div className="button-row">
        <button className={`button ${danger ? "button--danger" : ""}`} disabled={busy || !password || !code}>
          {busy ? "Checking…" : submitLabel}
        </button>
        <button type="button" className="button button--ghost" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
