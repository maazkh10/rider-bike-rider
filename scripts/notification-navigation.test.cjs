const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs"), vm = require("node:vm"), babel = require("@babel/core");
const exportsForTest = {};
const code = babel.transformSync(fs.readFileSync("src/services/rideNotificationState.js", "utf8"), { babelrc: false, configFile: false, plugins: [require.resolve("@babel/plugin-transform-modules-commonjs")] }).code;
vm.runInNewContext(code, { exports: exportsForTest });
const { selectPendingOffer } = exportsForTest;
test("notification tap selects its exact authorized pending ride rather than the newest unrelated offer", () => {
  const offers = [{ rideId: 99 }, { rideId: 42 }];
  assert.equal(selectPendingOffer(offers, "42"), offers[1]);
});
test("expired, unauthorized or locally declined requests are not replaced with another ride", () => {
  assert.equal(selectPendingOffer([{ rideId: 99 }], "42"), undefined);
  assert.equal(selectPendingOffer([{ rideId: 42 }], "42", new Set(["42"])), undefined);
  assert.equal(selectPendingOffer([], "42"), undefined);
});
test("ordinary home navigation retains existing newest-offer behavior", () => {
  const offers = [{ rideId: 99 }, { rideId: 42 }];
  assert.equal(selectPendingOffer(offers, undefined), offers[0]);
});
