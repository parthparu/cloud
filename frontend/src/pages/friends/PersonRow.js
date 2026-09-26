import Avatar from "../../components/Avatar";

// A person with presence, a one-line detail, and action buttons on the right
export default function PersonRow({ person, detail, children }) {
  return (
    <li className="person">
      <Avatar name={person.username} status={person.onlineStatus} />
      <div className="person__text">
        <span className="person__name">{person.username}</span>
        <span className="person__detail">{detail}</span>
      </div>
      <div className="person__actions">{children}</div>
    </li>
  );
}
