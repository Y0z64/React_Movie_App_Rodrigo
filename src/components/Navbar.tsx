import { Link } from "wouter";
import { ModeToggle } from "./mode-toggle";
import { Input } from "./ui/input";
import Onboarding from "./User";

type Props = {
  query: string;
  setQuery: (query: string) => void;
}

export default function Navbar({query, setQuery}: Props) {
  return (
    <nav className="h-16 mb-6 shadow-md sticky top-0 z-100 bg-background px-4 flex justify-around outline-dotted items-center lg:gap-6 gap-4">
      <div className="w-fit gap-3 flex justify-around items-center">
        <Link href="/" className={"text-lg"}>
          Home
        </Link>
        <Link href="/search" className={"text-lg"}>
          Search
        </Link>
        <Link href="/tv" className={"text-lg"}>
          Dashboard
        </Link>
      </div>
      <div className="w-fit gap-2 flex justify-between items-center">
        <Input
          type="search"
          placeholder="Search"
          className="w-full min-w-[300px] max-w-[400px]"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <ModeToggle />
        <Onboarding/>
      </div>
    </nav>
  );
}


type NavLinkProps = {
  href: string;
  children: React.ReactNode;
}

export function NavLink({href, children}: NavLinkProps) {
  return (
    <Link href={href}>
      {children}
    </Link>

  );
}