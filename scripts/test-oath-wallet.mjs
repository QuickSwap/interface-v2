import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import ts from 'typescript';
import { CoreHelperUtil, OptionsController } from '@web3modal/core';

// Compile the production metadata with the repository's TypeScript compiler.
// The only substitution is CRA's SVG asset loader; Web3Modal is not mocked.
const require = createRequire(import.meta.url);
const source = readFileSync(
  new URL('../src/connectors/oathWallet.ts', import.meta.url),
  'utf8',
);
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
}).outputText;
const exports = {};
new Function('require', 'exports', compiled)((specifier) => {
  if (specifier === 'assets/images/oath-wallet.svg') {
    return '/static/media/oath-wallet.svg';
  }
  return require(specifier);
}, exports);
const { oathWallet } = exports;

test('the installed SDK retains Oath as a custom native wallet without changing provider options', () => {
  const original = OptionsController.state.customWallets;
  const projectId = OptionsController.state.projectId;
  try {
    OptionsController.setCustomWallets([oathWallet]);
    assert.equal(OptionsController.state.customWallets[0].id, oathWallet.id);
    assert.equal(
      OptionsController.state.customWallets[0].mobile_link,
      'oathwallet://',
    );
    assert.equal(OptionsController.state.projectId, projectId);
    assert.equal(oathWallet.desktop_link, undefined);
    assert.equal(oathWallet.webapp_link, undefined);
    assert.equal(oathWallet.play_store, undefined);
  } finally {
    OptionsController.setCustomWallets(original);
  }
});

test('the installed SDK hands the complete pairing URI to the Oath iOS wc route', () => {
  // Synthetic pairing data only; never record a live pairing URI or key.
  const pairing = `wc:${'a'.repeat(
    64,
  )}@2?relay-protocol=irn&symKey=${'b'.repeat(64)}&expiryTimestamp=2000000000`;
  const { redirect, href } = CoreHelperUtil.formatNativeUrl(
    oathWallet.mobile_link,
    pairing,
  );
  const link = new URL(redirect);
  assert.equal(link.protocol, 'oathwallet:');
  assert.equal(link.hostname, 'wc');
  assert.equal(link.searchParams.get('uri'), pairing);
  assert.equal([...link.searchParams].length, 1);
  assert.equal(href, 'oathwallet://');
});
