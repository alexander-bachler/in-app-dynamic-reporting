import { useState } from 'react';
import { TimeRangeSelector } from '../filters/TimeRangeSelector';
import { ChurchSelector } from '../filters/ChurchSelector';
import { MeasuringPointSelector } from '../filters/MeasuringPointSelector';
import { ParameterSelector } from '../filters/ParameterSelector';

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`flex flex-col border-r border-[#e3e3e3] bg-[#f8f8f8] transition-[width] ${
        collapsed ? 'w-12' : 'w-72'
      }`}
      style={{ boxShadow: '1px 0 2px rgba(0,0,0,0.05)' }}
    >
      <div
        className="flex h-10 min-h-[40px] items-center justify-between border-b border-[#e3e3e3] px-2"
        style={{
          background: 'linear-gradient(to bottom, #e7e7e7 0%, #dadada 100%)',
        }}
      >
        {!collapsed && (
          <span className="text-sm font-semibold text-[#333]">Filter</span>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="rounded p-1.5 text-[#646567] hover:bg-[#e7e7e7] hover:text-[#333]"
          aria-label={collapsed ? 'Sidebar öffnen' : 'Sidebar schließen'}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>
      {!collapsed && (
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto bg-[#f8f8f8] p-3">
          <TimeRangeSelector />
          <ChurchSelector />
          <MeasuringPointSelector />
          <ParameterSelector />
        </div>
      )}
    </aside>
  );
}
