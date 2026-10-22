/**
 * Responsive Phase 3 showcase with local galleries and explicitly historical content.
 * @packageDocumentation
 */

import { APP_VERSION } from './appVersion';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Atmosphere } from './Atmosphere';
import { SECTIONS } from './sections';
import {
  Collection,
  Cybermap,
  HistoricalTreasury,
  ShowcaseFaq,
} from './CoreShowcase';
import { PUBLIC_LINKS } from './showcaseContent';
import { LocalHero } from './LocalHero';
import { HERO_MODEL_BYTES } from './heroAsset';
import { RaritySection } from './RaritySection';
import { ShowcaseTerminal } from './ShowcaseTerminal';
import { Gallery } from './Gallery';
import { COLLECTION_SLIDES } from './showcaseContent';

/**
 * Render shared desktop/mobile navigation and approved core content without external integrations.
 * @returns The core showcase, remaining deferred-feature targets and runtime version.
 */
export function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroEnabled, setHeroEnabled] = useState(true);
  const [heroLoading, setHeroLoading] = useState(true);
  const [skipAvailable, setSkipAvailable] = useState(false);
  const [downloaded, setDownloaded] = useState<number | null>(null);
  const loadingDialog = useRef<HTMLDialogElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const terminalFocused = useRef(false);

  /** Reveal the page after a rendered frame or a handled asset/graphics failure. */
  const finishHero = useCallback(() => setHeroLoading(false), []);

  /** Release the loading screen and canvas without requiring a completed model download. */
  const skipHero = useCallback(() => {
    setHeroEnabled(false);
    setHeroLoading(false);
  }, []);

  /** Explicitly reload the model after continuing without 3D. */
  const loadHero = useCallback(() => {
    setSkipAvailable(false);
    setDownloaded(null);
    setHeroEnabled(true);
    setHeroLoading(true);
  }, []);

  /**
   * Report actual streamed model bytes against the pinned uncompressed asset size.
   * @param loaded - Response-body byte count supplied by Three's loader.
   */
  const reportDownload = useCallback((loaded: number) => {
    if (!Number.isFinite(loaded)) return;
    const next = Math.min(HERO_MODEL_BYTES, Math.max(0, loaded));
    // Sample byte counts once per displayed percent instead of rerendering the site per stream chunk.
    setDownloaded((current) =>
      current === null ||
      next === HERO_MODEL_BYTES ||
      Math.floor((current / HERO_MODEL_BYTES) * 100) !==
        Math.floor((next / HERO_MODEL_BYTES) * 100)
        ? next
        : current,
    );
  }, []);

  useEffect(() => {
    if (!heroLoading) return;
    const timer = window.setTimeout(() => setSkipAvailable(true), 10_000);
    return () => window.clearTimeout(timer);
  }, [heroLoading]);

  useEffect(() => {
    const panels = document.querySelectorAll<HTMLElement>('.content-panel');
    if (!('IntersectionObserver' in window)) {
      panels.forEach((panel) => (panel.dataset.revealed = 'true'));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.revealed = 'true';
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.08 },
    );
    panels.forEach((panel) => observer.observe(panel));
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const dialog = loadingDialog.current;
    if (!dialog) return;
    if (heroLoading && !dialog.open) dialog.showModal();
    if (!heroLoading && dialog.open) {
      dialog.close();
      const target = terminalFocused.current ? 'main' : 'terminal-command';
      document.getElementById(target)?.focus({ preventScroll: true });
      terminalFocused.current = true;
    }
  }, [heroLoading]);

  /** Close the mobile disclosure after following a section link. */
  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <>
      <dialog
        className="experience-loader"
        ref={loadingDialog}
        aria-labelledby="experience-loading-title"
        onCancel={(event) => {
          event.preventDefault();
          skipHero();
        }}
      >
        <div className="experience-loader-content">
          <p id="experience-loading-title" role="status">
            Loading Experience
          </p>
          <progress
            className="experience-progress"
            aria-label="3D model download"
            max={HERO_MODEL_BYTES}
            value={downloaded ?? 0}
          />
          <p className="experience-download-status" role="status">
            {downloaded === null
              ? 'Loading model…'
              : downloaded < HERO_MODEL_BYTES
                ? `${Math.floor((downloaded / HERO_MODEL_BYTES) * 100)}% downloaded`
                : 'Download complete · Preparing 3D…'}
          </p>
          {skipAvailable && (
            <button type="button" onClick={skipHero}>
              Continue without 3D
            </button>
          )}
        </div>
      </dialog>
      <div className="shell" inert={heroLoading}>
        <a className="skip-link" href="#main" tabIndex={0}>
          Skip to content
        </a>
        <div className="site-header-spacer" aria-hidden="true" />
        <header
          className="site-header"
          onKeyDown={(event) => {
            if (event.key === 'Escape' && menuOpen) {
              closeMenu();
              menuButton.current?.focus();
            }
          }}
        >
          <a
            className="brand"
            tabIndex={0}
            href="#home"
            aria-label="Dripperz home"
            onClick={closeMenu}
          >
            <img
              src="/branding/dripperz-mark.png"
              width="34"
              height="40"
              alt=""
            />
            <span>
              DRIPPERZ<span className="brand-subtitle">CYBER CLUB</span>
            </span>
          </a>
          <button
            className="menu-toggle"
            ref={menuButton}
            type="button"
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? 'Close menu' : 'Menu'}{' '}
            <span aria-hidden="true">{menuOpen ? '−' : '+'}</span>
          </button>
          <nav
            id="primary-navigation"
            className="primary-navigation"
            aria-label="Main"
            data-open={menuOpen}
          >
            {SECTIONS.map((section) => (
              <a
                href={`#${section.id}`}
                tabIndex={0}
                key={section.id}
                onClick={closeMenu}
              >
                {section.label}
              </a>
            ))}
          </nav>
        </header>
        <Atmosphere paused={heroLoading}>
          <main id="main" tabIndex={-1}>
            <section className="hero" id="home" aria-labelledby="hero-title">
              <h1 id="hero-title">
                <span className="sr-only">Dripperz — </span>ENTER THE{' '}
                <span className="glitch">CYBERCLUB</span>
              </h1>
              <LocalHero
                enabled={heroEnabled}
                onReady={finishHero}
                onUnavailable={finishHero}
                onLoad={loadHero}
                onDownload={reportDownload}
              />
              <a className="enter-link" href="#collection" tabIndex={0}>
                Explore the club <span aria-hidden="true">↓</span>
              </a>
            </section>
            <div className="hero-carousel">
              <Gallery
                id="hero-carousel"
                title="Featured collection"
                slides={COLLECTION_SLIDES}
                intervalMs={3000}
                visibleSlides={3}
                compact
              />
            </div>
            <div className="sections">
              {SECTIONS.map((section, index) => (
                <section
                  className="content-panel"
                  id={section.id}
                  tabIndex={-1}
                  key={section.id}
                  aria-labelledby={`${section.id}-title`}
                >
                  <p className="eyebrow">
                    0{index + 1} / {section.label}
                  </p>
                  <h2 id={`${section.id}-title`}>{section.title}</h2>
                  {section.id === 'collection' ? (
                    <Collection />
                  ) : section.id === 'cybermap' ? (
                    <Cybermap />
                  ) : section.id === 'faq' ? (
                    <ShowcaseFaq />
                  ) : section.id === 'rarity' ? (
                    <RaritySection />
                  ) : (
                    <HistoricalTreasury />
                  )}
                </section>
              ))}
            </div>
          </main>
          <footer className="site-footer">
            <a href="#home" tabIndex={0}>
              Dripperz Cyber Club ↑
            </a>
            {PUBLIC_LINKS.map((link) => (
              <a key={link.href} href={link.href} tabIndex={0}>
                {link.label} ↗
              </a>
            ))}
            <p>
              Version <span data-testid="app-version">{APP_VERSION}</span>
            </p>
          </footer>
        </Atmosphere>
        <ShowcaseTerminal />
      </div>
    </>
  );
}
