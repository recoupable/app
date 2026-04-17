"use client";

import useAutoLogin from "@/hooks/useAutoLogin";
import { useAccountOverride } from "@/providers/AccountOverrideProvider";
import { useCreateTaskForm } from "@/hooks/useCreateTaskForm";
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
import { ScheduleField } from "./ScheduleField";
import { ModelField } from "./ModelField";
import { CreateTaskPageHeader } from "./CreateTaskPageHeader";

const CreateTaskPage = () => {
  useAutoLogin();
  const { accountIdOverride, email } = useAccountOverride();
  const {
    title,
    setTitle,
    prompt,
    setPrompt,
    schedule,
    setSchedule,
    model,
    setModel,
    artistAccountId,
    setArtistAccountId,
    isSubmitting,
    submitError,
    errors,
    handleSubmit,
    handleCancel,
    artistOptions,
    modelOptions,
    defaultModelLabel,
    isModelsLoading,
    isModelsError,
    isLoadingArtists,
  } = useCreateTaskForm();

  return (
    <div className="max-w-full md:max-w-[calc(100vw-200px)] grow py-8 px-6 md:px-12">
      <CreateTaskPageHeader
        title="Create Task"
        description="Create a new scheduled task for an artist."
        accountIdOverride={accountIdOverride}
        overrideDisplay={accountIdOverride ? email || accountIdOverride : null}
      />

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
        <div className="space-y-2">
          <Label htmlFor="task-title">Title</Label>
          <Input
            id="task-title"
            placeholder="Daily summary"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={
              errors.title ? "task-title-error" : undefined
            }
          />
          {errors.title ? (
            <p id="task-title-error" role="alert" className="text-sm text-red-600">
              {errors.title}
            </p>
          ) : null}
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
            aria-invalid={Boolean(errors.prompt)}
            aria-describedby={
              errors.prompt ? "task-prompt-error" : undefined
            }
          />
          {errors.prompt ? (
            <p id="task-prompt-error" role="alert" className="text-sm text-red-600">
              {errors.prompt}
            </p>
          ) : null}
        </div>

        <ScheduleField
          schedule={schedule}
          onScheduleChange={setSchedule}
          isSubmitting={isSubmitting}
          errors={errors}
        />

        <div className="space-y-2">
          <Label htmlFor="task-artist">Artist</Label>
          <Select
            value={artistAccountId}
            onValueChange={setArtistAccountId}
            disabled={
              isSubmitting || isLoadingArtists || artistOptions.length === 0
            }
          >
            <SelectTrigger
              id="task-artist"
              aria-invalid={Boolean(errors.artist)}
              aria-describedby={
                [
                  artistOptions.length === 0 && !isLoadingArtists
                    ? "task-artist-empty"
                    : null,
                  errors.artist ? "task-artist-error" : null,
                ]
                  .filter(Boolean)
                  .join(" ") || undefined
              }
            >
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
          {artistOptions.length === 0 && !isLoadingArtists ? (
            <p id="task-artist-empty" className="text-sm text-muted-foreground">
              No artists are available. Create or select an artist first.
            </p>
          ) : null}
          {errors.artist ? (
            <p id="task-artist-error" role="alert" className="text-sm text-red-600">
              {errors.artist}
            </p>
          ) : null}
        </div>

        <ModelField
          model={model}
          onModelChange={setModel}
          modelOptions={modelOptions}
          defaultModelLabel={defaultModelLabel}
          isModelsLoading={isModelsLoading}
          isModelsError={isModelsError}
          isSubmitting={isSubmitting}
        />

        {submitError ? (
          <p id="task-submit-error" role="alert" className="text-sm text-red-600">
            {submitError}
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || artistOptions.length === 0}
          >
            {isSubmitting ? "Creating..." : "Create Task"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateTaskPage;
