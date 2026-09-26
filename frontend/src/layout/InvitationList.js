import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCheck, FiMail, FiX } from "react-icons/fi";
import { useWorkspace } from "../context/WorkspaceContext";

// Invitations to spaces waiting for this user, shown at the top of the sidebar's space list
export default function InvitationList() {
  const { invitations, acceptInvitation, declineInvitation } = useWorkspace();
  const navigate = useNavigate();
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  if (invitations.length === 0) return null;

  const act = async (invitationId, action) => {
    setBusyId(invitationId);
    setError("");
    try {
      const spaceId = await action(invitationId);
      if (spaceId) navigate(`/spaces/${spaceId}`);
    } catch (err) {
      setError(err.message);
    }
    setBusyId(null);
  };

  return (
    <ul className="invitations" aria-label="Invitations">
      {invitations.map((invitation) => (
        <li key={invitation.id} className="invitation">
          <FiMail className="invitation__icon" />
          <div className="invitation__text">
            <span className="invitation__space">{invitation.space.name}</span>
            <span className="invitation__from">from {invitation.invitedBy}</span>
          </div>
          <button
            type="button"
            className="icon-button icon-button--small invitation__accept"
            onClick={() => act(invitation.id, acceptInvitation)}
            disabled={busyId === invitation.id}
            title={`Join ${invitation.space.name}`}
            aria-label={`Join ${invitation.space.name}`}
          >
            <FiCheck />
          </button>
          <button
            type="button"
            className="icon-button icon-button--small"
            onClick={() => act(invitation.id, declineInvitation)}
            disabled={busyId === invitation.id}
            title="Decline"
            aria-label={`Decline invitation to ${invitation.space.name}`}
          >
            <FiX />
          </button>
        </li>
      ))}
      {error && <li className="form-error">{error}</li>}
    </ul>
  );
}
