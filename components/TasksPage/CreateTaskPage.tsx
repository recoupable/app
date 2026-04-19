"use client";

import useAutoLogin from "@/hooks/useAutoLogin";
import { CreateTaskFormProvider } from "@/providers/CreateTaskFormProvider";
import { CreateTaskFormBody } from "./CreateTaskFormBody";

const CreateTaskPage = () => {
  useAutoLogin();
  return (
    <div className="max-w-full md:max-w-[calc(100vw-200px)] grow py-8 px-6 md:px-12">
      <CreateTaskFormProvider>
        <CreateTaskFormBody />
      </CreateTaskFormProvider>
    </div>
  );
};

export default CreateTaskPage;
