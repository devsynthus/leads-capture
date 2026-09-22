export function formatSlotTime(isoUtc: string): string {
  return new Date(isoUtc).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}
