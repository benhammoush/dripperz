/**
 * Check the shell's semantic targets and explicit deferred-feature status.
 * @packageDocumentation
 */

import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { App } from '../../src/App';
import { APP_VERSION } from '../../src/appVersion';
import { HERO_MODEL_BYTES } from '../../src/heroAsset';

/** Callback contract used only to drive the app's loading UI in this unit harness. */
interface MockHeroProps {
  /**
   * Report one observed transfer sample.
   * @param loaded - Model response bytes received.
   */
  onDownload: (loaded: number) => void;
  /** Report a completed frame independently of downloaded bytes. */
  onReady: () => void;
  /** Begin a fresh explicit loading cycle after static continuation. */
  onLoad: () => void;
}

vi.mock('../../src/LocalHero', () => ({
  /** Stand in for GPU callbacks while the app's loading state is tested.
   * @param props - Loading callback signals supplied by the app.
   * @returns Test-only controls, without claiming a native graphics context.
   */
  LocalHero: (props: MockHeroProps) => (
    <>
      <button
        data-testid="half-download"
        onClick={() => props.onDownload(70_102_064 / 2)}
      >
        Half download
      </button>
      <button
        data-testid="full-download"
        onClick={() => props.onDownload(70_102_064)}
      >
        Full download
      </button>
      <button data-testid="frame-ready" onClick={props.onReady}>
        Frame ready
      </button>
      <button data-testid="reload-model" onClick={props.onLoad}>
        Reload model
      </button>
    </>
  ),
}));

beforeEach(() => {
  vi.useFakeTimers();
  // JSDOM lacks dialog methods; real modal behavior is verified in all three browsers.
  /** Mark the simulated dialog open without claiming native focus trapping. */
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  /** Mark the simulated dialog closed. */
  HTMLDialogElement.prototype.close = function () {
    this.open = false;
  };
});

afterEach(() => {
  vi.useRealTimers();
  Reflect.deleteProperty(HTMLDialogElement.prototype, 'showModal');
  Reflect.deleteProperty(HTMLDialogElement.prototype, 'close');
});

test('renders the shell and runtime version without claiming feature completion', () => {
  render(<App />);
  expect(
    screen.getByRole('dialog', { name: 'Loading Experience' }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: 'Continue without 3D' }),
  ).toBeNull();
  act(() => {
    vi.advanceTimersByTime(9_999);
  });
  expect(
    screen.queryByRole('button', { name: 'Continue without 3D' }),
  ).toBeNull();
  act(() => {
    vi.advanceTimersByTime(1);
  });
  fireEvent.click(screen.getByRole('button', { name: 'Continue without 3D' }));
  expect(
    screen.getByRole('heading', { level: 1, name: /Dripperz.*ENTER THE/ }),
  ).toBeInTheDocument();
  expect(screen.getByTestId('app-version')).toHaveTextContent(APP_VERSION);
  expect(screen.queryByText('Not yet implemented')).toBeNull();
  expect(
    screen.getByText(
      'Historical reference—not current balances or active governance.',
    ),
  ).toBeInTheDocument();
  expect(screen.getByText('Community treasury')).toBeInTheDocument();
  expect(screen.getByText('Latest proposal')).toBeInTheDocument();
  for (const [label, value, count] of [
    ['Safe address', '0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', 1],
    ['Record date', 'XXXX-XX-XX', 2],
    ['Governance space', 'XXXX.XXXX', 1],
    ['Proposal title', 'XXXX XXXX XXXX', 1],
    ['Status', 'XXXXXXX', 1],
    [
      'Proposal details',
      'XXXX XXXX XXXX XXXX XXXX XXXX XXXX XXXX XXXX XXXX XXXX XXXX XXXX XXXX XXXX XXXX',
      1,
    ],
    ['Choices', 'XXXX', 1],
  ] as const) {
    const fields = screen.getAllByText(label);
    expect(fields).toHaveLength(count);
    for (const field of fields) {
      expect(field.nextElementSibling).toHaveTextContent(value);
    }
  }
  expect(screen.getByText('Treasury value')).toHaveTextContent('XXXX.XXXX ETH');
  expect(screen.getByText('USD conversion')).toHaveTextContent(
    'XXX.XXX,XX USD',
  );
  fireEvent.click(screen.getByTestId('reload-model'));
  expect(
    screen.getByRole('dialog', { name: 'Loading Experience' }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: 'Continue without 3D' }),
  ).toBeNull();
  act(() => {
    vi.advanceTimersByTime(9_999);
  });
  expect(
    screen.queryByRole('button', { name: 'Continue without 3D' }),
  ).toBeNull();
  act(() => {
    vi.advanceTimersByTime(1);
  });
  expect(
    screen.getByRole('button', { name: 'Continue without 3D' }),
  ).toBeInTheDocument();
});

test('download bytes drive the bar, but 100% stays in preparing until a rendered frame', () => {
  render(<App />);
  const progress = screen.getByRole('progressbar', {
    name: '3D model download',
  });
  expect(progress.getAttribute('value')).toBe('0');
  expect(progress.getAttribute('max')).toBe(String(HERO_MODEL_BYTES));
  fireEvent.click(screen.getByTestId('half-download'));
  expect(progress.getAttribute('value')).toBe(String(HERO_MODEL_BYTES / 2));
  expect(screen.getByText('50% downloaded')).toBeInTheDocument();
  fireEvent.click(screen.getByTestId('full-download'));
  expect(
    screen.getByText('Download complete · Preparing 3D…'),
  ).toBeInTheDocument();
  expect(
    screen.getByRole('dialog', { name: 'Loading Experience' }),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByTestId('frame-ready'));
  expect(screen.queryByRole('dialog')).toBeNull();
  act(() => {
    vi.advanceTimersByTime(10_000);
  });
  expect(screen.queryByText('Continue without 3D')).toBeNull();
});
