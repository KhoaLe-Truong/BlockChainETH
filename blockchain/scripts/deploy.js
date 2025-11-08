const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const SupplyChain = await ethers.getContractFactory("SupplyChain");
  const supplyChain = await SupplyChain.deploy();
  await supplyChain.waitForDeployment();
  const address = await supplyChain.getAddress();
  console.log("SupplyChain deployed to:", address);

  const artifact = {
    address,
    abi: JSON.parse(supplyChain.interface.formatJson())
  };

  const outDir = path.resolve(__dirname, "../frontend-artifacts");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "contract.json"), JSON.stringify(artifact, null, 2));
  console.log("Wrote frontend-artifacts/contract.json");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
