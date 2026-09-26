import { useEffect, useState } from "react";
import { FiSend } from "react-icons/fi";
import { api } from "../lib/api";
import FormError from "../components/FormError";

// Invite a specific person by username; friends are offered as suggestions while typing
export default function InviteByUsername({ space }) {
  const [username, setUsername] = useState("");
  const [friends, setFriends] = useState([]);
  const [state, setState] = useState({ busy: false, error: "", note: "" });

  useEffect(() => {
    api("/friends")
      .then(({ friends }) => setFriends(friends.filter((f) => f.status === "Accepted").map((f) => f.user.username)))
      .catch(() => {});
  }, []);

  const send = async (e) => {
    e.preventDefault();
    setState({ busy: true, error: "", note: "" });
    try {
      const { message } = await api("/invitations", {
        method: "POST",
        body: { serverId: space.id, username: username.trim() },
      });
      setUsername("");
      setState({ busy: false, error: "", note: `${message}.` });
    } catch (err) {
      setState({ busy: false, error: err.message, note: "" });
    }
  };

  const listId = `invite-friends-${space.id}`;

  return (
    <form className="field" onSubmit={send}>
      <span className="field__label">Invite by username</span>
      <div className="copy-row">
        <input
          className="input input--mono"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          list={listId}
          placeholder="username"
          autoComplete="off"
          spellCheck={false}
          autoFocus
        />
        <datalist id={listId}>
          {friends.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
        <button className="button" disabled={state.busy || !username.trim()}>
          <FiSend /> {state.busy ? "Sending…" : "Invite"}
        </button>
      </div>
      {state.note ? (
        <span className="field__hint form-note">{state.note} They'll see it in their sidebar.</span>
      ) : (
        <span className="field__hint">They'll get an invitation to accept or decline.</span>
      )}
      <FormError message={state.error} />
    </form>
  );
}
