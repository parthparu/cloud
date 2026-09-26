import { useCallback, useEffect, useRef, useState } from "react";
import { emitWithAck } from "../../lib/socket";

const TYPING_IDLE_MS = 3000;

// Message input: Enter sends, Shift+Enter adds a line, typing state is broadcast while writing
export default function Composer({ channel, socket, disabled }) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const typingTimer = useRef(null);
  const isTyping = useRef(false);
  const inputRef = useRef(null);

  const stopTyping = useCallback(() => {
    clearTimeout(typingTimer.current);
    if (isTyping.current) {
      socket?.emit("typing:stop", { channelId: channel.id });
      isTyping.current = false;
    }
  }, [socket, channel.id]);

  // Reset when switching channels
  useEffect(() => {
    setText("");
    setError("");
    inputRef.current?.focus();
    return stopTyping;
  }, [channel.id, stopTyping]);

  const onChange = (e) => {
    setText(e.target.value);
    // Grow with content up to the CSS max-height
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;

    if (!isTyping.current) {
      socket?.emit("typing:start", { channelId: channel.id });
      isTyping.current = true;
    }
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(stopTyping, TYPING_IDLE_MS);
  };

  const send = async () => {
    const content = text.trim();
    if (!content || sending || !socket) return;

    setSending(true);
    stopTyping();
    const reply = await emitWithAck(socket, "message:send", {
      channelId: channel.id,
      content,
      // Client send time, for end-to-end delivery latency (PLAN.md Phase 1/6)
      sentAt: Date.now(),
    });
    setSending(false);

    if (reply.ok) {
      setText("");
      setError("");
      if (inputRef.current) inputRef.current.style.height = "auto";
    } else {
      setError(reply.error);
    }
    inputRef.current?.focus();
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="composer">
      {error && <p className="form-error composer__error" role="alert">{error}</p>}
      <div className="composer__box">
        <textarea
          ref={inputRef}
          className="composer__input"
          rows={1}
          value={text}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onBlur={stopTyping}
          placeholder={disabled ? "Reconnecting…" : `Write to #${channel.name}`}
          aria-label={`Message #${channel.name}`}
          maxLength={4000}
        />
        <button type="button" className="button composer__send" onClick={send} disabled={!text.trim() || sending || disabled}>
          Send
        </button>
      </div>
      <p className="composer__hint">
        <kbd>Enter</kbd> to send · <kbd>Shift</kbd>+<kbd>Enter</kbd> for a new line
      </p>
    </div>
  );
}
