import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPortal } from "react-dom";
import {
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  FileText,
} from "lucide-react";
import CedramWordmark from "../components/CedramWordmark";
import CedramMark from "../components/CedramMark";

function Navbar() {
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [aboutOpen, setAboutOpen] = useState(false);
  const aboutRef = useRef(null);
  const aboutCloseTimerRef = useRef(null);

  const isAdminRoute = useMemo(
    () => location.pathname.startsWith("/admin"),
    [location.pathname]
  );

  const openAbout = () => {
    if (aboutCloseTimerRef.current) clearTimeout(aboutCloseTimerRef.current);
    setAboutOpen(true);
  };

  const scheduleCloseAbout = () => {
    if (aboutCloseTimerRef.current) clearTimeout(aboutCloseTimerRef.current);
    aboutCloseTimerRef.current = setTimeout(() => setAboutOpen(false), 140);
  };

  useEffect(() => {
    return () => {
      if (aboutCloseTimerRef.current) clearTimeout(aboutCloseTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 18);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setAboutOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (!aboutOpen) return;

    const onMouseDown = (e) => {
      if (!aboutRef.current) return;
      if (!aboutRef.current.contains(e.target)) setAboutOpen(false);
    };

    const onKeyDown = (e) => {
      if (e.key === "Escape") setAboutOpen(false);
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [aboutOpen]);

  const isActive = (path) => location.pathname === path;

  const inAboutGroup = useMemo(() => {
    return (
      location.pathname === "/about" ||
      location.pathname === "/programs" ||
      location.pathname === "/training"
    );
  }, [location.pathname]);

  const navClass = isAdminRoute
    ? "bg-surface/95 text-textmain border-b border-border shadow-sm backdrop-blur-md"
    : classNames(
        "border-b backdrop-blur-md transition-all duration-300",
        scrolled
          ? "bg-primary/95 text-white border-white/10 shadow-lg"
          : "bg-primary/90 text-white border-white/10 shadow-sm"
      );

  const linkBase =
    "relative whitespace-nowrap rounded-md px-1 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary/40";

  const publicLinkColor = (path) =>
    isActive(path) ? "text-accent" : "text-white/85 hover:text-white";

  const adminLinkColor = (path) =>
    isActive(path) ? "text-secondary" : "text-textmuted hover:text-textmain";

  const desktopLinkColor = (path) =>
    isAdminRoute ? adminLinkColor(path) : publicLinkColor(path);

  const mobileDrawer = isOpen
    ? createPortal(
        <div className="fixed inset-0 z-[2147483647] lg:hidden">
          <button
            className="absolute inset-0 bg-black/55"
            aria-label="Close menu backdrop"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute top-0 right-0 h-full w-[90%] max-w-sm overflow-y-auto bg-surface p-6 text-textmain shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <Link
                to="/"
                className="flex items-center"
                onClick={() => setIsOpen(false)}
                aria-label="CEDRAM home"
              >
                <div className="flex items-center gap-3">
                  <CedramMark className="h-9 w-9 shrink-0" light={false} />
                  <CedramWordmark className="h-6 w-auto" light={false} />
                </div>
              </Link>

              <button
                onClick={() => setIsOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border text-textmain transition hover:bg-muted"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 space-y-2">
              <MobileLink to="/" label="Home" onClick={() => setIsOpen(false)} />

              <div className="pt-2">
                <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-textmuted">
                  About
                </div>
                <MobileLink
                  to="/about"
                  label="About the Center"
                  onClick={() => setIsOpen(false)}
                />
                <MobileLink
                  to="/programs"
                  label="Programs & Activities"
                  onClick={() => setIsOpen(false)}
                />
                <MobileLink
                  to="/training"
                  label="Training & Workshops"
                  onClick={() => setIsOpen(false)}
                />
              </div>

              <MobileLink
                to="/research"
                label="Research"
                onClick={() => setIsOpen(false)}
              />
              <MobileLink
                to="/disaster-map"
                label="Disaster Map"
                onClick={() => setIsOpen(false)}
              />
              <MobileLink
                to="/insights"
                label="Insights"
                onClick={() => setIsOpen(false)}
              />
              <MobileLink
                to="/support"
                label="Support CEDRAM"
                onClick={() => setIsOpen(false)}
              />
              <MobileLink
                to="/contact"
                label="Contact"
                onClick={() => setIsOpen(false)}
              />
            </div>

            <div className="mt-8 rounded-2xl border border-border bg-muted/40 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-textmain">
                <ShieldCheck size={16} className="text-primary" />
                Public reporting
              </div>
              <p className="mt-2 text-sm text-textmuted">
                Submit disaster information to support monitoring, verification,
                research, and planning.
              </p>

              <div className="mt-4 space-y-3">
                <Link
                  to="/submit-report"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex w-full items-center justify-center rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-accenttext transition hover:brightness-95"
                >
                  Submit report
                </Link>

                <Link
                  to="/support"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-border bg-surface px-4 py-3 text-sm font-semibold text-textmain transition hover:bg-muted"
                >
                  Support CEDRAM
                </Link>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <header className={`fixed top-0 left-0 w-full z-[999999] ${navClass}`}>
        {!isAdminRoute && (
          <div className="absolute inset-x-0 top-0 h-0.5 bg-accent" />
        )}

        <div
          className={classNames(
            "max-w-7xl mx-auto px-6 flex items-center justify-between gap-6 transition-all duration-300",
            scrolled ? "h-[72px]" : "h-20"
          )}
        >
          <Link
            to="/"
            className="flex items-center shrink-0"
            aria-label="CEDRAM home"
          >
            <CedramWordmark
              className="h-11 md:h-12 w-auto"
              light={!isAdminRoute}
            />
          </Link>

          <nav className="hidden lg:flex flex-1 items-center justify-center gap-6 xl:gap-9">
            <Link to="/" className={`${linkBase} ${desktopLinkColor("/")}`}>
              Home
            </Link>

            <div ref={aboutRef} className="relative">
              <button
                type="button"
                onClick={() => setAboutOpen((v) => !v)}
                onMouseEnter={openAbout}
                onMouseLeave={scheduleCloseAbout}
                className={`${linkBase} inline-flex items-center gap-1 ${
                  inAboutGroup
                    ? isAdminRoute
                      ? "text-secondary"
                      : "text-accent"
                    : isAdminRoute
                    ? "text-textmuted hover:text-textmain"
                    : "text-white/85 hover:text-white"
                }`}
                aria-haspopup="menu"
                aria-expanded={aboutOpen}
                aria-controls="about-menu"
              >
                About
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    aboutOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {aboutOpen && (
                <div
                  id="about-menu"
                  role="menu"
                  onMouseEnter={openAbout}
                  onMouseLeave={scheduleCloseAbout}
                  className="absolute left-0 top-full mt-3 w-64 overflow-hidden rounded-2xl border border-border bg-surface text-textmain shadow-2xl z-[1000000]"
                >
                  <div className="bg-muted px-4 py-3 text-xs font-semibold uppercase tracking-wide text-textmuted">
                    About
                  </div>
                  <DropdownLink to="/about" label="About the Center" />
                  <DropdownLink to="/programs" label="Programs & Activities" />
                  <DropdownLink to="/training" label="Training & Workshops" />
                </div>
              )}
            </div>

            <Link
              to="/research"
              className={`${linkBase} ${desktopLinkColor("/research")}`}
            >
              Research
            </Link>
            <Link
              to="/disaster-map"
              className={`${linkBase} ${desktopLinkColor("/disaster-map")}`}
            >
              Disaster Map
            </Link>
            <Link
              to="/insights"
              className={`${linkBase} ${desktopLinkColor("/insights")}`}
            >
              Insights
            </Link>
            <Link
              to="/support"
              className={`${linkBase} ${desktopLinkColor("/support")}`}
            >
              Support
            </Link>
            <Link
              to="/contact"
              className={`${linkBase} ${desktopLinkColor("/contact")}`}
            >
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            {!isAdminRoute && (
              <>
                <Link
                  to="/support"
                  className="hidden xl:inline-flex items-center rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Support CEDRAM
                </Link>

                <Link
                  to="/submit-report"
                  className="hidden xl:inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 font-semibold text-accenttext transition hover:brightness-95 shadow-sm"
                >
                  <FileText size={16} />
                  Submit report
                </Link>
              </>
            )}

            <button
              onClick={() => setIsOpen(true)}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border transition lg:hidden ${
                isAdminRoute
                  ? "border-border text-textmain hover:bg-muted"
                  : "border-white/15 text-white hover:bg-white/10"
              }`}
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>

      {mobileDrawer}
    </>
  );
}

function DropdownLink({ to, label }) {
  return (
    <Link
      to={to}
      role="menuitem"
      className="block px-4 py-3 text-sm font-semibold text-textmain transition hover:bg-muted hover:text-secondary"
    >
      {label}
    </Link>
  );
}

function MobileLink({ to, label, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="block rounded-xl px-4 py-3 text-sm font-medium text-textmain transition hover:bg-muted"
    >
      {label}
    </Link>
  );
}

function classNames(...xs) {
  return xs.filter(Boolean).join(" ");
}

export default Navbar;