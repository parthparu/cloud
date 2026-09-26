import { useState } from "react";

// Shared submit handling: busy flag, error message, and the request itself
export default function useSubmit(action) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return { busy, error, submit };
}
