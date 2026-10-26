import { usePublicUpload } from "./usePublicUpload";
import { useEffect, useRef, useState } from "react";
import { ArtistRecord } from "@/types/Artist";
import { useOrganization } from "@/providers/OrganizationProvider";

const useArtistSetting = () => {
  const imageRef = useRef<HTMLInputElement>(null);
  const baseRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState("");
  const [instruction, setInstruction] = useState("");
  const [name, setName] = useState("");
  const [label, setLabel] = useState("");
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [appleUrl, setAppleUrl] = useState("");
  const [tiktok, setTikTok] = useState("");
  const [instagram, setInstagram] = useState("");
  const [youtube, setYoutube] = useState("");
  const [twitter, setTwitter] = useState("");
  const [facebook, setFacebook] = useState("");
  const [threads, setThreads] = useState("");
  const [bases, setBases] = useState<
    Array<{ name: string; url: string; type: string }>
  >([]);
  const [question, setQuestion] = useState("");
  const [editableArtist, setEditableArtist] = useState<ArtistRecord | null>(
    null,
  );
  const { selectedOrgId } = useOrganization();
  const uploadTarget = JSON.stringify([
    editableArtist?.account_id,
    selectedOrgId,
  ]);
  const imageUpload = usePublicUpload(uploadTarget);
  const knowledgeUpload = usePublicUpload(uploadTarget);

  const handleDeleteKnowledge = (index: number) => {
    const temp = [...bases];
    temp.splice(index, 1);
    setBases(temp);
  };

  const handleImageSelected = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
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
  };

  const handleKnowledgesSelected = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (!files?.length) return;
    const operation = knowledgeUpload.begin();
    const temp: Array<{ name: string; url: string; type: string }> = [];
    try {
      if (files) {
        for (const file of files) {
          const name = file.name;
          const { url, fileType } = await operation.upload(file);
          temp.push({
            name,
            url,
            type: fileType,
          });
        }
      }
      if (operation.isCurrent()) setBases((previous) => [...previous, ...temp]);
    } catch (error) {
      operation.reportError(error);
    } finally {
      operation.finish();
    }
  };

  const clearParams = () => {
    imageUpload.cancel();
    knowledgeUpload.cancel();
    setName("");
    setImage("");
    setInstruction("");
    setInstagram("");
    setLabel("");
    setSpotifyUrl("");
    setAppleUrl("");
    setTikTok("");
    setYoutube("");
    setTwitter("");
    setFacebook("");
    setThreads("");
    setBases([]);
    setEditableArtist(null);
  };

  useEffect(() => {
    if (editableArtist) {
      setName(editableArtist?.name || "");
      setImage(editableArtist?.image || "");
      setLabel(editableArtist?.label || "");
      setInstruction(editableArtist?.instruction || "");
      setBases(editableArtist?.knowledges || []);
      const socialMediaTypes = {
        TWITTER: setTwitter,
        YOUTUBE: setYoutube,
        APPLE: setAppleUrl,
        INSTAGRAM: setInstagram,
        SPOTIFY: setSpotifyUrl,
        TIKTOK: setTikTok,
        FACEBOOK: setFacebook,
        THREADS: setThreads,
      };
      Object.entries(socialMediaTypes).forEach(([type, setter]) => {
        const link = editableArtist?.account_socials?.find(
          (item) => item.type === type,
        )?.link;
        setter(link || "");
      });
    }
  }, [editableArtist]);

  return {
    handleImageSelected,
    handleKnowledgesSelected,
    image,
    setImage,
    instruction,
    setInstruction,
    name,
    setName,
    label,
    setLabel,
    spotifyUrl,
    setSpotifyUrl,
    appleUrl,
    setAppleUrl,
    tiktok,
    setTikTok,
    instagram,
    setInstagram,
    youtube,
    setYoutube,
    twitter,
    setTwitter,
    facebook,
    setFacebook,
    threads,
    setThreads,
    bases,
    setBases,
    imageRef,
    baseRef,
    imageUploading: imageUpload.isUploading,
    question,
    setQuestion,
    clearParams,
    knowledgeUploading: knowledgeUpload.isUploading,
    handleDeleteKnowledge,
    editableArtist,
    setEditableArtist,
  };
};

export default useArtistSetting;
