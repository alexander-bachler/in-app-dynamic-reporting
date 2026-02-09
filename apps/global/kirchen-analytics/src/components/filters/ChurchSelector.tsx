import { useState } from 'react';
import { useFilterStore } from '@/stores/filterStore';
import { useDataStore } from '@/stores/dataStore';
import type { ObjectTreeNode } from '@/types';

function flatNodes(nodes: ObjectTreeNode[]): { id: string; title: string }[] {
  return nodes.flatMap((n) => [
    { id: n.object_id, title: n.title },
    ...flatNodes(n.children ?? []),
  ]);
}

function TreeNode({
  node,
  selectedChurchIds,
  onToggle,
  level,
}: {
  node: ObjectTreeNode;
  selectedChurchIds: string[];
  onToggle: (id: string) => void;
  level: number;
}) {
  const [expanded, setExpanded] = useState(level < 1);
  const hasChildren = (node.children?.length ?? 0) > 0;

  return (
    <div className="border-b border-[#eee] last:border-b-0">
      <div
        className="flex cursor-pointer items-center gap-2 px-2 py-1.5 hover:bg-[#f0f0f0]"
        style={{ paddingLeft: `${8 + level * 12}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="inline-flex w-5 shrink-0 items-center justify-center text-[#666]"
            aria-label={expanded ? 'Zuklappen' : 'Aufklappen'}
          >
            {expanded ? '−' : '+'}
          </button>
        ) : (
          <span className="w-5 shrink-0" />
        )}
        <label className="flex flex-1 cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={selectedChurchIds.includes(node.object_id)}
            onChange={() => onToggle(node.object_id)}
            className="rounded border-[#ccc]"
          />
          <span className="text-sm text-[#333]">{node.title}</span>
        </label>
      </div>
      {hasChildren && expanded && (
        <div>
          {(node.children ?? []).map((child) => (
            <TreeNode
              key={child.object_id}
              node={child}
              selectedChurchIds={selectedChurchIds}
              onToggle={onToggle}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function ChurchSelector() {
  const { objectTree } = useDataStore();
  const { selectedChurchIds, toggleChurch, clearChurchSelection, selectAllChurches } =
    useFilterStore();
  const all = flatNodes(objectTree);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-[#333]">Objekte</label>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => selectAllChurches(all.map((a) => a.id))}
            className="text-xs text-[#6095D9] hover:underline"
          >
            Alle
          </button>
          <button
            type="button"
            onClick={clearChurchSelection}
            className="text-xs text-[#666] hover:underline"
          >
            Löschen
          </button>
        </div>
      </div>
      <div className="max-h-52 overflow-y-auto rounded border border-[#e3e3e3] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        {objectTree.length === 0 ? (
          <p className="p-2 text-sm text-[#666]">Keine Objekte geladen.</p>
        ) : (
          objectTree.map((node) => (
            <TreeNode
              key={node.object_id}
              node={node}
              selectedChurchIds={selectedChurchIds}
              onToggle={toggleChurch}
              level={0}
            />
          ))
        )}
      </div>
    </div>
  );
}
