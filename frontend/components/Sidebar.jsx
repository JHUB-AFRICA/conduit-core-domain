"use client";

import { useState } from "react";
import { nav } from "../libs/docsData";

export default function Sidebar({ active }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-4 right-4 z-50 bg-ink text-white rounded-full p-3 shadow-lg"
      >
        <span className="text-xl">📖</span>
      </button>

      {/* Sidebar */}
      <aside
        className={`
          w-64 shrink-0
          lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto
          fixed left-0 top-0 z-40 h-full bg-bg-soft border-r border-line p-4
          transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="mb-6">
          <p className="font-mono text-xs uppercase tracking-wider text-accent font-semibold">
            Documentation
          </p>
          <p className="text-sm text-ink-soft">v1.0.0</p>
        </div>

        <nav className="space-y-4">
          {nav.map((section) => (
            <div key={section.title}>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-2">
                {section.title}
              </p>

              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className={`
                        block px-3 py-2 text-sm rounded-md transition-all
                        ${
                          active === item.id
                            ? "bg-accent text-white font-medium shadow-sm"
                            : "text-ink-soft hover:bg-bg hover:text-ink"
                        }
                      `}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="mt-8 pt-4 border-t border-line">
          <a
            href="/data-portal"
            className="block w-full text-center text-sm bg-accent text-white rounded-md px-4 py-2.5 hover:bg-[#a84d24] transition-colors"
          >
            🌤️ Data Portal
          </a>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
