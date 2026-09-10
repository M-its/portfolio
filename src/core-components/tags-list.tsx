import { useEffect, useRef, useState } from "react";
import { OverflowList } from "react-overflow-list";
import Tag from "../components/tag";

interface TagsListProps {
  tags: string[];
  className?: string;
  maxVisibleItems?: number;
  expandable?: boolean;
}

const SKELETON_TAGS = Array.from({ length: 4 }, (_, i) => `skeleton-tag-${i}`);

export default function TagsList({
  tags,
  className,
  maxVisibleItems,
  expandable = true,
}: TagsListProps) {
  const [showAll, setShowAll] = useState(false);
  const overflowItemsRef = useRef<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutsideToCloseTags = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowAll(false);
      }
    };

    if (showAll) {
      document.addEventListener("mousedown", handleClickOutsideToCloseTags);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutsideToCloseTags);
    };
  }, [showAll]);

  if (!tags?.length) {
    return (
      <div className={`flex gap-2 overflow-hidden ${className || ""}`}>
        {SKELETON_TAGS.map((id) => (
          <Tag key={id} loading />
        ))}
      </div>
    );
  }

  if (!expandable) {
    const visibleTags = tags.slice(0, maxVisibleItems);
    const hiddenTags = tags.slice(maxVisibleItems);

    return (
      <div
        title={
          hiddenTags.length > 0
            ? `Stack completa: ${tags.join(", ")}`
            : undefined
        }
        className={`flex w-full flex-wrap content-start gap-2 overflow-hidden ${className || ""}`}
      >
        {visibleTags.map((tag) => (
          <Tag key={tag} size="md" className="shrink-0 whitespace-nowrap">
            {tag}
          </Tag>
        ))}
      </div>
    );
  }

  if (showAll) {
    return (
      <div ref={containerRef} className={`w-full ${className || ""}`}>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Tag key={tag} className="shrink-0 whitespace-nowrap">
              {tag}
            </Tag>
          ))}
          <Tag
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setShowAll(false)}
          >
            Mostrar menos
          </Tag>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full flex items-center ${className || ""}`}
    >
      <div className="relative w-full overflow-hidden whitespace-nowrap">
        <OverflowList
          items={tags}
          collapseFrom="end"
          minVisibleItems={0}
          itemRenderer={(tag) => (
            <Tag
              key={tag}
              size="md"
              className="mr-2 shrink-0 whitespace-nowrap"
            >
              {tag}
            </Tag>
          )}
          overflowRenderer={(overflowItems) => {
            overflowItemsRef.current = overflowItems;
            return overflowItems.length > 0 ? (
              <Tag
                title={overflowItems.join(", ")}
                size="md"
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setShowAll(true)}
              >
                +{overflowItems.length}
              </Tag>
            ) : null;
          }}
        />
      </div>
    </div>
  );
}
