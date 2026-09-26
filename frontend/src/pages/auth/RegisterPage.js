import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import FormError from "../../components/FormError";
import AuthLayout, { useReturnPath } from "./AuthLayout";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const next = useReturnPath();
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const update = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: key === "username" ? e.target.value.toLowerCase() : e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("The passwords don't match.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await register(form.username, form.email, form.password);
      navigate(next, { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Pick a username your friends will find you by."
      footer={
        <>
          Already have an account? <Link to={`/login${next !== "/friends" ? `?next=${encodeURIComponent(next)}` : ""}`}>Sign in</Link>
        </>
      }
    >
      <form className="stack" onSubmit={submit}>
        <label className="field">
          <span className="field__label">Username</span>
          <input
            className="input input--mono"
            autoComplete="username"
            value={form.username}
            onChange={update("username")}
            pattern="[a-z0-9_.]{3,24}"
            title="3–24 characters: letters, numbers, dots or underscores"
            required
            autoFocus
          />
          <span className="field__hint">3–24 characters: letters, numbers, dots or underscores.</span>
        </label>
        <label className="field">
          <span className="field__label">Email</span>
          <input className="input" type="email" autoComplete="email" value={form.email} onChange={update("email")} required />
        </label>
        <label className="field">
          <span className="field__label">Password</span>
          <input className="input" type="password" autoComplete="new-password" minLength={8} value={form.password} onChange={update("password")} required />
          <span className="field__hint">At least 8 characters.</span>
        </label>
        <label className="field">
          <span className="field__label">Confirm password</span>
          <input className="input" type="password" autoComplete="new-password" value={form.confirm} onChange={update("confirm")} required />
        </label>
        <FormError message={error} />
        <button className="button button--block" disabled={busy}>
          {busy ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthLayout>
  );
}
