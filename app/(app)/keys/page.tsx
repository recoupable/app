"use client";

import ApiKeyPage from "@/components/ApiKeyPage/ApiKeyPage";
import ApiKeyProvider from "@/providers/ApiKeyProvider";

const Keys = () => (
  <ApiKeyProvider>
    <ApiKeyPage />
  </ApiKeyProvider>
);

export default Keys;

