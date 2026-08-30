import Image from "next/image";
import jhubLogo from "../public/jhubafrica_logo.jpg";
import jkuatlogo from "../public/jkuat.jpeg";

const COLUMNS = [
  {
    title: "About JHUB",
    links: [
      {
        label: "About JHUB",
        href: "https://jhubafrica.com/about-jhub/",
      },
      {
        label: "Innovations",
        href: "https://jhubafrica.com/innovations/",
      },
      {
        label: "Programs",
        href: "https://jhubafrica.com/programs-events/",
      },
      {
        label: "Get Involved",
        href: "https://jhubafrica.com/get-involved/",
      },
      {
        label: "News & Updates",
        href: "https://jhubafrica.com/news/",
      },
    ],
  },
  {
    title: "Resources",
    links: [
      {
        label: "Official Website",
        href: "https://jhubafrica.com/",
      },
      {
        label: "JKUAT",
        href: "https://www.jkuat.ac.ke",
      },
      {
        label: "Research",
        href: "https://jhubafrica.com/innovations/",
      },
      {
        label: "Contact",
        href: "https://jhubafrica.com/contact-us/",
      },
      {
        label: "News",
        href: "https://jhubafrica.com/news/",
      },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-line bg-[#2a2c1f] pb-8 pt-14">
      <div className="wrap mx-auto max-w-wrap px-5">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-[3fr_1fr_1fr_1.3fr]">
          {/* Logo & About */}
          <div>
            <div className="mb-4 flex items-center gap-4">
              {/* JHUB Logo */}
              <div className="relative h-14 w-14 overflow-hidden rounded-lg bg-white flex-shrink-0">
                <Image
                  src={jhubLogo}
                  alt="JHUB Africa Logo"
                  fill
                  className="object-contain p-1"
                />
              </div>

              {/* JKUAT Logo */}
              <div className="relative h-14 w-14 overflow-hidden rounded-lg bg-white flex-shrink-0">
                <Image
                  src={jkuatlogo}
                  alt="JKUAT Logo"
                  fill
                  className="object-contain p-1"
                />
              </div>

              <div>
                <h3 className="font-display text-xl font-semibold text-white">
                  JHUB Africa
                </h3>
                <p className="text-[0.55rem] uppercase tracking-[0.2em] text-[#9a9c8a]">
                  In Partnership With JKUAT
                </p>
                <p className="text-[0.55rem] uppercase tracking-[0.2em] text-[#9a9c8a] mt-0.5">
                  Innovation • Research • Entrepreneurship
                </p>
              </div>
            </div>

            <p className="max-w-[52ch] text-[0.87rem] leading-7 text-[#c8c9b8]">
              JHUB Africa is an innovation and entrepreneurship hub in Jomo
              Kenyatta University of Agriculture and Technology (JKUAT). It
              empowers students, researchers, startups, and industry partners
              through research commercialization, startup incubation, digital
              innovation, capacity building, and strategic partnerships to
              create technology-driven solutions for sustainable development
              across Africa.
            </p>
          </div>

          {/* Navigation */}
          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h4 className="mb-4 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#9a9c8a]">
                {column.title}
              </h4>

              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={
                        link.href.startsWith("http") ? "_blank" : undefined
                      }
                      rel={
                        link.href.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className="text-[0.88rem] text-[#c8c9b8] transition-colors hover:text-accent"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-[#9a9c8a]">
              Contact
            </h4>

            <ul className="space-y-3 text-[0.88rem] text-[#c8c9b8]">
              <li>
                <a
                  href="mailto:info.jhub@jkuat.ac.ke"
                  className="transition-colors hover:text-accent"
                >
                  info.jhub@jkuat.ac.ke
                </a>
              </li>

              <li>
                <a
                  href="tel:+25467521814"
                  className="transition-colors hover:text-accent"
                >
                  +254 116 900 601
                </a>
              </li>

              <li>
                JHUB Africa
                <br />
                Jomo Kenyatta University of Agriculture and Technology
                <br />
                Juja, Kiambu County
                <br />
                Kenya
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-[#47493d] pt-6 md:flex-row md:items-center">
          <p className="text-[0.75rem] text-[#9a9c8a]">
            © {new Date().getFullYear()} JHUB Africa Weather API. All rights
            reserved.
          </p>

          <div className="flex flex-wrap items-center gap-3 text-[0.75rem]">
            <a
              href="#"
              className="text-[#9a9c8a] transition-colors hover:text-white"
            >
              Privacy Policy
            </a>

            <span className="text-[#55584b]">•</span>

            <a
              href="#"
              className="text-[#9a9c8a] transition-colors hover:text-white"
            >
              Terms of Service
            </a>

            <span className="text-[#55584b]">•</span>

            <span className="text-[#9a9c8a]">
              Powered by JHUB Africa • JKUAT
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
