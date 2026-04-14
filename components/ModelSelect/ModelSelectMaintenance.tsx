const ModelSelectMaintenance = () => (
  <div className="flex items-start gap-2.5 px-3 py-3">
    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-[#345A5D] animate-pulse shrink-0" />
    <p className="text-xs text-muted-foreground leading-relaxed">
      <span className="font-medium text-foreground">Model Maintenance</span>
      <br />
      Selection is temporarily unavailable. Keep chatting and check back shortly!
    </p>
  </div>
);

export default ModelSelectMaintenance;
