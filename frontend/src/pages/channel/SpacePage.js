import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useWorkspace } from "../../context/WorkspaceContext";

// /spaces/:spaceId — open the space's first channel
export default function SpacePage() {
  const { spaceId } = useParams();
  const { spaces, channelsBySpace, loadChannels } = useWorkspace();
  const [error, setError] = useState("");
  const channels = channelsBySpace[spaceId];

  useEffect(() => {
    if (!channels) loadChannels(spaceId).catch((err) => setError(err.message));
  }, [channels, spaceId, loadChannels]);

  if (channels?.length) return <Navigate to={`/spaces/${spaceId}/${channels[0].id}`} replace />;

  const space = spaces?.find((s) => String(s.id) === spaceId);
  return (
    <div className="page page--center">
      {error ? (
        <p className="form-error">{error}</p>
      ) : channels ? (
        <p className="muted">{space?.name || "This space"} has no channels yet. Add one from the sidebar.</p>
      ) : (
        <p className="muted">Loading…</p>
      )}
    </div>
  );
}
