import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type SetStateAction,
} from "react";

const empty = {
  isModalOpen: false,
  updating: false,
  instruction: "",
  name: "",
  image: "",
  organization: "",
  jobTitle: "",
  roleType: "",
  companyName: "",
};
type ProfileForm = typeof empty;

/** Hide prior-actor fields during bootstrap and reject their late edit callbacks. */
export function useActorProfileForm(actorId: string | null) {
  const [state, setState] = useState({ actorId, form: empty });
  const activeActor = useRef<string | null | undefined>(actorId);
  useLayoutEffect(() => {
    activeActor.current = actorId;
    return () => {
      activeActor.current = undefined;
    };
  }, [actorId]);
  const form = state.actorId === actorId ? state.form : empty;
  const setters = useMemo(() => {
    const setter =
      <K extends keyof ProfileForm>(key: K) =>
      (value: SetStateAction<ProfileForm[K]>) => {
        if (activeActor.current !== actorId) return;
        setState((previous) => {
          if (activeActor.current !== actorId) return previous;
          const current = previous.actorId === actorId ? previous.form : empty;
          return {
            actorId,
            form: {
              ...current,
              [key]: typeof value === "function" ? value(current[key]) : value,
            },
          };
        });
      };
    return {
      setIsModalOpen: setter("isModalOpen"),
      setUpdating: setter("updating"),
      setInstruction: setter("instruction"),
      setName: setter("name"),
      setImage: setter("image"),
      setOrganization: setter("organization"),
      setJobTitle: setter("jobTitle"),
      setRoleType: setter("roleType"),
      setCompanyName: setter("companyName"),
    };
  }, [actorId]);
  return { ...form, ...setters };
}
