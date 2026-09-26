import { useEffect, useRef, useState } from "react";
import { FiCheck, FiCopy } from "react-icons/fi";
import { api } from "../lib/api";
import Modal from "../components/Modal";
import FormError from "../components/FormError";

const formatExpiry = (iso) =>
  new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(iso));

export default function InviteDialog({ space, onClose }) {
  const [invite, setInvite] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState("");
  const [sendState, setSendState] = useState({ busy: false, note: "", error: "" });

  // StrictMode runs effects twice in development; don't mint two invites
  const requested = useRef(false);

  useEffect(() => {
    if (requested.current) return;
    requested.current = true;

    api(`/servers/${space.id}/invites`, { method: "POST" })
      .then(({ invite }) => setInvite(invite))
      .catch((err) => setError(err.message));
  }, [space.id]);

  const link = invite ? `${window.location.origin}/invite/${invite.code}` : "";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Couldn't copy automatically — select the link and copy it.");
    }
  };

  const send = async (e) => {
    e.preventDefault();
    setSendState({ busy: true, note: "", error: "" });
    try {
      const result = await api(`/servers/${space.id}/invites/send`, {
        method: "POST",
        body: { email, inviteCode: invite.code },
      });
      setSendState({ busy: false, note: result.delivered ? `Sent to ${email}.` : result.reason, error: "" });
    } catch (err) {
      setSendState({ busy: false, note: "", error: err.message });
    }
  };

  return (
    <Modal title={`Invite people to ${space.name}`} onClose={onClose}>
      <div className="modal__body stack">
        <div className="field">
          <span className="field__label">Invite link</span>
          <div className="copy-row">
            <input className="input input--mono" value={link || "Creating link…"} readOnly onFocus={(e) => e.target.select()} />
            <button type="button" className="button" onClick={copy} disabled={!invite}>
              {copied ? <FiCheck /> : <FiCopy />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          {invite && <span className="field__hint">Anyone with this link can join until {formatExpiry(invite.expires)}.</span>}
        </div>
        <FormError message={error} />

        <form className="field placeholder-block" onSubmit={send}>
          <span className="field__label">
            Send by email <span className="badge">Not connected yet</span>
          </span>
          <div className="copy-row">
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              disabled={!invite}
            />
            <button className="button button--ghost" disabled={!invite || sendState.busy}>
              {sendState.busy ? "Sending…" : "Send"}
            </button>
          </div>
          {sendState.note && <span className="field__hint">{sendState.note}</span>}
          <FormError message={sendState.error} />
        </form>
      </div>
    </Modal>
  );
}
