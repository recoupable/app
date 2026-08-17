"use client";

import Form from "../Form";
import { accountValidation } from "@/lib/utils/setting";
import ImageSelect from "./ImageSelect";
import { useUserProvider } from "@/providers/UserProvder";
import ArtistInstructionTextArea from "./ArtistInstructionTextArea";
import Input from "../Input";
import AccountIdDisplay from "../ArtistSetting/AccountIdDisplay";

const Account = () => {
  const {
    setInstruction,
    setName,
    instruction,
    name,
    updating,
    jobTitle,
    setJobTitle,
    companyName,
    setCompanyName,
    save,
    signOut,
    userData,
  } = useUserProvider();

  return (
    <Form
      id="account-setting"
      className="w-full flex flex-col items-center max-w-md mx-auto pb-2"
      validationSchema={accountValidation}
    >
      {/* Header Section */}
      <div className="w-full flex flex-col items-center space-y-4 mb-4">
        {/* Centered Profile Image */}
        <div className="flex flex-col items-center gap-3">
          <ImageSelect />
          {userData?.account_id && (
            <div className="mt-1">
            <AccountIdDisplay
              accountId={userData.account_id}
                label="ID"
            />
            </div>
          )}
        </div>
      </div>

      {/* Form Fields Section */}
      <div className="w-full space-y-5 mb-6">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          label="Name"
          id="name"
          name="name"
          hookToForm
          className="bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring/60 focus-visible:ring-offset-1 transition-all"
        />
        
        <div className="grid grid-cols-2 gap-4">
          <Input
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            label="Job Title"
            id="jobTitle"
            name="jobTitle"
            hookToForm
            className="bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring/60 focus-visible:ring-offset-1 transition-all"
        />
        <Input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            label="Company"
            id="companyName"
            name="companyName"
          hookToForm
            className="bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring/60 focus-visible:ring-offset-1 transition-all"
        />
      </div>

        {/* Hidden Fields (Preserved for future use) */}
        {/* 
        <Input value={roleType} onChange={(e) => setRoleType(e.target.value)} label="Role" id="roleType" name="roleType" hookToForm />
        <Input value={organization} onChange={(e) => setOrganization(e.target.value)} label="Organization" id="organization" name="organization" hookToForm /> 
        */}

        <div className="pt-2">
          <div className="mb-1.5 flex justify-between items-baseline">
            <label className="text-sm font-medium text-foreground">Custom Instructions</label>
            <span className="text-[10px] text-muted-foreground">Help the AI know you better</span>
      </div>
        <ArtistInstructionTextArea
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
            label="" // Label handled above for custom styling
          id="instruction"
          name="instruction"
            rows={4}
          hookToForm
            className="bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring/60 focus-visible:ring-offset-1 transition-all text-sm resize-none"
            placeholder="e.g. I prefer concise answers. I'm a visual learner. I work in the music industry."
        />
        </div>
      </div>

      {/* Actions Section */}
      <div className="w-full space-y-3 mt-2">
      <button
          className="w-full bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        type="submit"
        onClick={save}
        disabled={updating}
      >
          {updating ? "Saving..." : "Save Changes"}
      </button>
        
      <button
          className="w-full text-destructive hover:text-destructive/90 text-sm py-2 hover:bg-destructive/10 rounded-lg transition-colors"
        onClick={signOut}
        type="button"
      >
        Log Out
      </button>
      </div>
    </Form>
  );
};

export default Account;