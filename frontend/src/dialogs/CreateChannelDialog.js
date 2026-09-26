import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { toChannel } from "../lib/format";
import { useWorkspace } from "../context/WorkspaceContext";
import Modal from "../components/Modal";
import FormError from "../components/FormError";
import useSubmit from "./useSubmit";

const slugify = (value) =>
  value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9_-]/g, "").slice(0, 32);

export default function CreateChannelDialog({ space, onClose }) {
  const { addChannel } = useWorkspace();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");

  const { busy, error, submit } = useSubmit(async () => {
    const { channel } = await api(`/channels/servers/${space.id}`, {
      method: "POST",
      body: { channelName: name, channelType: "Text", channelDescription: topic.trim() || undefined },
    });
    const created = toChannel({ ...channel, serverId: space.id });
    addChannel(space.id, created);
    onClose();
    navigate(`/spaces/${space.id}/${created.id}`);
  });

  return (
    <Modal title="New channel" description={`In ${space.name}`} onClose={onClose}>
      <form className="modal__body stack" onSubmit={submit}>
        <label className="field">
          <span className="field__label">Name</span>
          <div className="input-affix">
            <span className="input-affix__prefix">#</span>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(slugify(e.target.value))}
              placeholder="planning"
              required
            />
          </div>
        </label>
        <label className="field">
          <span className="field__label">
            Topic <span className="field__hint">optional</span>
          </span>
          <input className="input" value={topic} onChange={(e) => setTopic(e.target.value)} maxLength={140} />
        </label>
        <FormError message={error} />
        <div className="modal__actions">
          <button type="button" className="button button--ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="button" disabled={busy || !name}>
            {busy ? "Creating…" : "Create channel"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
