import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import FormError from "../../components/FormError";
import AuthLayout, { useReturnPath } from "./AuthLayout";
import TwoFactorStep from "./TwoFactorStep";

export default function LoginPage() {
  const { login, completeTwoFactor } = useAuth();
  const navigate = useNavigate();
  const next = useReturnPath();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  // Set once the password is accepted and a 2FA code is still needed
  const [challengeToken, setChallengeToken] = useState(null);

  const submitPassword = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await login(email, password);
      if (result.twoFactorRequired) {
        setChallengeToken(result.challengeToken);
        setBusy(false);
      } else {
        navigate(next, { replace: true });
      }
    } catch (err) {
      setError(err.status === 401 ? "That email and password don't match." : err.message);
      setBusy(false);
    }
  };

  const submitCode = async (code) => {
    await completeTwoFactor(challengeToken, code);
    navigate(next, { replace: true });
  };

  const restart = (message) => {
    setChallengeToken(null);
    setPassword("");
    setError(message);
  };

  const registerLink = `/register${next !== "/friends" ? `?next=${encodeURIComponent(next)}` : ""}`;

  if (challengeToken) {
    return (
      <AuthLayout title="Two-step verification" subtitle="One more step to confirm it's you." footer={null}>
        <TwoFactorStep onSubmit={submitCode} onRestart={restart} />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to pick up where you left off."
      footer={
        <>
          New here? <Link to={registerLink}>Create an account</Link>
        </>
      }
    >
      <form className="stack" onSubmit={submitPassword}>
        <label className="field">
          <span className="field__label">Email</span>
          <input className="input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
        </label>
        <label className="field">
          <span className="field__label">Password</span>
          <input className="input" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <FormError message={error} />
        <button className="button button--block" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthLayout>
  );
}
