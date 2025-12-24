
import { PhyreConfig } from "../../types/routes.js";
import { getPhyreConfig } from "../utils/getPhyreConfig.js";
import { routeScanner } from "../../../rust/index.js";

let phyreConfig: PhyreConfig | undefined = getPhyreConfig();
let monorepo = {};

if (phyreConfig?.monorepo) {
    monorepo = phyreConfig.monorepo;
}

export function scanner () {
    routeScanner(monorepo);
}
