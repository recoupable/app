import { NextRequest } from "next/server";
import getAccountById from "@/lib/supabase/accounts/getAccountById";
import updateAccount from "@/lib/supabase/accounts/updateAccount";
import insertAccountInfo from "@/lib/supabase/account_info/insertAccountInfo";
import updateAccountInfo from "@/lib/supabase/account_info/updateAccountInfo";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    instruction,
    name,
    organization,
    accountId,
    image,
    jobTitle,
    roleType,
    companyName,
    knowledges,
    onboarding_data,
    onboarding_status,
  } = body;

  try {
    const found = await getAccountById(accountId);
    if (!found) {
      return Response.json({ data: null }, { status: 400 });
    }

    await updateAccount(accountId, { name });
    const accountInfoRow = found.account_info?.[0];
    if (!accountInfoRow) {
      await insertAccountInfo({
        organization,
        image,
        instruction,
        account_id: accountId,
        job_title: jobTitle,
        role_type: roleType,
        company_name: companyName,
        knowledges,
        onboarding_data,
        onboarding_status,
      });
    } else {
      await updateAccountInfo(accountId, {
        organization,
        image,
        instruction,
        job_title: jobTitle,
        role_type: roleType,
        company_name: companyName,
        knowledges,
        onboarding_data,
        onboarding_status,
      });
    }

    // Fetch the updated account with all joined info
    const updated = await getAccountById(accountId);
    
    // Spread account_info, account_wallets, account_emails into top-level
    // Destructure to avoid ID conflicts (exclude id and account_id from all spreads for consistency)
    const accountInfo = updated?.account_info?.[0];
    const accountWallet = updated?.account_wallets?.[0];
    const accountEmail = updated?.account_emails?.[0];
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _infoId, account_id: _accountId, ...info } = accountInfo || {};
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _walletId, ...wallet } = accountWallet || {};
    // account_emails only has 'email' field (no id to exclude)
    const email = accountEmail || {};
    
    const response = {
      data: {
        id: updated?.id,           // Keep the ACCOUNT id
        account_id: updated?.id,   // Also set account_id for consistency
        name: updated?.name,
        ...info,
        ...wallet,
        ...email,
      },
    };
    return Response.json(response, { status: 200 });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "failed";
    return Response.json({ message }, { status: 400 });
  }
}

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;
