import React from 'react';
import { Link } from 'wouter';

interface SidebarProps {
  children: React.ReactNode;
}

const Sidebar = ({ children }: SidebarProps) => {
  return <div className="flex h-screen">{children}</div>;
};

interface SidebarContentProps {
  children: React.ReactNode;
}

const SidebarContent = ({ children }: SidebarContentProps) => {
  return <div className="w-64 border-r bg-gray-50 p-4">{children}</div>;
};

interface MainContentProps {
  children: React.ReactNode;
}

const MainContent = ({ children }: MainContentProps) => {
  return <div className="flex-1 p-6 overflow-auto">{children}</div>;
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Sidebar>
      <SidebarContent>
        <h1 className="text-xl font-bold mb-4">My Diary</h1>
        <nav className="mb-6">
          <ul className="space-y-2">
            <li>
              <Link href="/">
                <a className="block px-3 py-2 rounded hover:bg-gray-200">
                  All Entries
                </a>
              </Link>
            </li>
            <li>
              <Link href="/new">
                <a className="block px-3 py-2 rounded hover:bg-gray-200">
                  New Entry
                </a>
              </Link>
            </li>
          </ul>
        </nav>
        <div className="border-t pt-4">
          <div className="mb-4">
            <div className="text-sm font-medium mb-1">Search entries</div>
            <div>
              <form>
                <div className="flex">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="border px-3 py-1 rounded-l flex-1"
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
      </SidebarContent>
      <MainContent>{children}</MainContent>
    </Sidebar>
  );
};

export default Layout;