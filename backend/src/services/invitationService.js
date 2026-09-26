const db = require('../config/db');

// Invitations sent to a specific user (by username). A row exists only while the invitation is
// pending: accepting adds a ServerMembers row and deletes this one; declining deletes it.

exports.create = async ({ serverId, inviterId, inviteeId }) => {
  const [result] = await db.execute(
    'INSERT INTO SpaceInvitations (ServerID, InviterID, InviteeID, CreateDate) VALUES (?, ?, ?, ?)',
    [serverId, inviterId, inviteeId, new Date()]
  );
  return result.insertId;
};

exports.getById = async (invitationId) => {
  const [rows] = await db.execute('SELECT * FROM SpaceInvitations WHERE SpaceInvitationID = ?', [invitationId]);
  return rows[0] || null;
};

exports.exists = async (serverId, inviteeId) => {
  const [rows] = await db.execute(
    'SELECT SpaceInvitationID FROM SpaceInvitations WHERE ServerID = ? AND InviteeID = ?',
    [serverId, inviteeId]
  );
  return rows.length > 0;
};

// Pending invitations for one user, with what the UI needs to show them
exports.listForInvitee = async (inviteeId) => {
  const [rows] = await db.execute(
    `SELECT i.SpaceInvitationID, i.ServerID, i.CreateDate, s.ServerName, u.Username AS InviterName
     FROM SpaceInvitations i
     JOIN Servers s ON s.ServerID = i.ServerID
     JOIN Users u ON u.UserID = i.InviterID
     WHERE i.InviteeID = ?
     ORDER BY i.SpaceInvitationID DESC`,
    [inviteeId]
  );
  return rows;
};

exports.remove = async (invitationId) => {
  const [result] = await db.execute('DELETE FROM SpaceInvitations WHERE SpaceInvitationID = ?', [invitationId]);
  return result.affectedRows > 0;
};

// Either person has blocked the other
exports.isBlocked = async (userA, userB) => {
  const [rows] = await db.execute(
    `SELECT FriendshipID FROM Friends
     WHERE FriendshipStatus = 'Blocked'
       AND ((UserID1 = ? AND UserID2 = ?) OR (UserID1 = ? AND UserID2 = ?))`,
    [userA, userB, userB, userA]
  );
  return rows.length > 0;
};
