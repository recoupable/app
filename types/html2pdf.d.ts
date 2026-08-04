declare module "html2pdf.js" {
  // html2pdf.js ships no types and exposes a chained builder whose every method
  // returns the builder. `any` is the accurate shape here, not a shortcut.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const html2pdf: any;
  export default html2pdf;
}
