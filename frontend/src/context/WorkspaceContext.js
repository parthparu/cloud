import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { api } from "../lib/api";
import { createSocket } from "../lib/socket";
import { toChannel, toSpace } from "../lib/format";
import { useAuth } from "./AuthContext";

const WorkspaceContext = createContext(null);

// Owns the signed-in session's live state: the socket, the list of spaces and
// their channels, and friend presence. Pages read from here instead of refetching.
export function WorkspaceProvider({ children }) {
  const { token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connection, setConnection] = useState({ state: "connecting", node: null });
  const [spaces, setSpaces] = useState(null);
  const [channelsBySpace, setChannelsBySpace] = useState({});
  const [friendsVersion, setFriendsVersion] = useState(0);
  const [presence, setPresence] = useState({});
  const joinedSpaces = useRef(new Set());

  useEffect(() => {
    if (!token) return;

    const s = createSocket(token);
    setSocket(s);

    s.on("connect", () => {
      setConnection((c) => ({ ...c, state: "online" }));
      // Rooms don't survive a reconnect; rejoin every space we were following
      joinedSpaces.current.forEach((id) => s.emit("join:server", id));
    });
    s.on("disconnect", () => setConnection((c) => ({ ...c, state: "reconnecting" })));
    s.on("connect_error", () => setConnection((c) => ({ ...c, state: "reconnecting" })));
    s.on("session:ready", ({ node }) => setConnection((c) => ({ ...c, node })));
    s.on("user:status", ({ userId, status }) => setPresence((p) => ({ ...p, [userId]: status })));

    const bumpFriends = () => setFriendsVersion((v) => v + 1);
    s.on("friend:request", bumpFriends);
    s.on("friend:response", bumpFriends);
    s.on("friend:removed", bumpFriends);

    s.on("channel:created", (raw) => {
      const channel = toChannel(raw);
      setChannelsBySpace((all) => {
        const list = all[channel.serverId];
        if (!list || list.some((c) => c.id === channel.id)) return all;
        return { ...all, [channel.serverId]: [...list, channel] };
      });
    });

    return () => {
      s.removeAllListeners();
      s.disconnect();
      setSocket(null);
    };
  }, [token]);

  const refreshSpaces = useCallback(async () => {
    const { servers } = await api("/servers");
    const list = servers.map(toSpace).sort((a, b) => a.name.localeCompare(b.name));
    setSpaces(list);
    return list;
  }, []);

  useEffect(() => {
    if (token) refreshSpaces().catch(() => setSpaces([]));
  }, [token, refreshSpaces]);

  const loadChannels = useCallback(async (spaceId) => {
    const { channels } = await api(`/channels/servers/${spaceId}`);
    // Only text channels exist in this product
    const list = channels.map(toChannel).filter((c) => c.type === "Text");
    setChannelsBySpace((all) => ({ ...all, [spaceId]: list }));
    return list;
  }, []);

  // Follow a space's room so new channels appear live
  const followSpace = useCallback(
    (spaceId) => {
      joinedSpaces.current.add(spaceId);
      socket?.emit("join:server", spaceId);
    },
    [socket]
  );

  const addChannel = useCallback((spaceId, channel) => {
    setChannelsBySpace((all) => {
      const list = all[spaceId] || [];
      if (list.some((c) => c.id === channel.id)) return all;
      return { ...all, [spaceId]: [...list, channel] };
    });
  }, []);

  const value = {
    socket,
    connection,
    spaces,
    refreshSpaces,
    channelsBySpace,
    loadChannels,
    addChannel,
    followSpace,
    presence,
    friendsVersion,
    refreshFriends: () => setFriendsVersion((v) => v + 1),
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export const useWorkspace = () => useContext(WorkspaceContext);
