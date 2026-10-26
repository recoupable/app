import { useState, useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { usePublicUpload } from "./usePublicUpload";
import { getClientApiBaseUrl } from "@/lib/api/getClientApiBaseUrl";
import useAccountOrganizations from "./useAccountOrganizations";
import { usePrivy } from "@privy-io/react-auth";
import { updateAccountProfile } from "@/lib/accounts/updateAccountProfile";

interface KnowledgeItem {
  name: string;
  url: string;
  type: string;
}

interface OrgData {
  id: string;
  name: string;
  image?: string;
  instruction?: string;
  knowledges?: KnowledgeItem[];
}

const useOrgSettings = (orgId: string | null) => {
  const { data: organizations } = useAccountOrganizations();
  const { getAccessToken } = usePrivy();
  const queryClient = useQueryClient();
  const [orgData, setOrgData] = useState<OrgData | null>(null);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [instruction, setInstruction] = useState("");
  const [knowledges, setKnowledges] = useState<KnowledgeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const imageUpload = usePublicUpload(orgId ?? "no-organization");
  const knowledgeUpload = usePublicUpload(orgId ?? "no-organization");
  const imageRef = useRef<HTMLInputElement>(null);
  const knowledgeRef = useRef<HTMLInputElement>(null);

  // Fetch org data when orgId or organizations change
  useEffect(() => {
    if (!orgId || !organizations) {
      setOrgData(null);
      setName("");
      setImage("");
      setInstruction("");
      setKnowledges([]);
      return;
    }

    // Find the organization from the list (same as button does)
    const selectedOrg = organizations.find(
      (org) => org.organization_id === orgId,
    );

    if (!selectedOrg) {
      setIsLoading(false);
      return;
    }

    // Set name and image from organizations data (same source as button)
    setName(selectedOrg.organization_name || "");
    setImage(selectedOrg.organization_image || "");

    // Fetch account details for instruction and knowledges
    const fetchOrgDetails = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${getClientApiBaseUrl()}/api/accounts/${orgId}`,
        );
        if (response.ok) {
          const data = await response.json();
          // Response structure: { status: "success", account: {...} }
          const account = data.account;
          setOrgData(account);
          setInstruction(account?.instruction || "");
          setKnowledges(account?.knowledges || []);
        }
      } catch (error) {
        console.error("Error fetching org details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrgDetails();
  }, [orgId, organizations]);

  const handleImageSelected = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const operation = imageUpload.begin(true);
      try {
        const { url } = await operation.upload(file);
        if (operation.isCurrent()) setImage(url);
      } catch (error) {
        operation.reportError(error);
      } finally {
        operation.finish();
      }
    },
    [imageUpload],
  );

  const removeImage = useCallback(() => {
    imageUpload.cancel();
    setImage("");
    if (imageRef.current) {
      imageRef.current.value = "";
    }
  }, [imageUpload]);

  const handleKnowledgesSelected = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      const operation = knowledgeUpload.begin();
      const newKnowledges: KnowledgeItem[] = [];
      try {
        for (const file of files) {
          const name = file.name;
          const { url, fileType } = await operation.upload(file);
          newKnowledges.push({ name, url, type: fileType });
        }
        if (operation.isCurrent())
          setKnowledges((prev) => [...prev, ...newKnowledges]);
      } catch (error) {
        operation.reportError(error);
      } finally {
        if (operation.isCurrent() && knowledgeRef.current) {
          knowledgeRef.current.value = "";
        }
        operation.finish();
      }
    },
    [knowledgeUpload],
  );

  const handleDeleteKnowledge = useCallback((index: number) => {
    setKnowledges((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const save = useCallback(async () => {
    if (!orgId) return false;

    setIsSaving(true);
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        return false;
      }

      const data = await updateAccountProfile({
        accessToken,
        accountId: orgId,
        name,
        image,
        instruction,
        knowledges,
      });
      setOrgData(data);
      await queryClient.invalidateQueries({
        queryKey: ["accountOrganizations"],
      });
      return true;
    } finally {
      setIsSaving(false);
    }
  }, [
    orgId,
    name,
    image,
    instruction,
    knowledges,
    queryClient,
    getAccessToken,
  ]);

  return {
    orgData,
    name,
    setName,
    image,
    setImage,
    instruction,
    setInstruction,
    knowledges,
    setKnowledges,
    isLoading,
    isSaving,
    imageUploading: imageUpload.isUploading,
    knowledgeUploading: knowledgeUpload.isUploading,
    imageRef,
    knowledgeRef,
    handleImageSelected,
    removeImage,
    handleKnowledgesSelected,
    handleDeleteKnowledge,
    save,
  };
};

export default useOrgSettings;
