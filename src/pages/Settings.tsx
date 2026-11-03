import { ClipboardCopy, ClipboardPaste, Download, ExternalLink, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { askConfirm } from '../components/confirm';
import { Button, Card, CardHeader, ExamDot, Field, Modal, PageHeader, Segmented } from '../components/ui';
import { EXAM_ORDER, EXAMS } from '../data/exams';
import { todayISO } from '../lib/dates';
import { isFramed } from '../lib/env';
import type { ExamId, ThemePref } from '../lib/types';
import { exportData, useStore } from '../store/useStore';

function ExamSettingsCard({ exam }: { exam: ExamId }) {
  const cfg = useStore((s) => s.settings.exams[exam]);
  const update = useStore((s) => s.updateExam);
  const def = EXAMS[exam];
  const isSat = exam === 'sat';
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 font-serif text-[17px] font-semibold">
            <ExamDot exam={exam} /> {def.name}
          </h3>
          <a href={def.officialUrl} target="_blank" rel="noopener noreferrer" className="mt-0.5 inline-flex items-center gap-1 text-[12.5px] text-accent hover:underline">
            Official exam page <ExternalLink size={11} />
          </a>
        </div>
        <label className="flex shrink-0 items-center gap-2 text-[13px] font-medium">
          <input type="checkbox" checked={cfg.active} onChange={(e) => update(exam, { active: e.target.checked })} className="size-4 accent-[var(--accent)]" />
          Active
        </label>
      </div>
      {cfg.active && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Field label="Exam date" hint={!def.dateConfirmed && !cfg.date ? 'Not set — add yours to get a countdown.' : undefined}>
              {(id) => <input id={id} type="date" className="field" value={cfg.date ?? ''} onChange={(e) => update(exam, { date: e.target.value || null })} />}
            </Field>
            <Field label={isSat ? 'Target score' : 'Target (1–5)'}>
              {(id) => (
                <input
                  id={id}
                  type="number"
                  className="field num"
                  min={isSat ? 400 : 1}
                  max={isSat ? 1600 : 5}
                  step={isSat ? 10 : 1}
                  value={cfg.target}
                  onChange={(e) => update(exam, { target: Number(e.target.value) || def.defaultTarget })}
                />
              )}
            </Field>
          </div>
          <ul className="mt-4 flex list-disc flex-col gap-1 pl-4 text-[12.5px] text-ink-2 marker:text-muted">
            {def.facts.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          {cfg.date !== def.defaultDate && def.defaultDate && (
            <button type="button" onClick={() => update(exam, { date: def.defaultDate })} className="mt-3 text-[12.5px] font-medium text-accent hover:underline">
              Reset to the official date
            </button>
          )}
        </>
      )}
    </Card>
  );
}

export default function SettingsPage() {
  const settings = useStore((s) => s.settings);
  const update = useStore((s) => s.updateSettings);
  const importData = useStore((s) => s.importData);
  const resetAll = useStore((s) => s.resetAll);
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState('');
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [manualCopy, setManualCopy] = useState('');

  const backupJson = () => JSON.stringify({ app: 'lyceum', version: 1, exportedAt: new Date().toISOString(), data: exportData() }, null, 2);

  const copyBackup = async () => {
    const json = backupJson();
    try {
      await navigator.clipboard.writeText(json);
      setMessage('Backup copied. Paste it into a note or file to keep it safe.');
    } catch {
      setManualCopy(json); // clipboard blocked — show it for manual copy
    }
  };

  const download = () => {
    const blob = new Blob([backupJson()], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lyceum-backup-${todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage('Backup downloaded.');
  };

  const restore = async (text: string): Promise<boolean> => {
    let data: unknown;
    try {
      const parsed = JSON.parse(text);
      data = parsed?.app === 'lyceum' ? parsed.data : parsed;
      if (!data || typeof data !== 'object' || !('settings' in data)) throw new Error('Not a Lyceum backup');
    } catch {
      setMessage('That isn’t a valid Lyceum backup. Use the text from “Copy backup” or a downloaded .json file.');
      return false;
    }
    const ok = await askConfirm({ title: 'Restore this backup?', message: 'All current progress, logs and settings are replaced by the backup.', confirmLabel: 'Restore', danger: true });
    if (!ok) return false;
    importData(data);
    setMessage('Backup restored.');
    return true;
  };

  const upload = async (file: File) => {
    await restore(await file.text());
  };

  const pomo = settings.pomodoro;
  const setPomo = (k: keyof typeof pomo, v: number) => update({ pomodoro: { ...pomo, [k]: Math.max(1, v || 1) } });

  return (
    <>
      <PageHeader eyebrow="Settings" title="Settings" description="Exam dates, targets, study preferences and your data." />

      <div className="flex flex-col gap-8">
        <section>
          <h2 className="eyebrow mb-3">Exams</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {EXAM_ORDER.map((e) => (
              <ExamSettingsCard key={e} exam={e} />
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader title="Preferences" />
            <div className="grid gap-4 px-5 pb-5 sm:grid-cols-2">
              <Field label="Your name" className="sm:col-span-2">
                {(id) => <input id={id} className="field" value={settings.name} onChange={(e) => update({ name: e.target.value })} placeholder="Shown in the greeting" />}
              </Field>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <span className="text-[13px] font-medium text-ink-2">Theme</span>
                <Segmented<ThemePref>
                  label="Theme"
                  value={settings.theme}
                  onChange={(theme) => update({ theme })}
                  options={[
                    { value: 'system', label: 'System' },
                    { value: 'light', label: 'Light' },
                    { value: 'dark', label: 'Dark' },
                  ]}
                />
              </div>
              <Field label="Daily study goal (minutes)">
                {(id) => (
                  <input id={id} type="number" min={15} step={15} className="field num" value={settings.dailyGoalMinutes} onChange={(e) => update({ dailyGoalMinutes: Math.max(15, Number(e.target.value) || 15) })} />
                )}
              </Field>
              <Field label="New flashcards per day">
                {(id) => (
                  <input id={id} type="number" min={0} max={100} className="field num" value={settings.newCardsPerDay} onChange={(e) => update({ newCardsPerDay: Math.max(0, Number(e.target.value) || 0) })} />
                )}
              </Field>
              <label className="flex items-center gap-2 text-[13.5px] sm:col-span-2">
                <input type="checkbox" checked={settings.sound} onChange={(e) => update({ sound: e.target.checked })} className="size-4 accent-[var(--accent)]" />
                Play a chime when a timer ends
              </label>
            </div>
          </Card>

          <Card>
            <CardHeader title="Pomodoro" subtitle="Durations in minutes." />
            <div className="grid grid-cols-2 gap-4 px-5 pb-5">
              <Field label="Focus">{(id) => <input id={id} type="number" min={1} className="field num" value={pomo.focus} onChange={(e) => setPomo('focus', Number(e.target.value))} />}</Field>
              <Field label="Short break">{(id) => <input id={id} type="number" min={1} className="field num" value={pomo.short} onChange={(e) => setPomo('short', Number(e.target.value))} />}</Field>
              <Field label="Long break">{(id) => <input id={id} type="number" min={1} className="field num" value={pomo.long} onChange={(e) => setPomo('long', Number(e.target.value))} />}</Field>
              <Field label="Long break every">{(id) => <input id={id} type="number" min={1} className="field num" value={pomo.longEvery} onChange={(e) => setPomo('longEvery', Number(e.target.value))} />}</Field>
              <p className="col-span-2 text-[12.5px] text-muted">New durations apply from the next phase (or press reset on the Timer).</p>
            </div>
          </Card>
        </section>

        <section>
          <Card>
            <CardHeader title="Your data" subtitle="Everything is stored only in this browser. Copy or download a backup regularly; clearing browser data erases it." />
            <div className="flex flex-wrap items-center gap-2 px-5 pb-5">
              <Button onClick={copyBackup}>
                <ClipboardCopy size={16} /> Copy backup
              </Button>
              {!isFramed && (
                <Button onClick={download}>
                  <Download size={16} /> Download backup (.json)
                </Button>
              )}
              <Button onClick={() => setPasteOpen(true)}>
                <ClipboardPaste size={16} /> Paste backup
              </Button>
              <Button onClick={() => fileRef.current?.click()}>
                <Upload size={16} /> Import file
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void upload(f);
                  e.target.value = '';
                }}
              />
              <span className="flex-1" />
              <Button
                variant="danger"
                onClick={async () => {
                  const ok = await askConfirm({
                    title: 'Erase everything?',
                    message: 'All progress, logs, flashcard history and settings are deleted from this browser. Copy a backup first if you might want it back.',
                    confirmLabel: 'Erase everything',
                    danger: true,
                  });
                  if (ok) {
                    resetAll();
                    setMessage('All data erased.');
                  }
                }}
              >
                Erase everything
              </Button>
            </div>
            {message && (
              <p role="status" className="border-t border-line px-5 py-3 text-[13px] text-ink-2">
                {message}
              </p>
            )}
          </Card>
        </section>
      </div>

      <Modal
        open={pasteOpen}
        onClose={() => setPasteOpen(false)}
        title="Paste a backup"
        footer={
          <>
            <Button variant="ghost" onClick={() => setPasteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={!pasteText.trim()}
              onClick={async () => {
                if (await restore(pasteText)) {
                  setPasteOpen(false);
                  setPasteText('');
                }
              }}
            >
              Restore
            </Button>
          </>
        }
      >
        <Field label="Backup text" hint="Paste the text you saved with “Copy backup”.">
          {(id) => <textarea id={id} rows={8} className="field font-mono text-[12px]" value={pasteText} onChange={(e) => setPasteText(e.target.value)} />}
        </Field>
      </Modal>

      <Modal open={!!manualCopy} onClose={() => setManualCopy('')} title="Copy your backup">
        <p className="mb-3 text-[13.5px] text-ink-2">Your browser blocked automatic copying. Select all of the text below and copy it.</p>
        <textarea readOnly rows={10} className="field font-mono text-[12px]" value={manualCopy} onFocus={(e) => e.currentTarget.select()} aria-label="Backup text" />
      </Modal>
    </>
  );
}
