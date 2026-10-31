"use client";

import { Component, type ReactNode } from "react";

export default class SnapshotRenderBoundary extends Component<
  {
    revision: number;
    fallback: string;
    children: ReactNode;
  },
  { revision: number; failed: boolean }
> {
  state = { revision: this.props.revision, failed: false };

  static getDerivedStateFromProps(
    props: { revision: number },
    state: { revision: number },
  ) {
    return props.revision !== state.revision
      ? { revision: props.revision, failed: false }
      : null;
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? (
      <p className="whitespace-pre-wrap text-base leading-7 [overflow-wrap:anywhere]">
        {this.props.fallback}
      </p>
    ) : (
      this.props.children
    );
  }
}
