import { initials, tintIndex } from "../lib/format";

export default function Avatar({ name, size = "md", status }) {
  return (
    <span className={`avatar avatar--${size} tint-${tintIndex(name)}`} aria-hidden="true">
      {initials(name)}
      {status && <span className={`presence presence--${status.toLowerCase()}`} />}
    </span>
  );
}
