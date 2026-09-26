// "alice is typing" line under the message list
export default function TypingLine({ names }) {
  if (names.length === 0) return <div className="typing" aria-live="polite" />;
  const who = names.length === 1 ? names[0] : names.length === 2 ? `${names[0]} and ${names[1]}` : "Several people";
  return (
    <div className="typing" aria-live="polite">
      <span className="typing__dots" aria-hidden="true"><i /><i /><i /></span>
      {who} {names.length === 1 ? "is" : "are"} typing
    </div>
  );
}
