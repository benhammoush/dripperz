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
import { Collection, Cybermap, ShowcaseFaq } from './CoreShowcase';
import { PUBLIC_LINKS } from './showcaseContent';
import { LocalHero } from './LocalHero';
import { HERO_MODEL_BYTES } from './heroAsset';

/**
 * Render shared desktop/mobile navigation and approved core content without external integrations.
 * @returns The core showcase, remaining deferred-feature targets and runtime version.
 */
export function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const [heroEnabled, setHeroEnabled] = useState(true);
  const [heroLoading, setHeroLoading] = useState(true);
  const [skipAvailable, setSkipAvailable] = useState(false);
  const [downloaded, setDownloaded] = useState<number | null>(null);
  const loadingDialog = useRef<HTMLDialogElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);

  /** Reveal the page after a rendered frame or a handled asset/graphics failure. */
  const finishHero = useCallback(() => setHeroLoading(false), []);

  /** Release the loading screen and canvas without requiring a completed model download. */
  const skipHero = useCallback(() => {
    setHeroEnabled(false);
    setHeroLoading(false);
  }, []);

  /** Explicitly reload the model after choosing or unloading the static view. */
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

  useLayoutEffect(() => {
    const dialog = loadingDialog.current;
    if (!dialog) return;
    if (heroLoading && !dialog.open) dialog.showModal();
    if (!heroLoading && dialog.open) {
      dialog.close();
      document.getElementById('main')?.focus({ preventScroll: true });
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
      <div className="shell" data-paused={paused} inert={heroLoading}>
        <a className="skip-link" href="#main" tabIndex={0}>
          Skip to content
        </a>
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
        <main id="main" tabIndex={-1}>
          <Atmosphere paused={paused || heroLoading}>
            <section className="hero" id="home" aria-labelledby="hero-title">
              <p className="eyebrow">Dripperz Cyber Club / Phase 03</p>
              <h1 id="hero-title">
                <span className="sr-only">Dripperz — </span>ENTER THE{' '}
                <span className="glitch">CYBERCLUB</span>
              </h1>
              <LocalHero
                paused={paused}
                enabled={heroEnabled}
                onReady={finishHero}
                onUnavailable={finishHero}
                onLoad={loadHero}
                onDisable={skipHero}
                onDownload={reportDownload}
              />
              <p className="hero-description">
                A historical showcase.
                <br />A cyberpunk identity. No wallet required.
              </p>
              <a className="enter-link" href="#collection" tabIndex={0}>
                Explore the club <span aria-hidden="true">↓</span>
              </a>
              <div className="hero-base">
                <p>
                  Historical showcase <span>/ Core collection archive</span>
                </p>
                <button
                  className="motion-toggle"
                  type="button"
                  aria-pressed={paused}
                  onClick={() => setPaused(!paused)}
                >
                  {paused ? 'Resume effects' : 'Pause effects'}
                </button>
              </div>
            </section>
            <div className="marquee" aria-hidden="true">
              <div className="marquee-track">
                {[0, 1].map((copy) => (
                  <span key={copy}>
                    WELCOME TO THE CYBERCLUB / DRIPPERZ / WELCOME TO THE
                    CYBERCLUB / DRIPPERZ /{' '}
                  </span>
                ))}
              </div>
            </div>
          </Atmosphere>
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
                ) : (
                  <>
                    <p>{section.detail}</p>
                    <span className="milestone-label">Not yet implemented</span>
                  </>
                )}
              </section>
            ))}
          </div>
        </main>
        <footer className="site-footer">
          <a href="#home" tabIndex={0}>
            Dripperz Cyber Club ↑
          </a>
          <p>Historical showcase · No Web3 integration</p>
          {PUBLIC_LINKS.map((link) => (
            <a key={link.href} href={link.href} tabIndex={0}>
              {link.label} ↗
            </a>
          ))}
          <p>
            Version <span data-testid="app-version">{APP_VERSION}</span>
          </p>
        </footer>
      </div>
    </>
  );
}
