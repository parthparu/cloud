import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useWorkspace } from "../context/WorkspaceContext";
import Modal from "../components/Modal";
import FormError from "../components/FormError";
import useSubmit from "./useSubmit";

// Accept either a bare code or a full invite link
const extractCode = (value) => value.trim().split("/").filter(Boolean).pop() || "";

export default function JoinSpaceDialog({ onClose }) {
  const { refreshSpaces } = useWorkspace();
  const navigate = useNavigate();
  const [code, setCode] = useState("");

  const { busy, error, submit } = useSubmit(async () => {
    const { server } = await api("/servers/join", { method: "POST", body: { inviteCode: extractCode(code) } });
    await refreshSpaces();
    onClose();
    navigate(`/spaces/${server.id}`);
  });

  return (
    <Modal title="Join a space" description="Paste an invite link or code someone shared with you." onClose={onClose}>
      <form className="modal__body stack" onSubmit={submit}>
        <label className="field">
          <span className="field__label">Invite link or code</span>
          <input
            className="input input--mono"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. 79Sgpaig"
            required
          />
        </label>
        <FormError message={error} />
        <div className="modal__actions">
          <button type="button" className="button button--ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="button" disabled={busy || !code.trim()}>
            {busy ? "Joining…" : "Join"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
