const invitationService = require('../services/invitationService');
const serverService = require('../services/serverService');
const userService = require('../services/userService');
const { getIo } = require('../socket/socket');

const toInvitation = (row) => ({
  id: row.SpaceInvitationID,
  space: { id: row.ServerID, name: row.ServerName },
  invitedBy: row.InviterName,
  createdAt: row.CreateDate
});

// GET /invitations — pending invitations for the signed-in user
exports.list = async (req, res, next) => {
  try {
    const rows = await invitationService.listForInvitee(req.user.id);
    res.status(200).json({ invitations: rows.map(toInvitation) });
  } catch (error) {
    next(error);
  }
};

// POST /invitations { serverId, username } — invite someone by username
exports.create = async (req, res, next) => {
  try {
    const serverId = Number(req.body.serverId);
    const username = String(req.body.username || '').trim();
    const inviterId = req.user.id;

    if (!serverId || !username) {
      return res.status(400).json({ message: 'Choose a space and enter a username' });
    }

    if (!(await serverService.isServerMember(serverId, inviterId))) {
      return res.status(403).json({ message: 'You are not a member of this space' });
    }

    const users = await userService.getUserByUsername(username);
    // Same answer for "no such user" and "blocked", so blocks aren't revealed
    const cantInvite = () => res.status(404).json({ message: `Couldn't invite ${username}. Check the username.` });
    if (users.length === 0) return cantInvite();

    const invitee = users[0];
    if (invitee.UserID === inviterId) {
      return res.status(400).json({ message: "You're already in this space" });
    }
    if (await invitationService.isBlocked(inviterId, invitee.UserID)) return cantInvite();

    if (await serverService.isServerMember(serverId, invitee.UserID)) {
      return res.status(400).json({ message: `${invitee.Username} is already in this space` });
    }
    if (await invitationService.exists(serverId, invitee.UserID)) {
      return res.status(400).json({ message: `${invitee.Username} already has an invitation to this space` });
    }

    const invitationId = await invitationService.create({ serverId, inviterId, inviteeId: invitee.UserID });

    // Show it in their sidebar straight away if they're online
    const [inviterRows, servers] = await Promise.all([userService.getUserById(inviterId), serverService.getServerById(serverId)]);
    getIo().to(`user:${invitee.UserID}`).emit('invitation:new', {
      id: invitationId,
      space: { id: serverId, name: servers[0].ServerName },
      invitedBy: inviterRows[0].Username,
      createdAt: new Date().toISOString()
    });

    res.status(201).json({ message: `Invitation sent to ${invitee.Username}` });
  } catch (error) {
    next(error);
  }
};

// Only the person invited may accept or decline
const loadOwnInvitation = async (req, res) => {
  const invitation = await invitationService.getById(req.params.invitationId);
  if (!invitation || invitation.InviteeID !== req.user.id) {
    res.status(404).json({ message: 'Invitation not found' });
    return null;
  }
  return invitation;
};

// POST /invitations/:invitationId/accept
exports.accept = async (req, res, next) => {
  try {
    const invitation = await loadOwnInvitation(req, res);
    if (!invitation) return;

    if (!(await serverService.isServerMember(invitation.ServerID, req.user.id))) {
      await serverService.addMember(invitation.ServerID, req.user.id, 'Member');
    }
    await invitationService.remove(invitation.SpaceInvitationID);

    res.status(200).json({ space: { id: invitation.ServerID } });
  } catch (error) {
    next(error);
  }
};

// DELETE /invitations/:invitationId — decline
exports.decline = async (req, res, next) => {
  try {
    const invitation = await loadOwnInvitation(req, res);
    if (!invitation) return;

    await invitationService.remove(invitation.SpaceInvitationID);
    res.status(200).json({ message: 'Invitation declined' });
  } catch (error) {
    next(error);
  }
};
