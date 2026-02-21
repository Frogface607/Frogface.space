"use client";

let currentUtterance: SpeechSynthesisUtterance | null = null;

export function stopSpeaking() {
  if (typeof window === "undefined") return;
  window.speechSynthesis.cancel();
  currentUtterance = null;
}

export function isSpeaking(): boolean {
  if (typeof window === "undefined") return false;
  return window.speechSynthesis.speaking;
}

function pickRussianVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang === "ru-RU" && v.name.includes("Milena")) ||
    voices.find((v) => v.lang === "ru-RU" && v.localService) ||
    voices.find((v) => v.lang.startsWith("ru")) ||
    voices.find((v) => v.lang === "en-US" && v.localService)
  );
}

export function speak(text: string, onEnd?: () => void): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  stopSpeaking();

  const cleaned = text
    .replace(/[*#_~`>]/g, "")
    .replace(/\[.*?\]\(.*?\)/g, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\n{2,}/g, ". ")
    .replace(/\n/g, " ")
    .trim();

  if (!cleaned) return;

  const utterance = new SpeechSynthesisUtterance(cleaned);
  utterance.lang = "ru-RU";
  utterance.rate = 1.05;
  utterance.pitch = 1.0;

  const voice = pickRussianVoice();
  if (voice) utterance.voice = voice;

  utterance.onend = () => {
    currentUtterance = null;
    onEnd?.();
  };
  utterance.onerror = () => {
    currentUtterance = null;
    onEnd?.();
  };

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

export function preloadVoices(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve();
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) return resolve();
    window.speechSynthesis.onvoiceschanged = () => resolve();
    setTimeout(resolve, 2000);
  });
}
