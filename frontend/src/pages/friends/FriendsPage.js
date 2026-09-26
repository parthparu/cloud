import { useCallback, useEffect, useState } from "react";
import { FiCheck, FiUserMinus, FiX } from "react-icons/fi";
import { api } from "../../lib/api";
import { useWorkspace } from "../../context/WorkspaceContext";
import FormError from "../../components/FormError";
import PersonRow from "./PersonRow";

export default function FriendsPage() {
  const { friendsVersion, refreshFriends, presence } = useWorkspace();
  const [friendships, setFriendships] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [username, setUsername] = useState("");
  const [addState, setAddState] = useState({ busy: false, error: "", note: "" });

  const load = useCallback(() => {
    api("/friends")
      .then(({ friends }) => {
        setFriendships(friends);
        setLoadError("");
      })
      .catch((err) => setLoadError(err.message));
  }, []);

  // Reload when a socket event says our friendships changed
  useEffect(load, [load, friendsVersion]);

  const addFriend = async (e) => {
    e.preventDefault();
    setAddState({ busy: true, error: "", note: "" });
    try {
      const name = username.trim();
      await api("/friends/requests", { method: "POST", body: { username: name } });
      setUsername("");
      setAddState({ busy: false, error: "", note: `Request sent to ${name}.` });
      refreshFriends();
    } catch (err) {
      setAddState({ busy: false, error: err.message, note: "" });
    }
  };

  const act = async (request) => {
    try {
      await request;
    } catch (err) {
      setLoadError(err.message);
    }
    refreshFriends();
  };

  const respond = (id, accept) => act(api(`/friends/requests/${id}`, { method: "PUT", body: { accept } }));
  const remove = (id) => act(api(`/friends/${id}`, { method: "DELETE" }));

  const withPresence = (f) => ({ ...f.user, onlineStatus: presence[f.user.id] || f.user.onlineStatus });
  const list = friendships || [];
  const incoming = list.filter((f) => f.status === "Pending" && f.direction === "incoming");
  const outgoing = list.filter((f) => f.status === "Pending" && f.direction === "outgoing");
  const friends = list
    .filter((f) => f.status === "Accepted")
    .map((f) => ({ ...f, user: withPresence(f) }))
    .sort((a, b) => (a.user.onlineStatus === "Online" ? 0 : 1) - (b.user.onlineStatus === "Online" ? 0 : 1) || a.user.username.localeCompare(b.user.username));
  const onlineCount = friends.filter((f) => f.user.onlineStatus === "Online").length;

  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">Friends</h1>
        {friendships && <span className="page__meta">{friends.length} total · {onlineCount} online</span>}
      </header>

      <div className="page__body page__body--narrow">
        <form className="add-friend" onSubmit={addFriend}>
          <label className="field">
            <span className="field__label">Add a friend by username</span>
            <div className="copy-row">
              <input
                className="input input--mono"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                autoComplete="off"
                spellCheck={false}
              />
              <button className="button" disabled={addState.busy || !username.trim()}>
                {addState.busy ? "Sending…" : "Send request"}
              </button>
            </div>
          </label>
          <FormError message={addState.error} />
          {addState.note && <p className="form-note">{addState.note}</p>}
        </form>

        <FormError message={loadError} />
        {!friendships && !loadError && <p className="muted">Loading…</p>}

        {incoming.length > 0 && (
          <section className="people-section">
            <h2 className="people-section__title">Requests for you <span className="count">{incoming.length}</span></h2>
            <ul className="people">
              {incoming.map((f) => (
                <PersonRow key={f.id} person={f.user} detail="wants to be friends">
                  <button type="button" className="button button--small" onClick={() => respond(f.id, true)}>
                    <FiCheck /> Accept
                  </button>
                  <button type="button" className="button button--small button--ghost" onClick={() => respond(f.id, false)}>
                    <FiX /> Decline
                  </button>
                </PersonRow>
              ))}
            </ul>
          </section>
        )}

        {friendships && (
          <section className="people-section">
            <h2 className="people-section__title">Your friends</h2>
            {friends.length === 0 ? (
              <p className="empty-note">No friends yet. Send a request above using someone's username.</p>
            ) : (
              <ul className="people">
                {friends.map((f) => (
                  <PersonRow key={f.id} person={f.user} detail={f.user.onlineStatus === "Online" ? "Online" : "Offline"}>
                    <button
                      type="button"
                      className="icon-button"
                      title={`Remove ${f.user.username}`}
                      aria-label={`Remove ${f.user.username}`}
                      onClick={() => window.confirm(`Remove ${f.user.username} from your friends?`) && remove(f.id)}
                    >
                      <FiUserMinus />
                    </button>
                  </PersonRow>
                ))}
              </ul>
            )}
          </section>
        )}

        {outgoing.length > 0 && (
          <section className="people-section">
            <h2 className="people-section__title">Waiting on them</h2>
            <ul className="people">
              {outgoing.map((f) => (
                <PersonRow key={f.id} person={f.user} detail="request sent">
                  <button type="button" className="button button--small button--ghost" onClick={() => remove(f.id)}>
                    Cancel
                  </button>
                </PersonRow>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
