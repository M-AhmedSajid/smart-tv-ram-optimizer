export const LiveConsole = ({ logs, isOpen, setIsOpen }) => {
  return (
    <div
      className={`bg-black border border-bento-border rounded-xl p-3.5 shadow-inner flex flex-col ${isOpen ? "h-50" : "h-auto"} transition-all`}
    >
      <div className="flex items-center justify-between border-b border-bento-border/40 pb-1.5 mb-1.5 gap-3">
        <span className="text-[9px] font-mono tracking-wider font-bold text-gray-400 uppercase">
          Operational Live Log Console
        </span>
        <span className="text-[10px] font-mono text-gray-500 bg-bento-bg px-2 py-0.5 rounded border border-bento-border">
          {logs.length} entries
        </span>

        <button
          type="button"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
          className="inline-flex items-center gap-1 rounded-md border border-bento-border bg-bento-bg px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-sky-300 transition hover:bg-[#1c1c20]"
        >
          {isOpen ? "Collapse" : "Expand"}
        </button>
      </div>

      {isOpen ? (
        <div className="flex-1 overflow-y-auto font-mono text-[11px] text-emerald-400/90 space-y-1 pr-2 custom-scrollbar select-text">
          {logs.length === 0 ? (
            <div className="text-gray-500 text-xs">
              No messages yet. Trigger the simulator to see live console events.
            </div>
          ) : (
            logs.map((log, index) => {
              const textColorClass = log.includes("[HIT]")
                ? "text-emerald-450 font-semibold"
                : log.includes("[MISS]")
                  ? "text-rose-400/90 font-medium"
                  : "text-emerald-400/80";

              return (
                <div
                  key={`log-${index}`}
                  className={`py-0.5 border-b border-bento-border/10 hover:bg-neutral-900/40 rounded leading-relaxed wrap-break-word ${textColorClass}`}
                >
                  <span className="text-gray-600 font-bold">&gt;&nbsp;</span>
                  {log}
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="text-[11px] text-gray-500 font-mono">
          Console collapsed. Expand to view live operation logs.
        </div>
      )}
    </div>
  );
};
