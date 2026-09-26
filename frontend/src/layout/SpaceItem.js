import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { FiChevronRight, FiHash, FiPlus, FiUserPlus } from "react-icons/fi";
import { useWorkspace } from "../context/WorkspaceContext";

// One space in the sidebar tree: expands to list its channels
export default function SpaceItem({ space, active, onOpenDialog }) {
  const { channelsBySpace, loadChannels, followSpace } = useWorkspace();
  const [expanded, setExpanded] = useState(active);
  const channels = channelsBySpace[space.id];

  useEffect(() => {
    if (active) setExpanded(true);
  }, [active]);

  useEffect(() => {
    if (!expanded) return;
    followSpace(space.id);
    if (!channels) loadChannels(space.id).catch(() => {});
  }, [expanded, channels, space.id, loadChannels, followSpace]);

  return (
    <li className={`space ${active ? "space--active" : ""}`}>
      <button
        type="button"
        className="space__toggle"
        aria-expanded={expanded}
        onClick={() => setExpanded((e) => !e)}
      >
        <FiChevronRight className="space__chevron" />
        <span className="space__name">{space.name}</span>
      </button>

      {expanded && (
        <div className="space__body">
          <ul className="channel-list">
            {channels?.map((channel) => (
              <li key={channel.id}>
                <NavLink to={`/spaces/${space.id}/${channel.id}`} className="nav-row nav-row--channel">
                  <FiHash className="nav-row__icon" />
                  <span className="nav-row__label">{channel.name}</span>
                </NavLink>
              </li>
            ))}
            {!channels && <li className="nav-row nav-row--muted">Loading…</li>}
          </ul>
          <div className="space__actions">
            <button type="button" className="text-button" onClick={() => onOpenDialog("channel", space)}>
              <FiPlus /> Channel
            </button>
            <button type="button" className="text-button" onClick={() => onOpenDialog("invite", space)}>
              <FiUserPlus /> Invite
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
