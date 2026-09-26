import { groupMessages, initials, toMessage } from "./format";

const at = (minutes) => new Date(Date.UTC(2026, 8, 26, 10, minutes)).toISOString();

test("normalises REST rows and socket payloads to the same shape", () => {
  const fromRest = toMessage({ MessageID: 1, ChannelID: 2, UserID: 3, Username: "ava", MessageContent: "hi", MessageDate: at(0) });
  const fromSocket = toMessage({ id: 1, channelId: 2, userId: 3, username: "ava", content: "hi", createdAt: at(0) });
  expect(fromRest).toEqual(fromSocket);
});

test("groups consecutive messages from one author within five minutes", () => {
  const messages = [
    { id: 1, userId: 1, username: "ava", createdAt: at(0) },
    { id: 2, userId: 1, username: "ava", createdAt: at(3) },
    { id: 3, userId: 2, username: "milo", createdAt: at(4) },
    { id: 4, userId: 2, username: "milo", createdAt: at(15) },
  ];
  expect(groupMessages(messages).map((g) => g.messages.map((m) => m.id))).toEqual([[1, 2], [3], [4]]);
});

test("builds initials from usernames", () => {
  expect(initials("ava")).toBe("AV");
  expect(initials("parth.sangani")).toBe("PS");
});
