// Messages arrive from REST (database rows) and from the socket (camelCase);
// normalise both to one shape
export function toMessage(raw) {
  return {
    id: Number(raw.id ?? raw.MessageID),
    channelId: Number(raw.channelId ?? raw.ChannelID),
    userId: Number(raw.userId ?? raw.UserID),
    username: raw.username ?? raw.Username ?? "unknown",
    content: raw.content ?? raw.MessageContent ?? "",
    createdAt: raw.createdAt ?? raw.MessageDate ?? new Date().toISOString(),
  };
}

export function toChannel(raw) {
  return {
    id: Number(raw.id ?? raw.ChannelID),
    serverId: Number(raw.serverId ?? raw.ServerID),
    name: raw.name ?? raw.ChannelName,
    type: raw.type ?? raw.ChannelType ?? "Text",
    description: raw.description ?? raw.ChannelDescription ?? "",
  };
}

export function toSpace(raw) {
  return {
    id: Number(raw.id ?? raw.ServerID),
    name: raw.name ?? raw.ServerName,
    description: raw.description ?? raw.ServerDesc ?? "",
    ownerId: Number(raw.ownerId ?? raw.ServerOwnerID),
    role: raw.role ?? raw.Role ?? "Member",
  };
}

const timeFormat = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });
const dayFormat = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" });
const dayFormatWithYear = new Intl.DateTimeFormat(undefined, { month: "long", day: "numeric", year: "numeric" });

export const formatTime = (iso) => timeFormat.format(new Date(iso));

export function formatDay(iso) {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.getFullYear() === today.getFullYear()
    ? dayFormat.format(date)
    : dayFormatWithYear.format(date);
}

export const sameDay = (a, b) => new Date(a).toDateString() === new Date(b).toDateString();

// Consecutive messages from one author within this window render as one block
const GROUP_WINDOW_MS = 5 * 60 * 1000;

export function groupMessages(messages) {
  const groups = [];

  for (const message of messages) {
    const last = groups[groups.length - 1];
    const lastMessage = last?.messages[last.messages.length - 1];
    const continues =
      last &&
      last.userId === message.userId &&
      sameDay(lastMessage.createdAt, message.createdAt) &&
      new Date(message.createdAt) - new Date(lastMessage.createdAt) < GROUP_WINDOW_MS;

    if (continues) {
      last.messages.push(message);
    } else {
      groups.push({
        key: message.id,
        userId: message.userId,
        username: message.username,
        startsNewDay: !lastMessage || !sameDay(lastMessage.createdAt, message.createdAt),
        messages: [message],
      });
    }
  }

  return groups;
}

export function initials(name = "") {
  const parts = name.replace(/[._]/g, " ").trim().split(/\s+/);
  const letters = parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2);
  return letters.toUpperCase();
}

// Stable per-name tint index for avatars (see --tint-0 .. --tint-5 in app.css)
export function tintIndex(name = "") {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash % 6;
}
