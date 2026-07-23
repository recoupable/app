import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createAgentSchema,
  type CreateAgentFormData,
} from "@/components/Agents/schemas";

export function useAgentForm(initialValues?: Partial<CreateAgentFormData>) {
  const form = useForm<CreateAgentFormData>({
    resolver: zodResolver(createAgentSchema),
    defaultValues: {
      title: initialValues?.title ?? "",
      description: initialValues?.description ?? "",
      prompt: initialValues?.prompt ?? "",
      tags: initialValues?.tags ?? [],
      isPrivate: initialValues?.isPrivate ?? false,
      shareEmails: initialValues?.shareEmails ?? [],
    },
  });

  const isPrivate = form.watch("isPrivate");

  useEffect(() => {
    if (!isPrivate) {
      form.setValue("shareEmails", []);
    } else if (!form.getValues("shareEmails")) {
      form.setValue("shareEmails", []);
    }
  }, [isPrivate, form]);

  return form;
}
