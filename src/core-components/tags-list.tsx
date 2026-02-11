import { useState, useRef, useEffect } from "react";
import { OverflowList } from "react-overflow-list";
import Tag from "../components/tag";

interface TagsListProps {
  tags: string[];
  className?: string;
}

export default function TagsList({ tags, className }: TagsListProps) {
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
        {[...Array(4)].map((_, i) => (
          <Tag
            key={`tag-${
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              i
            }`}
            loading
          />
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
