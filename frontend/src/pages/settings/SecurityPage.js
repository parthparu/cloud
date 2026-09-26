import { useCallback, useEffect, useState } from "react";
import { FiShield } from "react-icons/fi";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import FormError from "../../components/FormError";
import ConfirmIdentityForm from "./ConfirmIdentityForm";
import RecoveryCodes from "./RecoveryCodes";
import TwoFactorSetup from "./TwoFactorSetup";

// mode: "idle" | "setup" | "codes" (showing fresh recovery codes) | "regenerate" | "disable"
export default function SecurityPage() {
  const { user, updateUser } = useAuth();
  const [status, setStatus] = useState(null);
  const [mode, setMode] = useState("idle");
  const [freshCodes, setFreshCodes] = useState(null);
  const [loadError, setLoadError] = useState("");

  const load = useCallback(() => {
    api("/auth/2fa")
      .then((s) => {
        setStatus(s);
        updateUser({ twoFactorEnabled: s.enabled });
      })
      .catch((err) => setLoadError(err.message));
    // updateUser only merges into state; it doesn't need to retrigger loading
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(load, [load]);

  const showCodes = (codes) => {
    setFreshCodes(codes);
    setMode("codes");
  };

  const finish = () => {
    setFreshCodes(null);
    setMode("idle");
    load();
  };

  const regenerate = async ({ password, code }) => {
    const { recoveryCodes } = await api("/auth/2fa/recovery-codes", { method: "POST", body: { password, code } });
    showCodes(recoveryCodes);
  };

  const disable = async ({ password, code }) => {
    await api("/auth/2fa/disable", { method: "POST", body: { password, code } });
    finish();
  };

  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">Security</h1>
        <span className="page__meta">{user.email}</span>
      </header>

      <div className="page__body page__body--narrow">
        <section className="settings-card">
          <header className="settings-card__header">
            <FiShield className="settings-card__icon" />
            <div>
              <h2 className="settings-card__title">
                Two-step verification
                {status && (
                  <span className={`status-pill ${status.enabled ? "status-pill--on" : ""}`}>{status.enabled ? "On" : "Off"}</span>
                )}
              </h2>
              <p className="muted">
                After your password, you'll also enter a code from an authenticator app. Someone who learns your
                password still can't get in.
              </p>
            </div>
          </header>

          <div className="settings-card__body">
            <FormError message={loadError} />
            {!status && !loadError && <p className="muted">Loading…</p>}

            {mode === "codes" && freshCodes && <RecoveryCodes codes={freshCodes} onDone={finish} />}

            {mode === "setup" && <TwoFactorSetup onEnabled={showCodes} onCancel={() => setMode("idle")} />}

            {mode === "regenerate" && (
              <>
                <p>New codes replace all your current ones.</p>
                <ConfirmIdentityForm submitLabel="Create new codes" onSubmit={regenerate} onCancel={() => setMode("idle")} />
              </>
            )}

            {mode === "disable" && (
              <>
                <p>Your account will be protected by your password alone.</p>
                <ConfirmIdentityForm submitLabel="Turn off" danger onSubmit={disable} onCancel={() => setMode("idle")} />
              </>
            )}

            {mode === "idle" && status && !status.enabled && (
              <button type="button" className="button" onClick={() => setMode("setup")}>
                Set up two-step verification
              </button>
            )}

            {mode === "idle" && status?.enabled && (
              <div className="stack">
                <p className={status.recoveryCodesRemaining <= 2 ? "form-error" : "muted"}>
                  {status.recoveryCodesRemaining} of 10 recovery codes left
                  {status.recoveryCodesRemaining <= 2 && " — create new ones soon"}.
                </p>
                <div className="button-row">
                  <button type="button" className="button button--ghost" onClick={() => setMode("regenerate")}>
                    New recovery codes
                  </button>
                  <button type="button" className="button button--ghost button--danger-text" onClick={() => setMode("disable")}>
                    Turn off
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
