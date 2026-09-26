const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const { DatabaseSync } = require("node:sqlite");

const dataDir = path.resolve(__dirname, "../../data");
const databasePath = path.resolve(
  process.env.SQLITE_PATH || path.join(dataDir, "chat.sqlite")
);

fs.mkdirSync(path.dirname(databasePath), { recursive: true });

const sqlite = new DatabaseSync(databasePath);
sqlite.exec("PRAGMA foreign_keys = ON;");
sqlite.exec("PRAGMA journal_mode = WAL;");

const schemaStatements = [
  `
    CREATE TABLE IF NOT EXISTS Users (
      UserID INTEGER PRIMARY KEY AUTOINCREMENT,
      Username TEXT NOT NULL UNIQUE,
      Email TEXT NOT NULL UNIQUE,
      Password TEXT NOT NULL,
      JoinDate TEXT,
      LastLoginDate TEXT,
      OnlineStatus TEXT DEFAULT 'Offline',
      ProfilePicture TEXT,
      AboutMe TEXT,
      Status TEXT
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS Servers (
      ServerID INTEGER PRIMARY KEY AUTOINCREMENT,
      ServerName TEXT NOT NULL,
      ServerDesc TEXT,
      ServerOwnerID INTEGER NOT NULL,
      ServerIcon TEXT,
      CreateDate TEXT,
      FOREIGN KEY (ServerOwnerID) REFERENCES Users(UserID)
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS ServerMembers (
      ServerMemberID INTEGER PRIMARY KEY AUTOINCREMENT,
      ServerID INTEGER NOT NULL,
      UserID INTEGER NOT NULL,
      Role TEXT NOT NULL,
      JoinDate TEXT,
      UNIQUE(ServerID, UserID),
      FOREIGN KEY (ServerID) REFERENCES Servers(ServerID) ON DELETE CASCADE,
      FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS Channels (
      ChannelID INTEGER PRIMARY KEY AUTOINCREMENT,
      ServerID INTEGER NOT NULL,
      ChannelName TEXT NOT NULL,
      ChannelType TEXT NOT NULL,
      ChannelDescription TEXT,
      IsPrivate INTEGER DEFAULT 0,
      ChannelOwnerID INTEGER,
      CreateDate TEXT,
      FOREIGN KEY (ServerID) REFERENCES Servers(ServerID) ON DELETE CASCADE,
      FOREIGN KEY (ChannelOwnerID) REFERENCES Users(UserID)
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS Messages (
      MessageID INTEGER PRIMARY KEY AUTOINCREMENT,
      ChannelID INTEGER NOT NULL,
      UserID INTEGER NOT NULL,
      MessageContent TEXT,
      MessageDate TEXT,
      FOREIGN KEY (ChannelID) REFERENCES Channels(ChannelID) ON DELETE CASCADE,
      FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS Attachments (
      AttachmentID INTEGER PRIMARY KEY AUTOINCREMENT,
      MessageID INTEGER NOT NULL,
      UserID INTEGER NOT NULL,
      FileURL TEXT NOT NULL,
      FileType TEXT,
      FileSize INTEGER,
      UploadDate TEXT,
      FOREIGN KEY (MessageID) REFERENCES Messages(MessageID) ON DELETE CASCADE,
      FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS ServerInvites (
      InviteID INTEGER PRIMARY KEY AUTOINCREMENT,
      ServerID INTEGER NOT NULL,
      InviteCode TEXT NOT NULL UNIQUE,
      CreatorID INTEGER NOT NULL,
      CreateDate TEXT,
      ExpiryDate TEXT,
      FOREIGN KEY (ServerID) REFERENCES Servers(ServerID) ON DELETE CASCADE,
      FOREIGN KEY (CreatorID) REFERENCES Users(UserID) ON DELETE CASCADE
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS Friends (
      FriendshipID INTEGER PRIMARY KEY AUTOINCREMENT,
      UserID1 INTEGER NOT NULL,
      UserID2 INTEGER NOT NULL,
      FriendshipStatus TEXT NOT NULL,
      FriendshipDate TEXT,
      FOREIGN KEY (UserID1) REFERENCES Users(UserID) ON DELETE CASCADE,
      FOREIGN KEY (UserID2) REFERENCES Users(UserID) ON DELETE CASCADE
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS DirectMessageChannels (
      ChannelID INTEGER PRIMARY KEY AUTOINCREMENT,
      User1ID INTEGER,
      User2ID INTEGER,
      IsGroup INTEGER DEFAULT 0,
      GroupName TEXT,
      GroupIcon TEXT,
      OwnerID INTEGER,
      CreateDate TEXT,
      FOREIGN KEY (User1ID) REFERENCES Users(UserID) ON DELETE CASCADE,
      FOREIGN KEY (User2ID) REFERENCES Users(UserID) ON DELETE CASCADE,
      FOREIGN KEY (OwnerID) REFERENCES Users(UserID) ON DELETE CASCADE
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS DirectMessages (
      MessageID INTEGER PRIMARY KEY AUTOINCREMENT,
      ChannelID INTEGER NOT NULL,
      UserID INTEGER NOT NULL,
      MessageContent TEXT,
      MessageDate TEXT,
      FOREIGN KEY (ChannelID) REFERENCES DirectMessageChannels(ChannelID) ON DELETE CASCADE,
      FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS GroupDMUsers (
      GroupDMUserID INTEGER PRIMARY KEY AUTOINCREMENT,
      ChannelID INTEGER NOT NULL,
      UserID INTEGER NOT NULL,
      JoinDate TEXT,
      UNIQUE(ChannelID, UserID),
      FOREIGN KEY (ChannelID) REFERENCES DirectMessageChannels(ChannelID) ON DELETE CASCADE,
      FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS VoiceChannels (
      VoiceChannelID INTEGER PRIMARY KEY AUTOINCREMENT,
      ChannelID INTEGER,
      ServerID INTEGER,
      ChannelName TEXT,
      CreateDate TEXT,
      FOREIGN KEY (ChannelID) REFERENCES Channels(ChannelID) ON DELETE CASCADE,
      FOREIGN KEY (ServerID) REFERENCES Servers(ServerID) ON DELETE CASCADE
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS VoiceChannelParticipants (
      ParticipantID INTEGER PRIMARY KEY AUTOINCREMENT,
      VoiceChannelID INTEGER NOT NULL,
      UserID INTEGER NOT NULL,
      JoinTime TEXT,
      LeaveTime TEXT,
      IsMuted INTEGER DEFAULT 0,
      IsDeafened INTEGER DEFAULT 0,
      FOREIGN KEY (VoiceChannelID) REFERENCES VoiceChannels(VoiceChannelID) ON DELETE CASCADE,
      FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
    )
  `,
];

for (const statement of schemaStatements) {
  sqlite.exec(statement);
}

const seedDatabase = () => {
  const countRow = sqlite.prepare("SELECT COUNT(*) AS count FROM Users").get();
  if (countRow.count > 0) {
    return;
  }

  const password = bcrypt.hashSync("password123", 10);
  const now = new Date().toISOString();

  const insertUser = sqlite.prepare(
    `INSERT INTO Users
      (Username, Email, Password, JoinDate, OnlineStatus, AboutMe, Status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  );

  const userIds = [
    insertUser.run(
      "parth",
      "parth@example.com",
      password,
      now,
      "Online",
      "Building a local-first Discord clone",
      "Shipping"
    ).lastInsertRowid,
    insertUser.run(
      "ava",
      "ava@example.com",
      password,
      now,
      "Online",
      "Designing the onboarding flow",
      "Available"
    ).lastInsertRowid,
    insertUser.run(
      "milo",
      "milo@example.com",
      password,
      now,
      "Idle",
      "Reviewing backend routes",
      "Heads down"
    ).lastInsertRowid,
  ].map((value) => Number(value));

  const serverId = Number(
    sqlite
      .prepare(
        `INSERT INTO Servers
          (ServerName, ServerDesc, ServerOwnerID, CreateDate)
         VALUES (?, ?, ?, ?)`
      )
      .run("Builders Lab", "Local SQLite demo workspace", userIds[0], now)
      .lastInsertRowid
  );

  const insertMember = sqlite.prepare(
    "INSERT INTO ServerMembers (ServerID, UserID, Role, JoinDate) VALUES (?, ?, ?, ?)"
  );
  insertMember.run(serverId, userIds[0], "Admin", now);
  insertMember.run(serverId, userIds[1], "Member", now);
  insertMember.run(serverId, userIds[2], "Member", now);

  const generalChannelId = Number(
    sqlite
      .prepare(
        `INSERT INTO Channels
          (ServerID, ChannelName, ChannelType, ChannelDescription, IsPrivate, ChannelOwnerID, CreateDate)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        serverId,
        "general",
        "Text",
        "Daily collaboration and quick questions",
        0,
        userIds[0],
        now
      ).lastInsertRowid
  );

  const voiceChannelId = Number(
    sqlite
      .prepare(
        `INSERT INTO Channels
          (ServerID, ChannelName, ChannelType, ChannelDescription, IsPrivate, ChannelOwnerID, CreateDate)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        serverId,
        "standup",
        "Voice",
        "Jump in for quick syncs",
        0,
        userIds[0],
        now
      ).lastInsertRowid
  );

  sqlite
    .prepare(
      "INSERT INTO VoiceChannels (ChannelID, ServerID, ChannelName, CreateDate) VALUES (?, ?, ?, ?)"
    )
    .run(voiceChannelId, serverId, "standup", now);

  const insertMessage = sqlite.prepare(
    "INSERT INTO Messages (ChannelID, UserID, MessageContent, MessageDate) VALUES (?, ?, ?, ?)"
  );
  insertMessage.run(
    generalChannelId,
    userIds[1],
    "Morning team. SQLite is now local, so this project can boot without MySQL.",
    now
  );
  insertMessage.run(
    generalChannelId,
    userIds[0],
    "Perfect. Next step is wiring the frontend directly to these live APIs.",
    new Date(Date.now() + 60_000).toISOString()
  );

  const dmChannelId = Number(
    sqlite
      .prepare(
        "INSERT INTO DirectMessageChannels (User1ID, User2ID, CreateDate) VALUES (?, ?, ?)"
      )
      .run(userIds[0], userIds[1], now).lastInsertRowid
  );

  sqlite
    .prepare(
      "INSERT INTO DirectMessages (ChannelID, UserID, MessageContent, MessageDate) VALUES (?, ?, ?, ?)"
    )
    .run(dmChannelId, userIds[1], "Ping me when the socket client is wired up.", now);

  sqlite
    .prepare(
      "INSERT INTO Friends (UserID1, UserID2, FriendshipStatus, FriendshipDate) VALUES (?, ?, ?, ?)"
    )
    .run(userIds[0], userIds[1], "Accepted", now);
};

seedDatabase();

const normalizeValue = (value) => {
  // Optional fields arrive as undefined; SQLite can only bind NULL
  if (value === undefined) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "boolean") {
    return value ? 1 : 0;
  }

  return value;
};

const isSelectQuery = (sql) => /^\s*(select|pragma|with)\b/i.test(sql);

const execute = async (sql, params = []) => {
  const statement = sqlite.prepare(sql);
  const values = params.map(normalizeValue);

  if (isSelectQuery(sql)) {
    return [statement.all(...values)];
  }

  const result = statement.run(...values);
  return [
    {
      insertId:
        result.lastInsertRowid === undefined
          ? undefined
          : Number(result.lastInsertRowid),
      affectedRows: Number(result.changes || 0),
      changes: Number(result.changes || 0),
    },
  ];
};

const getConnection = async () => {
  sqlite.prepare("SELECT 1").get();
  return {
    release() {},
  };
};

module.exports = {
  execute,
  getConnection,
  path: databasePath,
  raw: sqlite,
};
