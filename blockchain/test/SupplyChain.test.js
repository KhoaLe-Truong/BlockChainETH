const { expect } = require("chai");

describe("SupplyChain", function () {
  let sc, owner, auth1, outsider;

  beforeEach(async () => {
    [owner, auth1, outsider] = await ethers.getSigners();
    const SC = await ethers.getContractFactory("SupplyChain");
    sc = await SC.deploy();
    await sc.waitForDeployment();
  });

  it("initializes with admin authorized", async () => {
    expect(await sc.admin()).to.equal(owner.address);
    expect(await sc.authorizedParties(owner.address)).to.equal(true);
  });

  it("admin can add authorized party", async () => {
    await sc.addAuthorizedParty(auth1.address, true);
    expect(await sc.authorizedParties(auth1.address)).to.equal(true);
  });

  it("authorized can create product", async () => {
    await sc.addAuthorizedParty(auth1.address, true);
    await sc.connect(auth1).createProduct("Phone", "Model X", "Factory A");
    const product = await sc.getProduct(1);
    expect(product.name).to.equal("Phone");
    expect(product.currentOwner).to.equal(auth1.address);
  });

  it("outsider cannot create product", async () => {
    await expect(
      sc.connect(outsider).createProduct("Laptop", "Spec Z", "Factory B")
    ).to.be.revertedWith("Not authorized");
  });

  it("authorized can update status", async () => {
    await sc.createProduct("Item", "Desc", "Origin");
    await sc.updateStatus(1, 1, "Warehouse", "Shipped out");
    const history = await sc.getProductHistory(1);
    expect(history.length).to.equal(2);
    expect(history[1].notes).to.equal("Shipped out");
  });

  it("authorized can transfer ownership", async () => {
    await sc.createProduct("Box", "Desc", "Origin");
    await sc.transferOwnership(1, auth1.address);
    const product = await sc.getProduct(1);
    expect(product.currentOwner).to.equal(auth1.address);
  });
});
