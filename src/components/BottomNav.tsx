import { NavLink } from 'react-router-dom'

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        ['navItem', isActive ? 'navItemActive' : ''].join(' ').trim()
      }
    >
      {label}
    </NavLink>
  )
}

export function BottomNav() {
  return (
    <nav className="bottomNav" aria-label="Navigation">
      <div className="bottomNavInner">
        <NavItem to="/" label="Översikt" />
        <NavItem to="/expenses" label="Utgifter" />
        <NavItem to="/categories" label="Kategorier" />
      </div>
    </nav>
  )
}


