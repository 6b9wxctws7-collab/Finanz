"use client";

import { useState } from "react";
import { saveBetaLead, UserRole } from "@/lib/feedback";
import { Modal } from "./ui/Modal";
import { Button, Field, Select, TextInput } from "./ui/primitives";

export function BetaRequestModal({
  open,
  onClose,
  defaultRole,
}: {
  open: boolean;
  onClose: () => void;
  defaultRole?: UserRole;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>(defaultRole ?? "private");
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  function submit() {
    if (!emailValid) return;
    saveBetaLead({ email, name, role, message });
    setDone(true);
  }

  function close() {
    onClose();
    // Formular nach dem Schließen zurücksetzen.
    setTimeout(() => {
      setDone(false);
      setEmail("");
      setName("");
      setMessage("");
    }, 200);
  }

  return (
    <Modal open={open} onClose={close} title="Beta-Zugang anfragen">
      {done ? (
        <div className="space-y-4 text-center">
          <div className="text-4xl">📬</div>
          <p className="text-sm text-ink-700">
            Danke! Deine Anfrage ist gespeichert. Wir melden uns, sobald ein Beta-Platz frei wird.
          </p>
          <Button variant="primary" className="w-full" onClick={close}>
            Schließen
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-ink-500">
            Trage dich für den frühen Zugang ein. Kein Spam – nur eine Nachricht zum Start.
          </p>
          <Field label="E-Mail *">
            <TextInput
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="du@beispiel.de"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name (optional)">
              <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Vorname" />
            </Field>
            <Field label="Ich bin …">
              <Select value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
                <option value="private">Privatnutzer:in</option>
                <option value="advisor">Berater:in / Coach</option>
              </Select>
            </Field>
          </div>
          <Field label="Was möchtest du planen? (optional)">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              placeholder="z. B. Wohnungskauf mit 35 durchrechnen"
            />
          </Field>
          <Button variant="primary" className="w-full" onClick={submit} disabled={!emailValid}>
            Anfrage senden
          </Button>
          <p className="text-center text-[11px] text-ink-400">
            Wird lokal gespeichert. Keine Anlageberatung.
          </p>
        </div>
      )}
    </Modal>
  );
}
