import React from "react";

/** Isolates a single story item so one failing component can't blank the canvas. */
export class StoryBoundary extends React.Component<
  { label: string; children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="rounded-lg border border-dashed border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive">
          {this.props.label}: {this.state.error.message}
        </div>
      );
    }
    return this.props.children;
  }
}

export default StoryBoundary;
