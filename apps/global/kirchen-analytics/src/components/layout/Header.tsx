export function Header() {
  return (
    <header
      className="min-h-[38px] border-b border-[#e8e8e8] px-4 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_1px_5px_rgba(0,0,0,0.075)]"
      style={{
        background: 'linear-gradient(to bottom, #ffffff 0%, #f8f8f8 100%)',
      }}
    >
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-[#333] tracking-wide">
          Kirchenklima Analytics
        </h1>
        <span className="text-xs text-[#999] font-normal">LineMetrics</span>
      </div>
    </header>
  );
}
