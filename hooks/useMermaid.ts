import { useEffect, useId, useRef, useState } from "react";
import styles from '../components/Chat/markdown.module.css'; // Import the CSS module

type MermaidApi = {
    run: (options: { nodes: HTMLElement[] }) => void;
    initialize: (config: Record<string, unknown>) => void;
};

export const useMermaid = ({
    id,
    chart
}: {
    id?: string
    chart: string
}) => {
    const containerRef = useRef<HTMLPreElement>(null);
    const generatedId = `mermaid-diagram-${useId()}`;
    const uniqueId = id || generatedId;
    const mermaidRef = useRef<MermaidApi | null>(null);
    const [isLibraryLoaded, setIsLibraryLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        let didCancel = false;

        const loadMermaid = async () => {
            try {
                // @ts-expect-error - TypeScript cannot analyze remote modules (Replaced ts-ignore)
                const mermaidModule = await import(/* webpackIgnore: true */ 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs');
                const mermaid = mermaidModule.default || mermaidModule;

                if (!didCancel) {
                    mermaidRef.current = mermaid;
                    setIsLibraryLoaded(true);
                    setHasError(false);
                }
            } catch (error) {
                if (!didCancel) {
                    console.error('Failed to dynamically import Mermaid:', error, uniqueId);
                }
            }
        };

        // Only attempt import if not already loaded
        if (!mermaidRef.current) {
            loadMermaid();
        }

        // Cleanup function to set flag if component unmounts during import
        return () => {
            didCancel = true;
        };
    }, [uniqueId]); // Run only once on mount

    useEffect(() => {
        // Render/re-render the chart when the library is loaded and the chart changes
        if (isLibraryLoaded && mermaidRef.current && containerRef.current) {
            const mermaid = mermaidRef.current;
            const element = containerRef.current;

            // Reset error state before attempting to render
            setHasError(false);

            // Ensure the container is clean before rendering
            element.innerHTML = chart; // Set content for mermaid to process
            element.removeAttribute('data-processed');

            try {
                mermaid.run({ nodes: [element] });
                // Ensure visibility is set correctly after successful render
                element.style.visibility = 'visible';
            } catch (error) {
                console.error('Mermaid rendering failed:', error, uniqueId);
                // Set error state to true on failure
                setHasError(true);
                // Clear the container content on error to prevent showing raw code or old diagrams
                element.innerHTML = '';
                // Hide the container to avoid empty space if needed, or let fallback handle layout
                element.style.visibility = 'hidden';
            }
        } else if (isLibraryLoaded && !containerRef.current) {
            // Handle case where ref might be null unexpectedly after load
            console.warn('Mermaid container ref not available after library load:', uniqueId);
            setHasError(true); // Indicate an error state
        }
    }, [isLibraryLoaded, chart, uniqueId]); // Depend on load state and chart content

    useEffect(() => {
        const parent = containerRef.current?.parentElement as HTMLElement | null;
        const grandparent = parent?.parentElement as HTMLElement | null;

        if (parent) {
            parent.classList.add(styles.mermaidParentOverride);
        }
        if (grandparent) {
            grandparent.classList.add(styles.mermaidGrandparentOverride);
        }

        // Cleanup function to remove classes when component unmounts or dependencies change
        return () => {
            if (parent) {
                parent.classList.remove(styles.mermaidParentOverride);
            }
            if (grandparent) {
                grandparent.classList.remove(styles.mermaidGrandparentOverride);
            }
        };
    }, [isLibraryLoaded, hasError, chart]); // Keep dependencies as they are working

    return { isLibraryLoaded, hasError, uniqueId, containerRef };
};

