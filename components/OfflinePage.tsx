import Image from "next/image";
import { useTranslations } from "next-intl";

const OfflinePage = () => {
  const t = useTranslations("OfflinePage");

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background text-center px-4 z-50">
      <div className="w-full max-w-lg flex flex-col items-center">
        <div className="mb-6">
          <Image
            src="/Recoup_Icon_Wordmark_Black.svg"
            alt="Recoup Logo"
            width={160}
            height={60}
            priority
          />
        </div>
        <h1 className="text-2xl md:text-4xl font-medium mb-4">
          {t("title")}
        </h1>
        <p className="text-muted-foreground max-w-md mx-auto text-base md:text-lg">
          {t("description")}
          <br />
          {t("resolution")}
        </p>
      </div>
    </div>
  );
};

export default OfflinePage;