export type GatewayClientLike = {
  call: (method: string, params: unknown) => Promise<unknown>;
};
