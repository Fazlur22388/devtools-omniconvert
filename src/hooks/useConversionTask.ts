"use client";

import { useEffect, useRef, useState } from "react";
import type { TaskContext } from "@/lib/document-tools";

export default function useConversionTask() {
  const controller = useRef<AbortController | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => () => { controller.current?.abort(); }, []);

  function cancel() {
    controller.current?.abort();
    controller.current = null;
    setBusy(false);
    setMessage("Conversion cancelled.");
  }

  async function run<T>(work: (task: TaskContext) => Promise<T>): Promise<T | undefined> {
    if (controller.current) return;
    const current = new AbortController();
    controller.current = current;
    setBusy(true);
    setError("");
    setMessage("Preparing your file…");
    try {
      // Let the progress and Cancel control paint before doing document work.
      await new Promise((resolve) => setTimeout(resolve, 0));
      current.signal.throwIfAborted();
      const result = await work({ signal: current.signal, progress: (value) => { if (controller.current === current) setMessage(value); } });
      current.signal.throwIfAborted();
      if (controller.current !== current) return;
      setMessage("");
      return result;
    } catch (reason) {
      if (!current.signal.aborted && controller.current === current) {
        setError(reason instanceof Error ? reason.message : "This file could not be processed. Try another file.");
        setMessage("");
      }
    } finally {
      if (controller.current === current) { controller.current = null; setBusy(false); }
    }
  }

  return { busy, message, error, run, cancel, setError, clear: () => { setError(""); setMessage(""); } };
}
