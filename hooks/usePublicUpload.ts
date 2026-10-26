import { usePrivy } from "@privy-io/react-auth";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import { preparePublicUpload } from "@/lib/files/preparePublicUpload";
import { uploadPublicFile } from "@/lib/files/uploadPublicFile";

/** One consumer lifetime. Target changes, logout and unmount retire its writes. */
export function usePublicUpload(target: string) {
  const { user, authenticated, getAccessToken } = usePrivy();
  const actor = authenticated ? user?.id : undefined;
  const apiBaseUrl = getClientApiBaseUrl();
  const context = useMemo(
    () => ({ actor, target, apiBaseUrl }),
    [actor, target, apiBaseUrl],
  );
  const current = useRef<typeof context | null>(context);
  const controllers = useRef(new Set<AbortController>());
  const [pending, setPending] = useState({ context, count: 0 });

  const cancel = useCallback(() => {
    controllers.current.forEach((controller) => controller.abort());
    controllers.current.clear();
    if (current.current) setPending({ context: current.current, count: 0 });
  }, []);
  useLayoutEffect(() => {
    current.current = context;
    return () => {
      current.current = null;
      cancel();
    };
  }, [context, cancel]);

  const begin = useCallback(
    (replace = false) => {
      const canStart =
        current.current === context && getClientApiBaseUrl() === apiBaseUrl;
      if (replace && canStart) cancel();
      const controller = new AbortController();
      if (canStart) {
        controllers.current.add(controller);
        setPending({ context, count: controllers.current.size });
      } else {
        controller.abort();
      }
      const isCurrent = () =>
        current.current === context &&
        !controller.signal.aborted &&
        getClientApiBaseUrl() === apiBaseUrl;
      const assertCurrent = () => {
        if (!isCurrent()) throw new Error("The upload context changed.");
      };
      return {
        isCurrent,
        async upload(file: File) {
          assertCurrent();
          if (!actor) throw new Error("Please sign in to upload files.");
          const prepared = preparePublicUpload(file);
          const accessToken = await getAccessToken();
          assertCurrent();
          if (!accessToken) throw new Error("Please sign in to upload files.");
          const result = await uploadPublicFile({
            file: prepared,
            accessToken,
            apiBaseUrl,
            signal: controller.signal,
          });
          assertCurrent();
          return result;
        },
        reportError(error: unknown) {
          if (isCurrent())
            toast.error(
              error instanceof Error
                ? error.message
                : "Upload failed. Please try again.",
            );
        },
        finish() {
          controllers.current.delete(controller);
          if (current.current === context)
            setPending({ context, count: controllers.current.size });
        },
      };
    },
    [actor, apiBaseUrl, context, getAccessToken, cancel],
  );

  return {
    begin,
    cancel,
    scope: context,
    isUploading: pending.context === context && pending.count > 0,
  };
}
