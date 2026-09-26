import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useWorkspace } from "../context/WorkspaceContext";
import Modal from "../components/Modal";
import FormError from "../components/FormError";
import useSubmit from "./useSubmit";

export default function CreateSpaceDialog({ onClose }) {
  const { refreshSpaces } = useWorkspace();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const { busy, error, submit } = useSubmit(async () => {
    const { server } = await api("/servers", {
      method: "POST",
      body: { serverName: name, serverDescription: description.trim() || undefined },
    });
    await refreshSpaces();
    onClose();
    navigate(`/spaces/${server.id}`);
  });

  return (
    <Modal title="New space" description="A space holds channels for one group of people." onClose={onClose}>
      <form className="modal__body stack" onSubmit={submit}>
        <label className="field">
          <span className="field__label">Name</span>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} required />
        </label>
        <label className="field">
          <span className="field__label">
            What's it for? <span className="field__hint">optional</span>
          </span>
          <input className="input" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={140} />
        </label>
        <FormError message={error} />
        <div className="modal__actions">
          <button type="button" className="button button--ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="button" disabled={busy || !name.trim()}>
            {busy ? "Creating…" : "Create space"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
