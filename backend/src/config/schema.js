// The database tables, written once in SQLite's dialect. db/postgres.js translates the few
// differences (auto-increment keys) so both databases get the same structure.

const tables = [
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
  `
    CREATE TABLE IF NOT EXISTS SpaceInvitations (
      SpaceInvitationID INTEGER PRIMARY KEY AUTOINCREMENT,
      ServerID INTEGER NOT NULL,
      InviterID INTEGER NOT NULL,
      InviteeID INTEGER NOT NULL,
      CreateDate TEXT,
      UNIQUE(ServerID, InviteeID),
      FOREIGN KEY (ServerID) REFERENCES Servers(ServerID) ON DELETE CASCADE,
      FOREIGN KEY (InviterID) REFERENCES Users(UserID) ON DELETE CASCADE,
      FOREIGN KEY (InviteeID) REFERENCES Users(UserID) ON DELETE CASCADE
    )
  `,
  `
    CREATE TABLE IF NOT EXISTS RecoveryCodes (
      RecoveryCodeID INTEGER PRIMARY KEY AUTOINCREMENT,
      UserID INTEGER NOT NULL,
      CodeHash TEXT NOT NULL,
      UsedAt TEXT,
      FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
    )
  
  `,
];

// Columns added after the first release. CREATE TABLE IF NOT EXISTS leaves existing databases
// untouched, so each driver adds any of these that are missing.
const addedColumns = [
  // Encrypted TOTP secret; set while 2FA setup is pending and kept once enabled
  ["Users", "TwoFactorSecret", "TEXT"],
  ["Users", "TwoFactorEnabled", "INTEGER DEFAULT 0"],
  // Last accepted 30-second step, so a code can't be used twice
  ["Users", "TwoFactorLastStep", "INTEGER"],
];

const tableName = (sql) => sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/)[1];

// Column names as written above, e.g. { users: { userid: "UserID", ... } }. PostgreSQL folds
// unquoted names to lower case, so its driver uses this to give rows their original keys back.
const columnNames = () => {
  const names = {};
  for (const sql of tables) {
    for (const line of sql.split("\n")) {
      const match = line.trim().match(/^([A-Z]\w*)\s+(INTEGER|TEXT)/);
      if (match) names[match[1].toLowerCase()] = match[1];
    }
  }
  for (const [, column] of addedColumns) names[column.toLowerCase()] = column;
  return names;
};

// Primary key per table, e.g. { Users: "UserID" } — PostgreSQL needs it for INSERT ... RETURNING
const primaryKeys = () =>
  Object.fromEntries(
    tables.map((sql) => [tableName(sql), sql.match(/(\w+) INTEGER PRIMARY KEY/)[1]])
  );

module.exports = { tables, addedColumns, tableName, columnNames, primaryKeys };
