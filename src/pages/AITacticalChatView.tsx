import React, { useState, useRef, useEffect } from 'react';
import { useMission } from '../store/missionContext';
import { apiClient } from '../services/api';
import {
  MessageSquareCode,
  Send,
  Sparkles,
  Zap,
  Cpu,
  User,
  Bot,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  modelUsed?: string;
}

export const AITacticalChatView: React.FC = () => {
  const { activeMission, tasks } = useMission();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      role: 'model',
      content:
        'Tactical Command Intelligence operational. I am actively monitoring the Sector 4 Flood Evacuation mission.\n\nAll 8 ALS ambulances are coordinated with Shelters S1, S2, and S3. Route R2 is flagged as a hydrological breach point (+0.92m water depth). How may I assist your command decisions?',
      timestamp: '22:40',
      modelUsed: 'gemini-3.8-flash',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'standard' | 'low_latency' | 'deep_thinking'>('standard');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputText('');
    setLoading(true);

    try {
      let replyText = '';
      let usedModel = 'gemini-3.8-flash';

      if (mode === 'low_latency') {
        const triage = await apiClient.lowLatencyTriage(textToSend);
        replyText = triage.analysis;
        usedModel = 'gemini-3.1-flash-lite';
      } else {
        const chatRes = await apiClient.sendTacticalChat(
          [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          {
            mission: activeMission?.title,
            progress: activeMission?.progress,
            planVersion: activeMission?.planVersion,
            activeTasksCount: tasks.length,
          }
        );
        replyText = chatRes.reply;
        usedModel = mode === 'deep_thinking' ? 'gemini-3.1-pro-preview' : 'gemini-3.8-flash';
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        content: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: usedModel,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'Assess flood evacuation bottlenecks on Route R2',
    'Recommend optimal patient redistribution across Shelters S1, S2, S3',
    'Calculate risk vector if ambulance fleet is reduced to 5 units',
    'Generate SitRep summary for District Disaster Magistrate',
  ];

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-2xs">
      {/* Chat Header */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-zinc-950 dark:bg-white text-white dark:text-zinc-950">
            <MessageSquareCode className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Tactical AI Operations Co-Pilot
              </h2>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <p className="text-[11px] text-zinc-500 font-mono">
              Grounding: Active Mission Telemetry &middot; OpenRouting &middot; Doppler Sensors
            </p>
          </div>
        </div>

        {/* Intelligence Engine Mode Selector */}
        <div className="flex items-center gap-1 p-0.5 bg-zinc-200/80 dark:bg-zinc-800 rounded-lg text-xs font-mono">
          <button
            onClick={() => setMode('standard')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
              mode === 'standard'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Standard (3.8-Flash)
          </button>
          <button
            onClick={() => setMode('low_latency')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all flex items-center gap-1 ${
              mode === 'low_latency'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Zap className="w-3 h-3 text-amber-500" />
            <span>Fast Triage (Flash-Lite)</span>
          </button>
          <button
            onClick={() => setMode('deep_thinking')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all flex items-center gap-1 ${
              mode === 'deep_thinking'
                ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Cpu className="w-3 h-3 text-purple-500" />
            <span>High Thinking (Pro)</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-3xl ${
              msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                msg.role === 'user'
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-950'
                  : 'bg-amber-400 text-zinc-950'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`p-4 rounded-xl text-xs space-y-1 ${
                msg.role === 'user'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-medium'
                  : 'bg-zinc-50 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700/80 leading-relaxed font-mono whitespace-pre-wrap'
              }`}
            >
              <div className="flex items-center justify-between gap-3 text-[10px] text-zinc-400 font-mono pb-1 border-b border-zinc-200/40 dark:border-zinc-700/40 mb-1">
                <span>{msg.role === 'user' ? 'Duty Officer' : 'PLANOVA Tactical AI'}</span>
                <span>
                  {msg.timestamp} {msg.modelUsed && `· ${msg.modelUsed}`}
                </span>
              </div>
              <p>{msg.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 mr-auto max-w-3xl">
            <div className="w-7 h-7 rounded-lg bg-amber-400 text-zinc-950 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/80 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs flex items-center gap-2 text-zinc-500 font-mono">
              <Sparkles className="w-4 h-4 animate-spin text-amber-500" />
              <span>Analyzing telemetry, sensor streams, and road clearances...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="px-4 py-2 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/30 overflow-x-auto flex items-center gap-2">
        <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold shrink-0">
          Suggested:
        </span>
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(qp)}
            className="px-2.5 py-1 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-md text-[11px] text-zinc-700 dark:text-zinc-300 font-mono shrink-0 transition-colors cursor-pointer"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type tactical command or query (e.g. 'Status of Route R2?')..."
            className="flex-1 px-4 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white font-mono"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="px-4 py-2.5 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
