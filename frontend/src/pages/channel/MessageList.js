import { FiTrash2 } from "react-icons/fi";
import { formatDay, formatTime, groupMessages } from "../../lib/format";
import Avatar from "../../components/Avatar";

// Channel history: day dividers, and consecutive messages from one author grouped together
export default function MessageList({ messages, channelName, hasMore, onLoadOlder, currentUserId, canDelete, onDelete }) {
  return (
    <div className="messages__inner">
      {hasMore ? (
        <button type="button" className="text-button messages__older" onClick={onLoadOlder}>
          Load earlier messages
        </button>
      ) : (
        <div className="channel-start">
          <h2 className="channel-start__title">#{channelName}</h2>
          <p className="muted">This is the very beginning of the channel.</p>
        </div>
      )}

      {groupMessages(messages).map((group) => (
        <div key={group.key}>
          {group.startsNewDay && (
            <div className="day-divider">
              <span>{formatDay(group.messages[0].createdAt)}</span>
            </div>
          )}
          <article className={`msg-group ${group.userId === currentUserId ? "msg-group--mine" : ""}`}>
            <Avatar name={group.username} />
            <div className="msg-group__body">
              <header className="msg-group__header">
                <span className="msg-group__author">{group.username}</span>
                <time className="msg-group__time" dateTime={group.messages[0].createdAt}>
                  {formatTime(group.messages[0].createdAt)}
                </time>
              </header>
              {group.messages.map((m) => (
                <div key={m.id} className="msg">
                  <p className="msg__text">{m.content}</p>
                  {canDelete(m) && (
                    <button type="button" className="icon-button icon-button--small msg__action" onClick={() => onDelete(m)} title="Delete message" aria-label="Delete message">
                      <FiTrash2 />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </article>
        </div>
      ))}
    </div>
  );
}
