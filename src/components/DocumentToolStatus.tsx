import { AlertCircle, Loader2, LockKeyhole } from "lucide-react";

export function DocumentToolStatus({ busy, message, error, onCancel }: { busy: boolean; message: string; error: string; onCancel: () => void }) {
  return <>
    {message && <div className="document-progress" role="status"><span>{busy && <Loader2 className="spinner" size={18} />}{message}</span>{busy && <button type="button" className="btn btn--secondary" onClick={onCancel}>Cancel conversion</button>}</div>}
    {error && <p className="error-message" role="alert"><AlertCircle size={18} />{error}</p>}
  </>;
}

export function LocalFileNote() {
  return <p className="library-note"><LockKeyhole size={15} /> Files are processed on this device.</p>;
}
