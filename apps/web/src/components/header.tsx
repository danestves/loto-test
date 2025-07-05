import { Link } from "@tanstack/react-router";


export default function Header() {
  const links = [
    { to: "/", label: "Home" },
    { to: "/transactions", label: "Transactions" },
    { to: "/categories", label: "Categories" },
  ];

  return (
    <div>
      <div className="flex flex-row items-center justify-between px-6 py-4">
        <nav className="flex gap-6 text-lg">
          {links.map(({ to, label }) => {
            return (
              <Link
                key={to}
                to={to}
                className="text-foreground transition-colors hover:text-primary"
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
        </div>
      </div>
      <hr className="border-border" />
    </div>
  );
}
