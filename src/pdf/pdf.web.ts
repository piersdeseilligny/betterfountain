// Browser-host placeholder. PDF export is disabled by commands.ts in web hosts.
export const GeneratePdf = (): never => {
  throw new Error("PDF export is unavailable in the web extension host.");
};
