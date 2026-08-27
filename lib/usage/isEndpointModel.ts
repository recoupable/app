const HTTP_METHOD_PREFIX = /^(GET|POST|PUT|PATCH|DELETE) \//;

/** True when `model_id` carries an API endpoint (`POST /api/...`) rather than a model. */
const isEndpointModel = (modelId: string | null): boolean =>
  modelId !== null && HTTP_METHOD_PREFIX.test(modelId);

export default isEndpointModel;
