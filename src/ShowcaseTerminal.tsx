/**
 * A bounded decorative command prompt for the approved public archive links.
 * @packageDocumentation
 */

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import './ShowcaseTerminal.css';

const DOCUMENTS = {
  report: {
    label: 'Open club report (PDF)',
    href: 'https://dripperzcyberclub.mypinata.cloud/ipfs/QmNSwRjCrKQDuqc1CthMDX39v1qrWWzFtGU5d445k41tYK',
  },
  mugshot: {
    label: 'Open club members (PDF, approximately 58 MB)',
    href: 'https://dripperzcyberclub.mypinata.cloud/ipfs/QmPfGUovpmDNRJAWGnnkfc543uyoZE4R6FaPWrwyWk1e8L',
  },
} as const;

/** One literal command echo and its safe, declarative response. */
interface TerminalEntry {
  id: number;
  command: string;
  message: string;
  document?: keyof typeof DOCUMENTS;
}

/**
 * Render a local allowlisted prompt; typing never executes code or opens a remote resource.
 * @returns Keyboard-accessible command input, bounded history and explicit document links.
 */
export function ShowcaseTerminal() {
  const [input, setInput] = useState('');
  const [entries, setEntries] = useState<TerminalEntry[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [position, setPosition] = useState<number | null>(null);
  const [draft, setDraft] = useState('');
  const sequence = useRef(0);
  const output = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (output.current) output.current.scrollTop = output.current.scrollHeight;
  }, [entries]);

  /**
   * Interpret only whole allowlisted commands, without evaluating arguments or markup.
   * @param event - Form submission by Enter or the mobile keyboard action.
   */
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const command = input.trim().slice(0, 160);
    if (!command) return;
    setInput('');
    setPosition(null);
    setDraft('');
    setHistory((current) => [...current, command].slice(-30));
    const normalized = command.toLowerCase();
    if (normalized === 'clear') {
      setEntries([]);
      return;
    }
    const entry: TerminalEntry = {
      id: sequence.current++,
      command,
      message: 'Wrong command, type help instead.',
    };
    if (normalized === 'help')
      entry.message =
        'help — List commands\nclear — Clear the screen\nreport — Club lore PDF\nmugshot — Club members PDF';
    if (normalized === 'report' || normalized === 'mugshot') {
      entry.document = normalized;
      entry.message =
        'Fictional club material. External PDF; opens only when you follow the link. Availability is controlled by the document host.';
    }
    setEntries((current) => [...current, entry].slice(-30));
  }

  /**
   * Browse this mount's bounded command history and restore the in-progress draft.
   * @param event - Input keydown; unrelated keys retain native browser behavior.
   */
  function browseHistory(event: KeyboardEvent<HTMLInputElement>) {
    if (
      event.nativeEvent.isComposing ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      !history.length
    )
      return;
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
    event.preventDefault();
    if (event.key === 'ArrowUp') {
      if (position === null) setDraft(input);
      const next =
        position === null ? history.length - 1 : Math.max(0, position - 1);
      setPosition(next);
      setInput(history[next]!);
    } else if (position !== null) {
      const next = position + 1;
      setPosition(next < history.length ? next : null);
      setInput(next < history.length ? history[next]! : draft);
    }
  }

  return (
    <aside
      id="terminal"
      className="showcase-terminal"
      aria-label="Dripperz terminal"
    >
      <div id="terminal-console">
        <p id="terminal-help" className="sr-only">
          Dripperz prompt, not a system shell. Use ↑ / ↓ for command history. No
          password or wallet required.
        </p>
        <div
          ref={output}
          className="terminal-output"
          role="log"
          aria-label="Terminal output"
          aria-live="polite"
          aria-relevant="additions"
          tabIndex={0}
        >
          {entries.map((entry) => (
            <div className="terminal-entry" key={entry.id}>
              <p className="terminal-echo">Terminal/ {entry.command}</p>
              <p className="terminal-response">{entry.message}</p>
              {entry.document && (
                <a
                  href={DOCUMENTS[entry.document].href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {DOCUMENTS[entry.document].label} ↗
                  <span className="terminal-new-tab"> (new tab)</span>
                </a>
              )}
            </div>
          ))}
        </div>
        <form className="terminal-form" onSubmit={submit}>
          <label htmlFor="terminal-command">
            <span aria-hidden="true">Terminal/</span>
            <span className="sr-only">Command</span>
          </label>
          <input
            id="terminal-command"
            value={input}
            maxLength={160}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            enterKeyHint="send"
            aria-describedby="terminal-help"
            onKeyDown={browseHistory}
            onChange={(event) => {
              setInput(event.target.value);
              setPosition(null);
            }}
          />
        </form>
      </div>
    </aside>
  );
}
