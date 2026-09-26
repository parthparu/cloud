import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { FiHash, FiUserPlus } from "react-icons/fi";
import { api } from "../../lib/api";
import { emitWithAck } from "../../lib/socket";
import { toMessage } from "../../lib/format";
import { useAuth } from "../../context/AuthContext";
import { useWorkspace } from "../../context/WorkspaceContext";
import InviteDialog from "../../dialogs/InviteDialog";
import Composer from "./Composer";
import MessageList from "./MessageList";
import TypingLine from "./TypingLine";

const PAGE_SIZE = 50;

// Merge messages by id and keep them in send order
const mergeMessages = (current, incoming) => {
  const byId = new Map(current.map((m) => [m.id, m]));
  incoming.forEach((m) => byId.set(m.id, m));
  return [...byId.values()].sort((a, b) => a.id - b.id);
};

export default function ChannelPage() {
  const { spaceId, channelId } = useParams();
  const { user } = useAuth();
  const { socket, connection, spaces, channelsBySpace, loadChannels } = useWorkspace();
  const [messages, setMessages] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [typing, setTyping] = useState({});
  const [inviting, setInviting] = useState(false);
  const scrollRef = useRef(null);
  const stickToBottom = useRef(true);
  const preserveOffset = useRef(null);

  const space = spaces?.find((s) => String(s.id) === spaceId);
  const channels = channelsBySpace[spaceId];
  const channel = channels?.find((c) => String(c.id) === channelId);

  useEffect(() => {
    if (!channels) loadChannels(spaceId).catch((err) => setLoadError(err.message));
  }, [channels, spaceId, loadChannels]);

  const fetchLatest = useCallback(async () => {
    const { messages } = await api(`/messages/channels/${channelId}/messages?limit=${PAGE_SIZE}`);
    return messages.map(toMessage);
  }, [channelId]);

  // Load history when the channel changes
  useEffect(() => {
    let cancelled = false;
    setMessages(null);
    setTyping({});
    setLoadError("");
    stickToBottom.current = true;

    fetchLatest()
      .then((list) => {
        if (cancelled) return;
        setMessages(list);
        setHasMore(list.length === PAGE_SIZE);
      })
      .catch((err) => !cancelled && setLoadError(err.message));

    return () => {
      cancelled = true;
    };
  }, [fetchLatest]);

  // Live updates: join the channel room, and rejoin + catch up after reconnects
  useEffect(() => {
    if (!socket) return;
    const id = Number(channelId);

    const join = () => {
      emitWithAck(socket, "join:channel", id).then((reply) => {
        if (!reply.ok) setLoadError(reply.error);
      });
    };
    const catchUp = () => {
      join();
      fetchLatest().then((list) => setMessages((current) => mergeMessages(current || [], list))).catch(() => {});
    };

    const onNew = (raw) => {
      const message = toMessage(raw);
      if (message.channelId !== id) return;
      setMessages((current) => mergeMessages(current || [], [message]));
      setTyping((t) => {
        const { [message.userId]: _, ...rest } = t;
        return rest;
      });
    };
    const onUpdate = ({ id: messageId, channelId: cid, content }) => {
      if (Number(cid) !== id) return;
      setMessages((current) => current?.map((m) => (m.id === messageId ? { ...m, content } : m)));
    };
    const onDelete = ({ id: messageId, channelId: cid }) => {
      if (Number(cid) !== id) return;
      setMessages((current) => current?.filter((m) => m.id !== messageId));
    };
    const onTypingStart = ({ userId, username, channelId: cid }) => {
      if (Number(cid) === id) setTyping((t) => ({ ...t, [userId]: username }));
    };
    const onTypingStop = ({ userId, channelId: cid }) => {
      if (Number(cid) !== id) return;
      setTyping((t) => {
        const { [userId]: _, ...rest } = t;
        return rest;
      });
    };

    if (socket.connected) join();
    socket.on("connect", catchUp);
    socket.on("message:new", onNew);
    socket.on("message:update", onUpdate);
    socket.on("message:delete", onDelete);
    socket.on("typing:start", onTypingStart);
    socket.on("typing:stop", onTypingStop);

    return () => {
      socket.emit("leave:channel", id);
      socket.off("connect", catchUp);
      socket.off("message:new", onNew);
      socket.off("message:update", onUpdate);
      socket.off("message:delete", onDelete);
      socket.off("typing:start", onTypingStart);
      socket.off("typing:stop", onTypingStop);
    };
  }, [socket, channelId, fetchLatest]);

  // Keep the view pinned to the newest message unless the reader has scrolled up
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || !messages) return;

    if (preserveOffset.current !== null) {
      el.scrollTop = el.scrollHeight - preserveOffset.current;
      preserveOffset.current = null;
    } else if (stickToBottom.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  const onScroll = () => {
    const el = scrollRef.current;
    stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  const loadOlder = async () => {
    const oldest = messages?.[0];
    if (!oldest) return;
    try {
      const { messages: older } = await api(`/messages/channels/${channelId}/messages?limit=${PAGE_SIZE}&before=${oldest.id}`);
      preserveOffset.current = scrollRef.current.scrollHeight - scrollRef.current.scrollTop;
      setMessages((current) => mergeMessages(current, older.map(toMessage)));
      setHasMore(older.length === PAGE_SIZE);
    } catch (err) {
      setLoadError(err.message);
    }
  };

  const deleteMessage = async (message) => {
    if (!window.confirm("Delete this message? This can't be undone.")) return;
    const reply = await emitWithAck(socket, "message:delete", { messageId: message.id });
    if (!reply.ok) setLoadError(reply.error);
  };

  if (channels && !channel) {
    // The channel was deleted or never existed — fall back to the space
    return <Navigate to={`/spaces/${spaceId}`} replace />;
  }

  const canModerate = space && space.ownerId === user.id;
  const typingNames = Object.entries(typing)
    .filter(([uid]) => Number(uid) !== user.id)
    .map(([, name]) => name);

  return (
    <div className="page page--channel">
      <header className="page__header channel-header">
        <div className="channel-header__text">
          <h1 className="page__title">
            <FiHash className="channel-header__hash" />
            {channel?.name || "…"}
          </h1>
          <span className="page__meta">
            {space?.name}
            {channel?.description && <> · {channel.description}</>}
          </span>
        </div>
        {space && (
          <button type="button" className="button button--ghost button--small" onClick={() => setInviting(true)}>
            <FiUserPlus /> Invite
          </button>
        )}
      </header>

      <div className="messages" ref={scrollRef} onScroll={onScroll}>
        {loadError && <p className="form-error messages__error" role="alert">{loadError}</p>}
        {!messages && !loadError && <p className="muted messages__loading">Loading messages…</p>}

        {messages && (
          <MessageList
            messages={messages}
            channelName={channel?.name}
            hasMore={hasMore}
            onLoadOlder={loadOlder}
            currentUserId={user.id}
            canDelete={(m) => m.userId === user.id || canModerate}
            onDelete={deleteMessage}
          />
        )}
      </div>

      <TypingLine names={typingNames} />
      {channel && <Composer channel={channel} socket={socket} disabled={connection.state !== "online"} />}
      {inviting && space && <InviteDialog space={space} onClose={() => setInviting(false)} />}
    </div>
  );
}
