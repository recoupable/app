import browserAct from "./browserAct";
import browserExtract from "./browserExtract";
import browserObserve from "./browserObserve";
import browserAgent from "./browserAgent";
import waitTool from "./waitTool";

const browserTools = {
  browser_act: browserAct,
  browser_extract: browserExtract,
  browser_observe: browserObserve,
  browser_agent: browserAgent,
  wait: waitTool,
};

export default browserTools;
