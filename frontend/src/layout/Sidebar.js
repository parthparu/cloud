import { useState } from "react";
import { NavLink, useMatch } from "react-router-dom";
import { FiLogIn, FiLogOut, FiPlus, FiUsers } from "react-icons/fi";
import { APP_NAME } from "../config";
import { useAuth } from "../context/AuthContext";
import { useWorkspace } from "../context/WorkspaceContext";
import Avatar from "../components/Avatar";
import ThemeToggle from "../components/ThemeToggle";
import CreateChannelDialog from "../dialogs/CreateChannelDialog";
import CreateSpaceDialog from "../dialogs/CreateSpaceDialog";
import InviteDialog from "../dialogs/InviteDialog";
import JoinSpaceDialog from "../dialogs/JoinSpaceDialog";
import SpaceItem from "./SpaceItem";

const CONNECTION_LABEL = { online: "Live", connecting: "Connecting…", reconnecting: "Reconnecting…" };

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { spaces, connection } = useWorkspace();
  // The sidebar sits above the page routes, so read the active space from the URL directly
  const spaceId = useMatch("/spaces/:spaceId/*")?.params.spaceId;
  const [dialog, setDialog] = useState(null);

  const openDialog = (kind, space) => setDialog({ kind, space });
  const closeDialog = () => setDialog(null);

  return (
    <nav className="sidebar" aria-label="Main">
      <header className="sidebar__header">
        <span className="wordmark">{APP_NAME}</span>
        <ThemeToggle />
      </header>

      <div className="sidebar__scroll">
        <NavLink to="/friends" className="nav-row nav-row--primary">
          <FiUsers className="nav-row__icon" />
          <span className="nav-row__label">Friends</span>
        </NavLink>

        <div className="section-heading">
          <span>Spaces</span>
          <span className="section-heading__actions">
            <button type="button" className="icon-button icon-button--small" onClick={() => openDialog("join")} title="Join with an invite" aria-label="Join with an invite">
              <FiLogIn />
            </button>
            <button type="button" className="icon-button icon-button--small" onClick={() => openDialog("space")} title="New space" aria-label="New space">
              <FiPlus />
            </button>
          </span>
        </div>

        {spaces === null && <p className="sidebar__note">Loading spaces…</p>}
        {spaces?.length === 0 && (
          <p className="sidebar__note">
            You're not in any spaces yet. <button type="button" className="link-button" onClick={() => openDialog("space")}>Start one</button> or join with an invite.
          </p>
        )}
        <ul className="space-list">
          {spaces?.map((space) => (
            <SpaceItem key={space.id} space={space} active={String(space.id) === spaceId} onOpenDialog={openDialog} />
          ))}
        </ul>
      </div>

      <footer className="sidebar__footer">
        <Avatar name={user.username} status="online" />
        <div className="me">
          <span className="me__name">{user.username}</span>
          <span className={`me__status me__status--${connection.state}`} title={connection.node ? `Served by ${connection.node}` : undefined}>
            {CONNECTION_LABEL[connection.state]}
            {connection.node && connection.state === "online" && <span className="me__node"> · {connection.node}</span>}
          </span>
        </div>
        <button type="button" className="icon-button" onClick={logout} title="Sign out" aria-label="Sign out">
          <FiLogOut />
        </button>
      </footer>

      {dialog?.kind === "space" && <CreateSpaceDialog onClose={closeDialog} />}
      {dialog?.kind === "join" && <JoinSpaceDialog onClose={closeDialog} />}
      {dialog?.kind === "channel" && <CreateChannelDialog space={dialog.space} onClose={closeDialog} />}
      {dialog?.kind === "invite" && <InviteDialog space={dialog.space} onClose={closeDialog} />}
    </nav>
  );
}
