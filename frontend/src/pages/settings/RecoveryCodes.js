import { useState } from "react";
import { FiCheck, FiCopy, FiDownload } from "react-icons/fi";
import { APP_NAME } from "../../config";

// Shown exactly once, straight after codes are generated — the server keeps only hashes
export default function RecoveryCodes({ codes, onDone }) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const text = codes.join("\n");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setSaved(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  const download = () => {
    const blob = new Blob([`${APP_NAME} recovery codes\nEach code works once.\n\n${text}\n`], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${APP_NAME.toLowerCase()}-recovery-codes.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
    setSaved(true);
  };

  return (
    <div className="stack">
      <p>
        Save these somewhere safe, like a password manager. If you lose your phone, each code lets you sign in
        once. <strong>You won't be able to see them again.</strong>
      </p>
      <ol className="recovery-codes">
        {codes.map((code) => (
          <li key={code}>{code}</li>
        ))}
      </ol>
      <div className="button-row">
        <button type="button" className="button button--ghost button--small" onClick={copy}>
          {copied ? <FiCheck /> : <FiCopy />} {copied ? "Copied" : "Copy all"}
        </button>
        <button type="button" className="button button--ghost button--small" onClick={download}>
          <FiDownload /> Download .txt
        </button>
      </div>
      <label className="checkbox">
        <input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} />
        I've saved my recovery codes
      </label>
      <div>
        <button type="button" className="button" disabled={!saved} onClick={onDone}>
          Done
        </button>
      </div>
    </div>
  );
}
