import { useLocation } from "react-router-dom";
import { APP_NAME } from "../../config";
import ThemeToggle from "../../components/ThemeToggle";

// Where to go after signing in: back to the page that sent us here (e.g. an invite link)
export const useReturnPath = () => new URLSearchParams(useLocation().search).get("next") || "/friends";

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth">
      <aside className="auth__aside">
        <span className="wordmark wordmark--large">{APP_NAME}</span>
        <p className="auth__pitch">Group chat for people who already know each other.</p>
        <ul className="auth__points">
          <li>Spaces for each group, channels for each topic</li>
          <li>Friends by username — no phone number</li>
          <li>Messages arrive the moment they're sent</li>
        </ul>
      </aside>
      <section className="auth__panel">
        <div className="auth__toolbar">
          <span className="wordmark auth__mobile-brand">{APP_NAME}</span>
          <ThemeToggle />
        </div>
        <div className="auth__form-wrap">
          <h1 className="auth__title">{title}</h1>
          <p className="auth__subtitle">{subtitle}</p>
          {children}
          {footer && <p className="auth__footer">{footer}</p>}
        </div>
      </section>
    </div>
  );
}
