import { usePrivy } from "@privy-io/react-auth";
import { usePathname, useRouter } from "next/navigation";
import { isPublicRoute } from "@/lib/routes/isPublicRoute";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Address } from "viem";
import { usePublicUpload } from "./usePublicUpload";
import { useAccount } from "wagmi";
import { AccountWithDetails } from "@/lib/supabase/accounts/getAccountWithDetails";
import { ensureAccount } from "@/lib/accounts/ensureAccount";
import { updateAccountProfile } from "@/lib/accounts/updateAccountProfile";

const useUser = () => {
  const { login, user, logout, getAccessToken, ready } = usePrivy();
  const { address: wagmiAddress } = useAccount();
  const address = (user?.wallet?.address as Address) || wagmiAddress;
  const email = user?.email?.address;
  const actorId = ready ? (user?.id ?? null) : null;
  const [accountState, setAccountState] = useState<{
    actorId: string;
    data: AccountWithDetails;
  } | null>(null);
  const userData =
    actorId && accountState?.actorId === actorId ? accountState.data : null;
  const activeActor = useRef(actorId);
  useLayoutEffect(() => {
    activeActor.current = actorId;
    return () => {
      activeActor.current = null;
    };
  }, [actorId]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [instruction, setInstruction] = useState("");
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [organization, setOrganization] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [roleType, setRoleType] = useState("");
  const [companyName, setCompanyName] = useState("");
  const imageUpload = usePublicUpload(userData?.account_id ?? "profile");
  const imageRef = useRef<HTMLInputElement>(null);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const toggleModal = () => setIsModalOpen(!isModalOpen);

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

  const removeImage = () => {
    imageUpload.cancel();
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
      if (!accessToken || !actorId || activeActor.current !== actorId) {
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
      if (activeActor.current !== actorId) return;
      setAccountState({ actorId, data });
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
    imageUpload.cancel();
    setIsModalOpen(false);
    activeActor.current = null;
    setAccountState(null);
    setName("");
    setInstruction("");
    setImage("");
    setOrganization("");
    setJobTitle("");
    setRoleType("");
    setCompanyName("");
    await logout();
    if (!isPublicRoute(pathname)) router.push("/signin");
  };

  useEffect(() => {
    // Wait for Privy to resolve so we never POST /api/accounts before the
    // identifying payload (email) is known (chat#1875).
    if (!actorId) return;
    if (!email && !address) return;
    let cancelled = false;
    const init = async () => {
      const accessToken = await getAccessToken();
      if (cancelled || activeActor.current !== actorId || !accessToken) return;
      const data = await ensureAccount({
        actorId,
        email,
        wallet: address,
        accessToken,
      });
      if (cancelled || activeActor.current !== actorId) return;

      setAccountState({ actorId, data });
      setImage(data.image || "");
      setInstruction(data.instruction || "");
      setName(data.name || "");
      setOrganization(data.organization || "");
      setJobTitle(data.job_title || "");
      setRoleType(data.role_type || "");
      setCompanyName(data.company_name || "");
    };
    init();
    return () => {
      cancelled = true;
    };
  }, [actorId, email, address, getAccessToken]);

  return {
    address,
    email,
    login,
    isPrepared,
    userData,
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
    imageUploading: imageUpload.isUploading,
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
