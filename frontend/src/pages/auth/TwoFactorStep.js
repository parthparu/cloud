import { useState } from "react";
import FormError from "../../components/FormError";

// Second sign-in step: 6-digit authenticator code, or a recovery code as a fallback
export default function TwoFactorStep({ onSubmit, onRestart }) {
  const [useRecovery, setUseRecovery] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await onSubmit(code);
    } catch (err) {
      // The server says when the challenge is spent; send the user back to the password step
      if (err.data?.restart) {
        onRestart(err.message);
        return;
      }
      setError(err.message);
      setCode("");
      setBusy(false);
    }
  };

  const switchMode = () => {
    setUseRecovery((r) => !r);
    setCode("");
    setError("");
  };

  return (
    <form className="stack" onSubmit={submit}>
      {useRecovery ? (
        <label className="field">
          <span className="field__label">Recovery code</span>
          <input
            key="recovery"
            className="input input--mono"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="xxxxx-xxxxx"
            autoComplete="off"
            spellCheck={false}
            required
            autoFocus
          />
          <span className="field__hint">Each recovery code works once.</span>
        </label>
      ) : (
        <label className="field">
          <span className="field__label">6-digit code from your authenticator app</span>
          <input
            key="totp"
            className="input input--mono input--code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            placeholder="000000"
            required
            autoFocus
          />
        </label>
      )}
      <FormError message={error} />
      <button className="button button--block" disabled={busy || (!useRecovery && code.length !== 6)}>
        {busy ? "Checking…" : "Verify"}
      </button>
      <div className="auth__alt-actions">
        <button type="button" className="link-button" onClick={switchMode}>
          {useRecovery ? "Use your authenticator app instead" : "Lost your phone? Use a recovery code"}
        </button>
        <button type="button" className="link-button" onClick={() => onRestart("")}>
          Start over
        </button>
      </div>
    </form>
  );
}
