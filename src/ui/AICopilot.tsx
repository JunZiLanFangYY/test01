import { useState } from "react";
import { useModelStore } from "@/store/useModelStore";
import { Icon } from "./Icon";

interface Message {
  id: number;
  from: "ai" | "user";
  text: string;
}

const INITIAL: Message[] = [
  {
    id: 0,
    from: "ai",
    text:
      "Analyzing current member. 已加载 22G101 规则集，可询问锚固长度、加密区计算或施工规范建议。",
  },
];

export function AICopilot() {
  const kind = useModelStore((s) => s.kind);
  const [messages, setMessages] = useState<Message[]>(INITIAL);
  const [input, setInput] = useState("");

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: Message = { id: Date.now(), from: "user", text };
    const reply: Message = {
      id: Date.now() + 1,
      from: "ai",
      text: generateMockReply(text, kind),
    };
    setMessages((m) => [...m, userMsg, reply]);
    setInput("");
  };

  return (
    <div className="flex h-1/3 min-h-[240px] flex-col border-t-2 border-outline-variant bg-surface-container-low">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-outline-variant/20 bg-surface-container px-3 py-2">
        <h3 className="flex items-center gap-1.5 text-label-md text-primary">
          <Icon name="smart_toy" fill size={16} />
          AI Structural Copilot
        </h3>
        <div className="h-2 w-2 animate-pulse rounded-full bg-primary" title="Online" />
      </div>

      {/* Chat */}
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-3 text-body-md">
        <div className="mb-2 text-center text-label-sm uppercase tracking-wider text-outline">
          Session Started
        </div>
        {messages.map((m) =>
          m.from === "ai" ? (
            <div key={m.id} className="flex max-w-[90%] gap-2">
              <Icon name="smart_toy" size={16} className="mt-0.5 text-primary" />
              <div className="rounded-r-lg rounded-bl-lg border border-outline-variant/30 bg-surface-container p-2 text-[13px] leading-relaxed text-on-surface-variant">
                {m.text}
              </div>
            </div>
          ) : (
            <div key={m.id} className="flex max-w-[90%] gap-2 self-end">
              <div className="rounded-l-lg rounded-br-lg border border-primary/30 bg-primary-container/20 p-2 text-[13px] leading-relaxed text-on-surface">
                {m.text}
              </div>
            </div>
          )
        )}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 border-t border-outline-variant/20 bg-surface-container-lowest p-2">
        <button
          className="p-1 text-on-surface-variant transition-colors hover:text-primary"
          title="附件"
        >
          <Icon name="attachment" size={18} />
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
          placeholder="询问 Copilot..."
          className="flex-1 rounded-full border border-outline-variant/30 bg-surface-dim px-3 py-1.5 text-[13px] text-on-surface placeholder:text-outline focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          onClick={send}
          className="p-1 text-primary transition-colors hover:opacity-80"
          title="发送"
        >
          <Icon name="send" fill size={18} />
        </button>
      </div>
    </div>
  );
}

function generateMockReply(text: string, kind: string): string {
  const t = text.toLowerCase();
  if (t.includes("锚固") || t.includes("la") || t.includes("anchor")) {
    return "根据 22G101，受拉钢筋抗震锚固长度 laE = ζaE × la；HRB400 + C30 时 la 基本值为 35d。可在右侧 Material Tab 查看当前构件的具体取值。";
  }
  if (t.includes("加密") || t.includes("seismic") || t.includes("stirrup")) {
    if (kind === "column") {
      return "柱箍筋加密区：底层柱根取 max(Hn/3, 500)，其他取 max(Hn/6, hc, 500)；建议加密间距不大于 100mm 或 6d 中较小者。";
    }
    return "梁端箍筋加密区：一/二级抗震 max(2hb, 500)，三/四级 max(1.5hb, 500)。当前模型已自动生成。";
  }
  if (t.includes("100") || t.includes("spacing")) {
    return "已建议 — 你可以在左侧面板将「加密区间距」调到 100mm，3D 视图会即时更新。";
  }
  return `已记录请求："${text}"。可继续提问关于截面、配筋或施工规范的问题。`;
}
