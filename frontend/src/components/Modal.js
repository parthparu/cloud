import { useEffect, useRef } from "react";
import { FiX } from "react-icons/fi";

export default function Modal({ title, description, onClose, children }) {
  const panelRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    // Focus the first field rather than the close button
    const panel = panelRef.current;
    (panel?.querySelector("input, textarea") || panel?.querySelector(".modal__body button"))?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} ref={panelRef}>
        <header className="modal__header">
          <div>
            <h2 className="modal__title">{title}</h2>
            {description && <p className="modal__description">{description}</p>}
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close">
            <FiX />
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}
