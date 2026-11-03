import { create } from 'zustand';
import { Button, Modal } from './ui';

/**
 * In-page confirmation dialog. Native confirm()/alert() are blocked in sandboxed
 * frames (and look out of place), so destructive actions ask through this instead:
 *
 *   if (await askConfirm({ title: 'Delete entry?', danger: true })) remove(id);
 */
export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  danger?: boolean;
}

interface Pending extends ConfirmOptions {
  resolve: (ok: boolean) => void;
}

const useConfirmStore = create<{ pending: Pending | null }>(() => ({ pending: null }));

export function askConfirm(options: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    useConfirmStore.getState().pending?.resolve(false);
    useConfirmStore.setState({ pending: { ...options, resolve } });
  });
}

/** Mounted once in the app shell. */
export function ConfirmHost() {
  const pending = useConfirmStore((s) => s.pending);
  const close = (ok: boolean) => {
    pending?.resolve(ok);
    useConfirmStore.setState({ pending: null });
  };
  return (
    <Modal
      open={!!pending}
      onClose={() => close(false)}
      title={pending?.title ?? ''}
      footer={
        <>
          <Button variant="ghost" onClick={() => close(false)}>
            Cancel
          </Button>
          <Button variant={pending?.danger ? 'dangerSolid' : 'primary'} onClick={() => close(true)} autoFocus>
            {pending?.confirmLabel ?? 'Confirm'}
          </Button>
        </>
      }
    >
      {pending?.message ? <p className="text-[14px] text-ink-2">{pending.message}</p> : <p className="text-[14px] text-ink-2">This can’t be undone.</p>}
    </Modal>
  );
}
