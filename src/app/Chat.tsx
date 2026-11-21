"use client";

import { useEffect, useRef, useState } from "react";
import { offlineAnswers, suggestedQuestions } from "./data";
import { useI18n } from "./I18n";

type Message = { role: "user" | "assistant"; content: string; offline?: boolean };

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

const GREETING: Message = {
  role: "assistant",
  content: "Hi, I’m Sentinel! Ask me anything about pregnancy, birth, recovery or caring for a newborn."
};

function offlineAnswer(question: string) {
  const words: string[] = question.toLowerCase().match(/[a-z]+/g) ?? [];
  let best = { score: 0, answer: "" };
  for (const entry of offlineAnswers) {
    const score = entry.keywords.filter((k) => words.includes(k)).length;
    if (score > best.score) best = { score, answer: entry.answer };
  }
  return (
    best.answer ||
    "I can’t reach my AI brain right now, but try asking about hospital bags, signs of labour, feeding, sleep, food or how partners can help."
  );
}

export default function Chat({ prefill }: { prefill: { text: string; id: number } | null }) {
  const { lang } = useI18n();
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [canListen, setCanListen] = useState(false);
  const [canSpeak, setCanSpeak] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    const w = window as unknown as Record<string, unknown>;
    setCanListen(!!(w.SpeechRecognition || w.webkitSpeechRecognition));
    setCanSpeak("speechSynthesis" in window);
    return () => {
      recognitionRef.current?.stop();
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    if (!prefill) return;
    setInput(prefill.text);
    inputRef.current?.focus({ preventScroll: true });
  }, [prefill]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    const question = text.trim();
    if (!question || loading) return;
    const history: Message[] = [...messages, { role: "user", content: question }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setLoading(true);

    const showAnswer = (content: string, offline = false) =>
      setMessages((current) => [...current.slice(0, -1), { role: "assistant", content, offline }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lang,
          messages: history.filter((m) => m !== GREETING && !m.offline).map(({ role, content }) => ({ role, content }))
        })
      });
      if (!res.ok || !res.body) throw new Error(`chat ${res.status}`);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let answer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        showAnswer(answer);
      }
      if (!answer.trim()) throw new Error("empty answer");
    } catch {
      showAnswer(offlineAnswer(question), true);
      fetch("/api/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "offline" })
      }).catch(() => undefined);
    } finally {
      setLoading(false);
    }
  }

  function toggleListening() {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const w = window as unknown as Record<string, new () => SpeechRecognitionLike>;
    const Recognition = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Recognition) return;
    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).map((r) => r[0].transcript).join("");
      setInput(transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }

  function toggleSpeak(index: number, text: string) {
    window.speechSynthesis.cancel();
    if (speakingIndex === index) {
      setSpeakingIndex(null);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);
    setSpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  }

  return (
    <section className="ask-section section-wrap" id="ask">
      <div className="ask-card">
        <div className="ask-copy">
          <div className="eyebrow light-eyebrow">ASK SENTINEL · AI-POWERED</div>
          <h2>What’s on your mind today?</h2>
          <p>Type or speak your question and Sentinel will answer. Tap the speaker on any answer to hear it read aloud.</p>
          <div className="chips" aria-label="Suggested questions">
            {suggestedQuestions.map((q) => (
              <button type="button" key={q} onClick={() => send(q)} disabled={loading}>{q}</button>
            ))}
          </div>
        </div>

        <div className="chat-box">
          <div className="chat-log" ref={logRef} aria-live="polite">
            {messages.map((m, i) => (
              <div key={i} className={`bubble ${m.role}`}>
                {m.content || <span className="typing" aria-label="Sentinel is typing"><i /><i /><i /></span>}
                {m.role === "assistant" && m.content && (
                  <div className="bubble-meta">
                    {m.offline && <span className="offline-tag">Offline answer</span>}
                    {canSpeak && !(loading && i === messages.length - 1) && (
                      <button type="button" onClick={() => toggleSpeak(i, m.content)} aria-label={speakingIndex === i ? "Stop reading" : "Read aloud"}>
                        {speakingIndex === i ? "■ Stop" : "🔊 Listen"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          <form className="chat-input" onSubmit={(e) => { e.preventDefault(); send(input); }}>
            <label htmlFor="motherhood-question" className="sr-only">Ask a motherhood question</label>
            <input
              ref={inputRef}
              id="motherhood-question"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={listening ? "Listening…" : "e.g. What should I prepare before my baby arrives?"}
              maxLength={500}
              autoComplete="off"
            />
            {canListen && (
              <button type="button" className={listening ? "mic on" : "mic"} onClick={toggleListening} aria-label={listening ? "Stop listening" : "Speak your question"}>
                🎤
              </button>
            )}
            <button type="submit" aria-label="Send question" disabled={loading || !input.trim()}>→</button>
          </form>
          <small>Sentinel gives general information for a school science project. It isn’t a doctor.</small>
        </div>
      </div>
    </section>
  );
}
