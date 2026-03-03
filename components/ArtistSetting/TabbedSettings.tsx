"use client";

import { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Form from "../Form";
import { validation } from "@/lib/utils/setting";
import { ArtistConnectorsTab } from "./ArtistConnectorsTab";

interface TabbedSettingsProps {
  header: ReactNode;
  generalContent: ReactNode;
  defaultTab: string;
  artistAccountId: string;
  onSave: () => void;
}

/**
 * Tabbed layout for artist settings (General + Connectors).
 * Used in UPDATE mode for artists only.
 */
export function TabbedSettings({
  header,
  generalContent,
  defaultTab,
  artistAccountId,
  onSave,
}: TabbedSettingsProps) {
  return (
    <div className="w-full">
      {header}
      <Tabs defaultValue={defaultTab} className="w-full mt-2">
        <TabsList className="w-full">
          <TabsTrigger value="general" className="flex-1">
            General
          </TabsTrigger>
          <TabsTrigger value="connectors" className="flex-1">
            Connectors
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Form
            id="artist-setting"
            className="w-full grid grid-cols-12 gap-2 md:gap-3"
            validationSchema={validation}
            onSubmit={onSave}
          >
            {generalContent}
          </Form>
        </TabsContent>

        <TabsContent value="connectors">
          <ArtistConnectorsTab artistAccountId={artistAccountId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
