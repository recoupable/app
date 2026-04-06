import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Address } from "viem";
import useTrackEmail from "./useTrackEmail";
import { uploadFile } from "@/lib/arweave/uploadFile";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import { AccountWithDetails } from "@/lib/supabase/accounts/getAccountWithDetails";
import { fetchOrCreateAccount } from "@/lib/accounts/fetchOrCreateAccount";
import { updateAccountProfile } from "@/lib/accounts/updateAccountProfile";

const useUser = () => {
  const { login, user, logout, getAccessToken } = usePrivy();
  const { address: wagmiAddress } = useAccount();
  const address = (user?.wallet?.address as Address) || wagmiAddress;
  const email = user?.email?.address;
  const [userData, setUserData] = useState<AccountWithDetails | null>(null);
  const { trackId } = useTrackEmail();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [instruction, setInstruction] = useState("");
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [organization, setOrganization] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [roleType, setRoleType] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const imageRef = useRef<HTMLInputElement>(null);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const handleImageSelected = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setImageUploading(true);
    const file = e.target.files?.[0];
    if (!file) {
      setImageUploading(false);
      return;
    }
    try {
      const { uri } = await uploadFile(file);
      setImage(uri);
    } catch {
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setImageUploading(false);
    }
  };

  const removeImage = () => {
    setImage("");
    if (imageRef.current) {
      imageRef.current.value = "";
    }
  };

  const save = async () => {
    if (!userData?.account_id) {
      return;
    }

    setUpdating(true);
    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        return;
      }

      const data = await updateAccountProfile({
        accessToken,
        accountId: userData.account_id,
        instruction,
        organization,
        name,
        image,
        jobTitle,
        roleType,
        companyName,
      });
      setUserData(data);
      setIsModalOpen(false);
    } catch {
      // Error handled silently
    } finally {
      setUpdating(false);
    }
  };

  const isPrepared = () => {
    if (!address) {
      login();
      return false;
    }

    return true;
  };

  const signOut = async () => {
    setIsModalOpen(false);
    setUserData(null);
    setName("");
    setInstruction("");
    setImage("");
    setOrganization("");
    setJobTitle("");
    setRoleType("");
    setCompanyName("");
    await logout();
    router.push("/signin");
  };

  useEffect(() => {
    const init = async () => {
      const accessToken = await getAccessToken();
      const data = await fetchOrCreateAccount({
        email,
        wallet: address,
        accessToken,
      });

      setUserData(data);
      setImage(data.image || "");
      setInstruction(data.instruction || "");
      setName(data.name || "");
      setOrganization(data.organization || "");
      setJobTitle(data.job_title || "");
      setRoleType(data.role_type || "");
      setCompanyName(data.company_name || "");
    };
    if (!email && !address) return;
    init();
  }, [email, address, getAccessToken]);

  return {
    address,
    email,
    login,
    isPrepared,
    userData,
    trackId,
    setIsModalOpen,
    isModalOpen,
    instruction,
    setInstruction,
    image,
    setImage,
    name,
    setName,
    toggleModal,
    handleImageSelected,
    imageRef,
    imageUploading,
    updating,
    save,
    organization,
    setOrganization,
    jobTitle,
    setJobTitle,
    roleType,
    setRoleType,
    companyName,
    setCompanyName,
    signOut,
    removeImage,
  };
};

export default useUser;
