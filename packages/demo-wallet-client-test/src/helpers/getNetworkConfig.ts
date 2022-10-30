import { networkConfig } from "constants/settings";
import { NetworkType } from "types/types.d";

// export const getNetworkConfig = (isTestnet: boolean) => {
//   const network = isTestnet ? NetworkType.TESTNET : NetworkType.PUBLIC;
//   return networkConfig[network];
// };
export const getNetworkConfig = (pubnet?: boolean) => {
  const network = pubnet ? NetworkType.PUBLIC : NetworkType.TESTNET;
  // const network = NetworkType.PUBLIC;
  return networkConfig[network];
};
