"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { toast } from "react-toastify";
import useAutoLogin from "@/hooks/useAutoLogin";
import { useArtistProvider } from "@/providers/ArtistProvider";
import { useAccountOverride } from "@/providers/AccountOverrideProvider";
import { createTask } from "@/lib/tasks/createTask";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FormErrors = Partial<Record<"title" | "prompt" | "schedule" | "artist", string>>;

const DEFAULT_SCHEDULE = "0 9 * * *";

const CreateTaskPage = () => {
  useAutoLogin();

  const router = useRouter();
  const { getAccessToken } = usePrivy();
  const { sorted, selectedArtist, isLoading } = useArtistProvider();
  const { accountIdOverride, email } = useAccountOverride();

  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE);
  const [model, setModel] = useState("");
  const [artistAccountId, setArtistAccountId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const artistOptions = useMemo(
    () =>
      sorted.filter((artist) => !!artist.account_id).map((artist) => ({
        id: artist.account_id,
        label: artist.name?.trim() || artist.account_id,
      })),
    [sorted],
  );

  useEffect(() => {
    if (!artistAccountId && selectedArtist?.account_id) {
      setArtistAccountId(selectedArtist.account_id);
    }
  }, [artistAccountId, selectedArtist?.account_id]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    const nextErrors: FormErrors = {};
    if (!title.trim()) nextErrors.title = "Title is required.";
    if (!prompt.trim()) nextErrors.prompt = "Prompt is required.";
    if (!schedule.trim()) nextErrors.schedule = "Schedule is required.";
    if (!artistAccountId.trim()) nextErrors.artist = "Artist is required.";

    setErrors(nextErrors);
    setSubmitError(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("Please sign in to create a task.");
      }

      await createTask(accessToken, {
        title: title.trim(),
        prompt: prompt.trim(),
        schedule: schedule.trim(),
        artist_account_id: artistAccountId,
        ...(model.trim() ? { model: model.trim() } : {}),
        ...(accountIdOverride ? { account_id: accountIdOverride } : {}),
      });

      toast.success("Task created successfully.");
      router.push("/tasks");
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create task.";
      setSubmitError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-full md:max-w-[calc(100vw-200px)] grow py-8 px-6 md:px-12">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-left font-heading text-3xl font-bold dark:text-white mb-4">
            Create Task
          </h1>
          <p className="text-lg text-muted-foreground text-left font-light font-sans max-w-2xl">
            Create a new scheduled task for an artist.
          </p>
          {accountIdOverride && (
            <p className="mt-2 text-sm text-muted-foreground">
              Creating as override account:{" "}
              <span className="font-mono">{email || accountIdOverride}</span>
            </p>
          )}
        </div>
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href="/tasks">Back to Tasks</Link>
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
        <div className="space-y-2">
          <Label htmlFor="task-title">Title</Label>
          <Input
            id="task-title"
            placeholder="Daily summary"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            disabled={isSubmitting}
          />
          {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="task-prompt">Prompt</Label>
          <Textarea
            id="task-prompt"
            placeholder="Summarize fan growth and top events from yesterday."
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            rows={6}
            disabled={isSubmitting}
          />
          {errors.prompt && (
            <p className="text-sm text-red-600">{errors.prompt}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="task-schedule">Schedule (cron)</Label>
          <Input
            id="task-schedule"
            placeholder="0 9 * * *"
            value={schedule}
            onChange={(event) => setSchedule(event.target.value)}
            disabled={isSubmitting}
          />
          <p className="text-xs text-muted-foreground">
            Example: <span className="font-mono">0 9 * * *</span> runs daily at
            09:00 UTC.
          </p>
          {errors.schedule && (
            <p className="text-sm text-red-600">{errors.schedule}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="task-artist">Artist</Label>
          <Select
            value={artistAccountId}
            onValueChange={setArtistAccountId}
            disabled={isSubmitting || isLoading || artistOptions.length === 0}
          >
            <SelectTrigger id="task-artist">
              <SelectValue placeholder="Select an artist" />
            </SelectTrigger>
            <SelectContent>
              {artistOptions.map((artist) => (
                <SelectItem key={artist.id} value={artist.id}>
                  {artist.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {artistOptions.length === 0 && !isLoading && (
            <p className="text-sm text-muted-foreground">
              No artists are available. Create or select an artist first.
            </p>
          )}
          {errors.artist && <p className="text-sm text-red-600">{errors.artist}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="task-model">Model (optional)</Label>
          <Input
            id="task-model"
            placeholder="anthropic/claude-sonnet-4.5"
            value={model}
            onChange={(event) => setModel(event.target.value)}
            disabled={isSubmitting}
          />
        </div>

        {submitError && <p className="text-sm text-red-600">{submitError}</p>}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button asChild variant="outline" disabled={isSubmitting}>
            <Link href="/tasks">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting || artistOptions.length === 0}>
            {isSubmitting ? "Creating..." : "Create Task"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateTaskPage;
