// Invite delivery — PLACEHOLDER.
//
// No email provider is wired up yet. This module is the single seam where one
// will go (e.g. a free-tier transactional email API). Until then it records the
// request and reports that nothing was sent, so the UI can say so honestly.

exports.isConfigured = () => false;

exports.sendInviteEmail = async ({ to, inviteCode, serverId }) => {
  console.log(`[invite] email delivery not configured; would send invite ${inviteCode} for server ${serverId} to ${to}`);

  return {
    delivered: false,
    reason: 'Email delivery is not set up yet. Copy the invite link and share it yourself.',
  };
};
