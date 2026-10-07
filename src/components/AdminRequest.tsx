import { dict, type Lang } from "@/lib/i18n";
import { X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

export type AdminReq = {
  id: string;
  name: string;
  phone: string;
  service: string;
  note: string;
  at: string;
};

const KEY = "rembo-admin-requests";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007a33] focus-visible:ring-offset-2 focus-visible:ring-offset-white";
const inputBase = `w-full rounded-lg border border-[#cfe2d6] px-3 py-2.5 text-sm text-[#14231c] outline-none transition placeholder:text-[#6b7a72] hover:border-[#a8cebb] focus:border-[#007a33] ${focusRing}`;

export function loadRequests(): AdminReq[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function useRequests() {
  const [list, setList] = useState<AdminReq[]>([]);
  useEffect(() => {
    const sync = () => setList(loadRequests());
    sync();
    window.addEventListener("rembo-requests", sync);
    return () => window.removeEventListener("rembo-requests", sync);
  }, []);
  return list;
}

export function AdminRequestDialog({
  service,
  language,
  onClose,
}: {
  service: string;
  language: Lang;
  onClose: () => void;
}) {
  const t = dict[language].dialog;
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || phone.trim().length < 9) return;
    const request: AdminReq = {
      id: crypto.randomUUID(),
      name: name.trim(),
      phone: phone.trim(),
      service,
      note: note.trim(),
      at: new Date().toISOString(),
    };
    localStorage.setItem(KEY, JSON.stringify([request, ...loadRequests()]));
    window.dispatchEvent(new Event("rembo-requests"));
    setDone(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t.eyebrow}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-[#007a33]">{t.eyebrow}</p>
            <h3 className="mt-1 text-lg font-black">{service}</h3>
          </div>
          <button
            onClick={onClose}
            aria-label={t.ariaClose}
            className={`shrink-0 rounded-md p-1 text-[#5b6b62] transition hover:bg-[#f0f3f1] hover:text-[#14231c] ${focusRing}`}
          >
            <X size={18} />
          </button>
        </div>

        {done ? (
          <div className="mt-5 rounded-xl border border-[#b8dcc6] bg-[#e6f4ea] p-4 text-sm leading-6 text-[#08703c]">
            {t.success} {phone} {t.successTail}
            <button
              onClick={onClose}
              className={`mt-4 block w-full rounded-lg bg-[#007a33] py-2.5 text-xs font-bold text-white transition hover:bg-[#00612a] ${focusRing}`}
            >
              {t.close}
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-5 flex flex-col gap-3 text-sm">
            <p className="text-[13px] leading-5 text-[#5b6b62]">{t.noTime}</p>
            <label className="sr-only" htmlFor="admin-name">
              {t.name}
            </label>
            <input
              id="admin-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.name}
              className={inputBase}
            />
            <label className="sr-only" htmlFor="admin-phone">
              {t.phone}
            </label>
            <input
              id="admin-phone"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t.phone}
              inputMode="tel"
              minLength={9}
              className={inputBase}
            />
            <label className="sr-only" htmlFor="admin-note">
              {t.note}
            </label>
            <textarea
              id="admin-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t.note}
              rows={3}
              className={`${inputBase} resize-none`}
            />
            <button
              className={`w-full rounded-lg bg-[#007a33] py-3 text-xs font-bold text-white transition hover:bg-[#00612a] active:bg-[#005324] ${focusRing}`}
            >
              {t.submit}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
