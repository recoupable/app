/**
 * The model behind a charge, or a dash for a fixed-price call. The provider
 * is never shown: the customer bought a model, not a vendor relationship.
 */
const describeUsageModel = ({
  model_id,
}: {
  provider?: string | null;
  model_id: string | null;
}): string => model_id ?? "-";

export default describeUsageModel;
