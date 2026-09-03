"use client";

// აპლიკაციის კარკასი: ზედა ნავიგაცია + მთავარი შიგთავსი.
import Link from "next/link";
import { usePathname } from "next/navigation";
import styled from "styled-components";

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/rooms", label: "Rooms" },
  { href: "/schedule", label: "Schedule" },
  { href: "/bookings", label: "Bookings" },
];

const Header = styled.header`
  position: sticky;
  top: 0;
  z-index: 10;
  background: ${({ theme }) => theme.color.surface};
  border-bottom: 1px solid ${({ theme }) => theme.color.border};
`;

const Bar = styled.div`
  max-width: ${({ theme }) => theme.maxWidth};
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.space(4)};
  padding: ${({ theme }) => theme.space(3)} ${({ theme }) => theme.space(4)};

  @media (max-width: ${({ theme }) => theme.breakpoint.sm}) {
    flex-direction: column;
    align-items: stretch;
    gap: ${({ theme }) => theme.space(2)};
  }
`;

const Brand = styled(Link)`
  font-weight: 700;
  color: ${({ theme }) => theme.color.text};
  white-space: nowrap;
`;

const Nav = styled.nav`
  display: flex;
  gap: ${({ theme }) => theme.space(1)};
  overflow-x: auto;
`;

const NavLink = styled(Link)<{ $active: boolean }>`
  padding: ${({ theme }) => theme.space(2)} ${({ theme }) => theme.space(3)};
  border-radius: ${({ theme }) => theme.radius.sm};
  font-size: 0.9rem;
  font-weight: 600;
  white-space: nowrap;
  color: ${({ theme, $active }) =>
    $active ? theme.color.primary : theme.color.textMuted};
  background: ${({ theme, $active }) =>
    $active ? theme.color.primarySoft : "transparent"};

  &:hover {
    color: ${({ theme }) => theme.color.primary};
  }
`;

const Main = styled.main`
  min-height: calc(100vh - 61px);
`;

const isActive = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname.startsWith(href);

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      <Header>
        <Bar>
          <Brand href="/">🗓️ Meeting Rooms</Brand>
          <Nav>
            {NAV.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                $active={isActive(pathname, item.href)}
              >
                {item.label}
              </NavLink>
            ))}
          </Nav>
        </Bar>
      </Header>
      <Main>{children}</Main>
    </>
  );
}
