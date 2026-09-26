const bcrypt = require("bcryptjs");

// Demo data for local development: three users, a space, a couple of messages.
// Runs only on an empty database, and only when enabled — the demo password is in this file, so
// it must never be seeded into a database reachable from the internet (see db.js).
const DEMO_PASSWORD = "password123";

module.exports = async function seedDemoData({ execute }) {
  const [rows] = await execute("SELECT COUNT(*) AS count FROM Users");
  if (Number(rows[0].count) > 0) return false;

  const password = bcrypt.hashSync(DEMO_PASSWORD, 10);
  const now = new Date().toISOString();

  const insert = async (sql, params) => (await execute(sql, params))[0].insertId;

  const addUser = (username, about, status, onlineStatus) =>
    insert(
      "INSERT INTO Users (Username, Email, Password, JoinDate, OnlineStatus, AboutMe, Status) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [username, `${username}@example.com`, password, now, onlineStatus, about, status]
    );

  // Two copies starting at once on an empty database both reach this point; the first insert
  // decides the winner and the other copy steps aside (users come first, so nothing is half-done)
  let parth;
  try {
    parth = await addUser("parth", "Building a local-first Discord clone", "Shipping", "Online");
  } catch (error) {
    const alreadySeeded = error.code === "23505" || /UNIQUE constraint failed/.test(error.message);
    if (alreadySeeded) return false;
    throw error;
  }
  const ava = await addUser("ava", "Designing the onboarding flow", "Available", "Online");
  const milo = await addUser("milo", "Reviewing backend routes", "Heads down", "Idle");

  const serverId = await insert(
    "INSERT INTO Servers (ServerName, ServerDesc, ServerOwnerID, CreateDate) VALUES (?, ?, ?, ?)",
    ["Builders Lab", "Local demo workspace", parth, now]
  );

  for (const [userId, role] of [[parth, "Admin"], [ava, "Member"], [milo, "Member"]]) {
    await execute("INSERT INTO ServerMembers (ServerID, UserID, Role, JoinDate) VALUES (?, ?, ?, ?)", [
      serverId,
      userId,
      role,
      now,
    ]);
  }

  const generalId = await insert(
    "INSERT INTO Channels (ServerID, ChannelName, ChannelType, ChannelDescription, IsPrivate, ChannelOwnerID, CreateDate) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [serverId, "general", "Text", "Daily collaboration and quick questions", 0, parth, now]
  );

  const addMessage = (userId, content, date) =>
    execute("INSERT INTO Messages (ChannelID, UserID, MessageContent, MessageDate) VALUES (?, ?, ?, ?)", [
      generalId,
      userId,
      content,
      date,
    ]);

  await addMessage(ava, "Morning team. The database is set up, so this project boots on its own.", now);
  await addMessage(parth, "Perfect. Next step is wiring the frontend directly to these live APIs.", new Date(Date.now() + 60_000).toISOString());

  await execute("INSERT INTO Friends (UserID1, UserID2, FriendshipStatus, FriendshipDate) VALUES (?, ?, ?, ?)", [
    parth,
    ava,
    "Accepted",
    now,
  ]);

  return true;
};
