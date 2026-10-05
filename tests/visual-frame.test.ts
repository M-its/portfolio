// @vitest-environment happy-dom
import { afterEach, expect, it, vi } from "vitest";
import {
  cancelVisualUpdate,
  scheduleVisualUpdate,
} from "../src/utils/visual-frame";

afterEach(() => vi.restoreAllMocks());

it("coalesces repeated input and reads both effects before writing either", () => {
  let frame: FrameRequestCallback;
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    frame = callback;
    return 1;
  });
  const steps: string[] = [];
  const cursor = () => {
    steps.push("read cursor");
    return () => {
      steps.push("write cursor");
    };
  };
  const glare = () => {
    steps.push("read glare");
    return () => {
      steps.push("write glare");
    };
  };
  scheduleVisualUpdate(cursor);
  scheduleVisualUpdate(glare);
  scheduleVisualUpdate(cursor);
  expect(requestAnimationFrame).toHaveBeenCalledOnce();
  frame!(0);
  expect(steps).toEqual([
    "read cursor",
    "read glare",
    "write cursor",
    "write glare",
  ]);
  expect(requestAnimationFrame).toHaveBeenCalledOnce();
});

it("keeps another effect's frame when one unmounts and cancels when none remain", () => {
  let frame: FrameRequestCallback;
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    frame = callback;
    return 1;
  });
  const cancel = vi.spyOn(window, "cancelAnimationFrame");
  const cursor = vi.fn(() => undefined);
  const glare = vi.fn(() => undefined);
  scheduleVisualUpdate(cursor);
  scheduleVisualUpdate(glare);
  cancelVisualUpdate(cursor);
  expect(cancel).not.toHaveBeenCalled();
  frame!(0);
  expect(cursor).not.toHaveBeenCalled();
  expect(glare).toHaveBeenCalledOnce();
  scheduleVisualUpdate(cursor);
  cancelVisualUpdate(cursor);
  expect(cancel).toHaveBeenCalledWith(1);
});
