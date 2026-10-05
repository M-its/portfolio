type VisualRead = () => (() => void) | undefined;

const pending = new Set<VisualRead>();
let frameId: number | null = null;

function flush() {
  frameId = null;
  const reads = [...pending];
  pending.clear();
  const writes: (() => void)[] = [];
  // Cursor hit testing and card geometry must both finish before either effect writes.
  for (const read of reads) {
    const write = read();
    if (write) writes.push(write);
  }
  for (const write of writes) write();
}

export function scheduleVisualUpdate(read: VisualRead) {
  pending.add(read);
  if (frameId === null) frameId = requestAnimationFrame(flush);
}

export function cancelVisualUpdate(read: VisualRead) {
  pending.delete(read);
  if (pending.size === 0 && frameId !== null) {
    cancelAnimationFrame(frameId);
    frameId = null;
  }
}
