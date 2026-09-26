import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { APP_NAME } from "../../config";
import { api } from "../../lib/api";
import { useWorkspace } from "../../context/WorkspaceContext";
import ThemeToggle from "../../components/ThemeToggle";
import FormError from "../../components/FormError";

export default function InvitePage() {
  const { code } = useParams();
  const { spaces, refreshSpaces } = useWorkspace();
  const navigate = useNavigate();
  const [invite, setInvite] = useState(null);
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    api(`/servers/invites/${encodeURIComponent(code)}`)
      .then(({ invite }) => setInvite(invite))
      .catch((err) => setError(err.message));
  }, [code]);

  const alreadyMember = invite && spaces?.some((s) => s.id === invite.server.id);

  const join = async () => {
    setJoining(true);
    try {
      const { server } = await api("/servers/join", { method: "POST", body: { inviteCode: code } });
      await refreshSpaces();
      navigate(`/spaces/${server.id}`, { replace: true });
    } catch (err) {
      setError(err.message);
      setJoining(false);
    }
  };

  return (
    <div className="standalone">
      <div className="standalone__toolbar">
        <span className="wordmark">{APP_NAME}</span>
        <ThemeToggle />
      </div>
      <div className="card invite-card">
        {!invite && !error && <p className="muted">Checking invite…</p>}
        {error && (
          <>
            <h1 className="card__title">Invite unavailable</h1>
            <FormError message={error} />
            <Link to="/friends" className="button button--ghost">Go to {APP_NAME}</Link>
          </>
        )}
        {invite && !error && (
          <>
            <p className="eyebrow">You've been invited to</p>
            <h1 className="card__title">{invite.server.name}</h1>
            {invite.server.description && <p className="muted">{invite.server.description}</p>}
            <p className="invite-card__meta">
              {invite.server.memberCount} {invite.server.memberCount === 1 ? "member" : "members"}
            </p>
            {alreadyMember ? (
              <Link to={`/spaces/${invite.server.id}`} className="button button--block">Open space</Link>
            ) : (
              <button type="button" className="button button--block" onClick={join} disabled={joining}>
                {joining ? "Joining…" : "Join space"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
