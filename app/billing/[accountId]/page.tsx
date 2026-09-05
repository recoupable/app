import BillingPage from "@/components/BillingPage/BillingPage";

type Params = { params: Promise<{ accountId: string }> };

/** /billing/{accountId}: the billing page for one account; the api decides who may read it. */
const AccountBilling = async ({ params }: Params) => {
  const { accountId } = await params;
  return <BillingPage accountId={accountId} />;
};

export default AccountBilling;
