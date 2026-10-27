/**
 * Responsive Phase 3 showcase with local galleries and explicitly historical content.
 * @packageDocumentation
 */

import { APP_VERSION } from './appVersion';
import {
  Fragment,
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
import { CHARACTER_SLIDES } from './showcaseContent';
import { GlitchText } from './design-system';
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
  const [effectsPaused, setEffectsPaused] = useState(false);
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
    const panels = document.querySelectorAll<HTMLElement>('.motion-region');
    if (!('IntersectionObserver' in window)) {
      panels.forEach((panel) => {
        panel.dataset.revealed = 'true';
        panel.dataset.visible = 'true';
      });
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const panel = entry.target as HTMLElement;
          panel.dataset.visible = String(entry.isIntersecting);
          if (entry.isIntersecting) panel.dataset.revealed = 'true';
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
      const target =
        terminalFocused.current ||
        window.matchMedia?.('(max-width: 37.5rem)').matches
          ? 'main'
          : 'terminal-command';
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
      <div className="shell" inert={heroLoading} data-app-version={APP_VERSION}>
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
            <button
              className="action-button motion-toggle"
              type="button"
              aria-pressed={effectsPaused}
              onClick={() => setEffectsPaused((paused) => !paused)}
            >
              {effectsPaused ? 'Resume effects' : 'Pause effects'}
            </button>
          </nav>
        </header>
        <Atmosphere paused={heroLoading || effectsPaused}>
          <main id="main" tabIndex={-1}>
            <section
              className="hero motion-region"
              id="home"
              aria-labelledby="hero-title"
            >
              <h1 id="hero-title">
                <span className="sr-only">Dripperz — </span>
                <GlitchText text="CYBERCLUB" />
              </h1>
              <LocalHero
                enabled={heroEnabled}
                paused={effectsPaused}
                onReady={finishHero}
                onUnavailable={finishHero}
                onLoad={loadHero}
                onDownload={reportDownload}
              />
              <a
                className="hero-scroll-link"
                href="#collection"
                aria-label="Scroll to Cyberclub"
              >
                <span className="scroll-hint" aria-hidden="true" />
              </a>
            </section>
            <div className="welcome-strip motion-region" aria-hidden="true">
              <div className="welcome-track">
                {[0, 1].map((copy) => (
                  <span key={copy}>
                    WELCOME TO THE CYBERCLUB — WELCOME TO THE CYBERCLUB —
                    WELCOME TO THE CYBERCLUB —
                  </span>
                ))}
              </div>
            </div>
            <div className="enter-section motion-region">
              <a
                className="enter-link"
                href="#collection"
                aria-label="Explore the club"
              >
                <GlitchText text="ENTER THE CYBERCLUB" />
              </a>
            </div>
            <div className="hero-carousel">
              <Gallery
                id="hero-carousel"
                title="Featured collection"
                slides={COLLECTION_SLIDES}
                intervalMs={5000}
                visibleSlides={3}
                compact
                paused={effectsPaused}
              />
            </div>
            <div className="sections">
              {SECTIONS.map((section) => (
                <Fragment key={section.id}>
                  <section
                    className="content-panel motion-region"
                    id={section.id}
                    tabIndex={-1}
                    aria-labelledby={`${section.id}-title`}
                  >
                    <h2 id={`${section.id}-title`}>
                      <GlitchText text={section.title} />
                    </h2>
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
                  {section.id === 'collection' && (
                    <>
                      <div className="collection-headlines motion-region">
                        <p>
                          <GlitchText text="5555 Uniques NFTS" />
                        </p>
                        <p>
                          <GlitchText text="Powered by Ethereum" />
                        </p>
                      </div>
                      <div className="character-showcase motion-region">
                        <Gallery
                          id="characters"
                          title="Character gallery"
                          slides={CHARACTER_SLIDES}
                          intervalMs={8000}
                          paused={effectsPaused}
                        />
                      </div>
                    </>
                  )}
                </Fragment>
              ))}
            </div>
          </main>
        </Atmosphere>
        <ShowcaseTerminal />
      </div>
    </>
  );
}
