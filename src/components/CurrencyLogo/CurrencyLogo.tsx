import { Currency, ETHER, Token } from '@uniswap/sdk';
import React, { useMemo } from 'react';
import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import EthereumLogo from 'assets/images/Currency/PolygonSwap.svg';
import useHttpLocations from 'hooks/useHttpLocations';
import { WrappedTokenInfo } from 'state/lists/hooks';
import { Logo } from 'components';

export const getTokenLogoURL = (address: string) => {
  let uri;
  if (address?.toLowerCase() === '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270') {
    address = '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0';
  }
  if (address?.toLowerCase() === '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063') {
    address = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
  }
  if (address?.toLowerCase() === '0xc2132d05d31c914a87c6611c10748aeb04b58e8f') {
    address = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
  }
  if (address?.toLowerCase() === '0x2791bca1f2de4661ed88a30c99a7a9449aa84174') {
    address = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
  }

  if (address?.toLowerCase() === '0xb33eaad8d922b1083446dc23f610c2567fb5180f') {
    address = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984';
  }

  if (address?.toLowerCase() === '0xdb3b3b147a030f032633f6c4bebf9a2fb5a882b5') {
    uri =
      'https://raw.githubusercontent.com/sameepsi/quickswap-interface/master/assets/easyfi-token.png';
  }

  if (address?.toLowerCase() === '0x831753dd7087cac61ab5644b308642cc1c33dc13') {
    uri = 'https://i.imgur.com/8G7QIrR.png';
  }

  if (address?.toLowerCase() === '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6') {
    address = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599';
  }

  if (address?.toLowerCase() === '0x385eeac5cb85a38a9a07a70c73e0a3271cfb54a7') {
    uri = 'https://etherscan.io/token/images/AavegotchiGHST_32.png';
  }

  if (address?.toLowerCase() === '0x4ebde54ba404be158262ede801744b92b9878c61') {
    uri =
      'https://raw.githubusercontent.com/sameepsi/quickswap-interface/master/assets/easyfi-token.png';
  }

  if (
    address?.toLowerCase() ===
    '0x2c92a8A41f4b806a6f6F1F7C9D9DEc78DCd8c18e'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/21467/small/n1fqEYRI_400x400.png?1639345175';
  }

  if (address?.toLowerCase() === '0xa1c09c8f4f5d03fcc27b456475d53d988e98d7c5') {
    uri =
      'https://raw.githubusercontent.com/sameepsi/quickswap-interface/master/assets/easyfi-token.png';
  }

  if (address?.toLowerCase() === '0xfc39742fe9420a7af23757fc7e78d1c3ae4a9474') {
    uri =
      'https://raw.githubusercontent.com/sameepsi/quickswap-interface/master/assets/easyfi-token.png';
  }

  if (address?.toLowerCase() === '0x9f5755d47fb80100e7ee65bf7e136fca85dd9334') {
    uri = 'https://etherscan.io/token/images/om_32.png';
  }

  if (address?.toLowerCase() === '0x9719d867a500ef117cc201206b8ab51e794d3f82') {
    uri = 'https://aavegotchi.com/images/matokens/maUSDC.svg';
  }

  if (
    address?.toLowerCase() ===
    '0xE0b22E0037B130A9F56bBb537684E6fA18192341'.toLowerCase()
  ) {
    uri = 'https://aavegotchi.com/images/matokens/maDAI.svg';
  }

  if (
    address?.toLowerCase() ===
    '0x20D3922b4a1A8560E1aC99FBA4faDe0c849e2142'.toLowerCase()
  ) {
    uri = 'https://aavegotchi.com/images/matokens/maWETH.svg';
  }

  if (
    address?.toLowerCase() ===
    '0x823CD4264C1b951C9209aD0DeAea9988fE8429bF'.toLowerCase()
  ) {
    uri = 'https://aavegotchi.com/images/matokens/maAAVE.svg';
  }

  if (
    address?.toLowerCase() ===
    '0x98ea609569bD25119707451eF982b90E3eb719cD'.toLowerCase()
  ) {
    uri = 'https://aavegotchi.com/images/matokens/maLINK.svg';
  }

  if (
    address?.toLowerCase() ===
    '0xDAE5F1590db13E3B40423B5b5c5fbf175515910b'.toLowerCase()
  ) {
    uri = 'https://aavegotchi.com/images/matokens/maUSDT.svg';
  }

  if (
    address?.toLowerCase() ===
    '0xF4b8888427b00d7caf21654408B7CBA2eCf4EbD9'.toLowerCase()
  ) {
    uri = 'https://aavegotchi.com/images/matokens/maTUSD.svg';
  }

  if (
    address?.toLowerCase() ===
    '0xe86E8beb7340659DDDCE61727E500e3A5aD75a90'.toLowerCase()
  ) {
    uri = 'https://s2.gifyu.com/images/zutlogo.jpg';
  }

  if (
    address?.toLowerCase() ===
    '0x104592a158490a9228070e0a8e5343b499e125d0'.toLowerCase()
  ) {
    uri = 'https://avatars.githubusercontent.com/u/56005256?s=200&v=4';
  }

  if (
    address?.toLowerCase() ===
    '0x9C78EE466D6Cb57A4d01Fd887D2b5dFb2D46288f'.toLowerCase()
  ) {
    uri = 'https://etherscan.io/token/images/cometh_32.png';
  }

  if (
    address?.toLowerCase() ===
    '0x127984b5E6d5c59f81DACc9F1C8b3Bdc8494572e'.toLowerCase()
  ) {
    uri = 'https://etherscan.io/token/images/pepedex_32.png?v=2';
  }

  if (
    address?.toLowerCase() ===
    '0xef938b6da8576a896f6E0321ef80996F4890f9c4'.toLowerCase()
  ) {
    uri = 'https://polygonscan.com/token/images/decentralgame_32.png?v=5';
  }

  if (
    address?.toLowerCase() ===
    '0x3e121107F6F22DA4911079845a470757aF4e1A1b'.toLowerCase()
  ) {
    uri = 'https://avatars.githubusercontent.com/u/56005256?s=200&v=4';
  }

  if (
    address?.toLowerCase() ===
    '0x104592a158490a9228070E0A8e5343B499e125D0'.toLowerCase()
  ) {
    uri =
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x853d955aCEf822Db058eb8505911ED77F175b99e/logo.png';
  }

  if (
    address?.toLowerCase() ===
    '0xab0b2ddB9C7e440fAc8E140A89c0dbCBf2d7Bbff'.toLowerCase()
  ) {
    uri =
      'https://raw.githubusercontent.com/harvestfi/assets/main/farm-logo.png';
  }

  if (
    address?.toLowerCase() ===
    '0x034b2090b579228482520c589dbD397c53Fc51cC'.toLowerCase()
  ) {
    uri =
      'https://s3-us-west-2.amazonaws.com/acf-uploads/apyvisionlogo200circle.png';
  }

  if (
    address?.toLowerCase() ===
    '0x7FBc10850caE055B27039aF31bD258430e714c62'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/2707/small/UnibrightLogo_colorful_500x500_preview.png?1547036916';
  }

  if (
    address?.toLowerCase() ===
    '0x0e59D50adD2d90f5111aca875baE0a72D95B4762'.toLowerCase()
  ) {
    uri = 'https://dark-build.app/logo192.png';
  }

  if (
    address?.toLowerCase() ===
    '0x3809dcDd5dDe24B37AbE64A5a339784c3323c44F'.toLowerCase()
  ) {
    uri = 'https://i.imgur.com/vZnU36G.png';
  }

  if (
    address?.toLowerCase() ===
    '0x23D29D30e35C5e8D321e1dc9A8a61BFD846D4C5C'.toLowerCase()
  ) {
    uri = 'https://hex.com/favicon.png';
  }

  if (
    address?.toLowerCase() ===
    '0x07738Eb4ce8932CA961c815Cb12C9d4ab5Bd0Da4'.toLowerCase()
  ) {
    uri = 'https://etherlegends.com/ELET.png';
  }

  if (
    address?.toLowerCase() ===
    '0x8d1566569d5b695d44a9a234540f68D393cDC40D'.toLowerCase()
  ) {
    uri = 'https://i.imgur.com/IIUglm9.png?1';
  }

  if (
    address?.toLowerCase() ===
    '0x66768ad00746aC4d68ded9f64886d55d5243f5Ec'.toLowerCase()
  ) {
    uri = 'https://rebalancetoken.io/images/logo/logo.png';
  }

  if (
    address?.toLowerCase() ===
    '0x8c8bdBe9CeE455732525086264a4Bf9Cf821C498'.toLowerCase()
  ) {
    uri = 'https://aavegotchi.com/images/matokens/maUNI.svg';
  }

  if (
    address?.toLowerCase() ===
    '0xe20f7d1f0eC39C4d5DB01f53554F2EF54c71f613'.toLowerCase()
  ) {
    uri = 'https://aavegotchi.com/images/matokens/maYFI.svg';
  }

  if (
    address?.toLowerCase() ===
    '0x840195888Db4D6A99ED9F73FcD3B225Bb3cB1A79'.toLowerCase()
  ) {
    uri =
      'https://raw.githubusercontent.com/sameepsi/quickswap-default-token-list/master/assets/sx.jpg';
  }

  if (address?.toLowerCase() === '0xe6fc6c7cb6d2c31b359a49a33ef08ab87f4de7ce') {
    uri =
      'https://assets.coingecko.com/coins/images/7697/small/N7aEdYrY_400x400.png?1561587437';
  }

  if (address?.toLowerCase() === '0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39') {
    address = '0x514910771AF9Ca656af840dff83E8264EcF986CA';
  }

  if (address?.toLowerCase() === '0x71b821aa52a49f32eed535fca6eb5aa130085978') {
    address = '0xB6eD7644C69416d67B522e20bC294A9a9B405B31';
  }

  if (address?.toLowerCase() === '0xa1c57f48f0deb89f569dfbe6e2b7f46d33606fd4') {
    address = '0x0F5D2fB29fb7d3CFeE444a200298f468908cC942';
  }

  if (address?.toLowerCase() === '0x8505b9d2254a7ae468c0e9dd10ccea3a837aef5c') {
    address = '0xc00e94Cb662C3520282E6f5717214004A7f26888';
  }

  if (address?.toLowerCase() === '0x313d009888329c9d1cf4f75ca3f32566335bd604') {
    address = '0x80fB784B7eD66730e8b1DBd9820aFD29931aab03';
  }

  if (address?.toLowerCase() === '0xda537104d6a5edd53c6fbba9a898708e465260b6') {
    address = '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e';
  }

  if (address?.toLowerCase() === '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619') {
    address = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
  }

  if (
    address?.toLowerCase() ===
    '0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39'.toLowerCase()
  ) {
    uri =
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x514910771AF9Ca656af840dff83E8264EcF986CA/logo.png';
  }

  if (
    address?.toLowerCase() ===
    '0xC3Ec80343D2bae2F8E680FDADDe7C17E71E114ea'.toLowerCase()
  ) {
    uri = 'https://etherscan.io/token/images/mantradao_32.png';
  }

  if (
    address?.toLowerCase() ===
    '0xf28164A485B0B2C90639E47b0f377b4a438a16B1'.toLowerCase()
  ) {
    uri = 'https://i.imgur.com/8G7QIrR.png';
  }

  if (
    address?.toLowerCase() ===
    '0xd85d1e945766fea5eda9103f918bd915fbca63e6'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/3263/small/CEL_logo.png?1609598753';
  }

  if (
    address?.toLowerCase() ===
    '0x46F48FbdedAa6F5500993BEDE9539ef85F4BeE8e'.toLowerCase()
  ) {
    uri = 'https://aria.fyi/images/Aria_Logo_256.png';
  }

  if (
    address?.toLowerCase() ===
    '0xeCf8f2FA183b1C4d2A269BF98A54fCe86C812d3e'.toLowerCase()
  ) {
    uri = 'https://i.imgur.com/Z8V1O7H.png';
  }

  if (
    address?.toLowerCase() ===
    '0xa1428174F516F527fafdD146b883bB4428682737'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/14040/small/6YPdWn6.png?1613975899';
  }

  if (
    address?.toLowerCase() ===
    '0x42435F467D33e5C4146a4E8893976ef12BBCE762'.toLowerCase()
  ) {
    uri = 'https://i.imgur.com/uVGtugL.png';
  }

  if (
    address?.toLowerCase() ===
    '0x7CdC0421469398e0F3aA8890693d86c840Ac8931'.toLowerCase()
  ) {
    uri =
      'https://raw.githubusercontent.com/sameepsi/quickswap-default-token-list/master/assets/azuki.png';
  }

  if (
    address?.toLowerCase() ===
    '0xd28449BB9bB659725aCcAd52947677ccE3719fD7'.toLowerCase()
  ) {
    uri = 'https://darkmatter.finance/i/favicon/512x512.png';
  }

  if (
    address?.toLowerCase() ===
    '0x8a2870fb69A90000D6439b7aDfB01d4bA383A415'.toLowerCase()
  ) {
    uri =
      'https://raw.githubusercontent.com/sameepsi/quickswap-default-token-list/master/assets/DEGEN_LOGO.png';
  }

  if (
    address?.toLowerCase() ===
    '0x521CddC0CBa84F14c69C1E99249F781AA73Ee0BC'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/13719/small/hh.png?1611137626';
  }

  if (
    address?.toLowerCase() ===
    '0x6968105460f67c3BF751bE7C15f92F5286Fd0CE5'.toLowerCase()
  ) {
    uri = 'https://i.imgur.com/FR12tmm.jpg';
  }

  if (
    address?.toLowerCase() ===
    '0x9c49BA0212Bb5Db371e66b59D1565b7c06E4894e'.toLowerCase()
  ) {
    uri = 'https://etherscan.io/token/images/indexed-cc10_32.png';
  }

  if (
    address?.toLowerCase() ===
    '0x282d8efCe846A88B159800bd4130ad77443Fa1A1'.toLowerCase()
  ) {
    uri =
      'https://oceanprotocol.com/static/4ad704a150d436a1f32d495413fc47cd/favicon-white.png';
  }

  if (
    address?.toLowerCase() ===
    '0x232eaB56c4fB3f84c6Fb0a50c087c74b7B43c6Ad'.toLowerCase()
  ) {
    uri = 'https://etherscan.io/token/images/zuzprotocol_32.png';
  }

  if (
    address?.toLowerCase() ===
    '0xFdc26CDA2d2440d0E83CD1DeE8E8bE48405806DC'.toLowerCase()
  ) {
    uri =
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xb683D83a532e2Cb7DFa5275eED3698436371cc9f/logo.png';
  }

  if (
    address?.toLowerCase() ===
    '0xB77e62709e39aD1cbeEBE77cF493745AeC0F453a'.toLowerCase()
  ) {
    uri = 'https://i.imgur.com/eOOhNeh.png';
  }

  if (
    address?.toLowerCase() ===
    '0xB77e62709e39aD1cbeEBE77cF493745AeC0F453a'.toLowerCase()
  ) {
    uri = 'https://etherscan.io/token/images/wisetoken_32.png';
  }

  if (
    address?.toLowerCase() ===
    '0x82B6205002ecd05e97642D38D61e2cFeaC0E18cE'.toLowerCase()
  ) {
    uri = 'https://etherscan.io/token/images/deflect_32.png?=v1';
  }

  if (
    address?.toLowerCase() ===
    '0xf153EfF70DC0bf3b085134928daeEA248d9B30d0'.toLowerCase()
  ) {
    uri =
      'https://raw.githubusercontent.com/trustwallet/assets/8cb78aca77b340510958ed98a3cd260d2d7f0420/blockchains/ethereum/assets/0x36b679bd64Ed73DBfd88909cDCB892cB66Bd4CBb/logo.png';
  }

  if (
    address?.toLowerCase() ===
    '0xa0E390e9ceA0D0e8cd40048ced9fA9EA10D71639'.toLowerCase()
  ) {
    uri = 'https://storage.googleapis.com/stacktical-public/dsla.png';
  }

  if (
    address?.toLowerCase() ===
    '0xFeD16c746CB5BFeD009730f9E3e6A673006105c7'.toLowerCase()
  ) {
    uri =
      'https://pbs.twimg.com/profile_images/1318783238291292160/R4DxXdRA_400x400.jpg';
  }

  if (
    address?.toLowerCase() ===
    '0x8f18dC399594b451EdA8c5da02d0563c0b2d0f16'.toLowerCase()
  ) {
    uri = 'https://i.imgur.com/UIjlQpC.png';
  }
  if (
    address?.toLowerCase() ===
    '0x033d942A6b495C4071083f4CDe1f17e986FE856c'.toLowerCase()
  ) {
    uri = 'https://i.imgur.com/R0aQlym.png';
  }
  if (
    address?.toLowerCase() ===
    '0xF84BD51eab957c2e7B7D646A3427C5A50848281D'.toLowerCase()
  ) {
    uri = 'https://i.imgur.com/06BkcTT.png';
  }
  if (
    address?.toLowerCase() ===
    '0x23D29D30e35C5e8D321e1dc9A8a61BFD846D4C5C'.toLowerCase()
  ) {
    uri = 'https://hex.com/favicon.png';
  }

  if (
    address?.toLowerCase() ===
    '0x2727Ab1c2D22170ABc9b595177B2D5C6E1Ab7B7B'.toLowerCase()
  ) {
    uri = 'https://i.imgur.com/q3SnElh.png';
  }

  if (
    address?.toLowerCase() ===
    '0xdF7837DE1F2Fa4631D716CF2502f8b230F1dcc32'.toLowerCase()
  ) {
    uri = 'https://etherscan.io/token/images/telcoin_28.png';
  }
  if (
    address?.toLowerCase() ===
    '0x7075cAB6bCCA06613e2d071bd918D1a0241379E2'.toLowerCase()
  ) {
    uri = 'https://gains.farm/images/logo256.png';
  }
  if (
    address?.toLowerCase() ===
    '0xf7d9e281c5Cb4C6796284C5b663b3593D2037aF2'.toLowerCase()
  ) {
    uri =
      'https://raw.githubusercontent.com/sameepsi/quickswap-default-token-list/master/assets/NFTP.png';
  }

  if (
    address?.toLowerCase() ===
    '0xD6DF932A45C0f255f85145f286eA0b292B21C90B'.toLowerCase()
  ) {
    uri = 'https://etherscan.io/token/images/aave_32.png';
  }
  if (
    address?.toLowerCase() ===
    '0x2bF9b864cdc97b08B6D79ad4663e71B8aB65c45c'.toLowerCase()
  ) {
    uri = 'https://cryptologos.cc/logos/fusion-fsn-logo.png?v=010';
  }
  if (
    address?.toLowerCase() ===
    '0x6aB6d61428fde76768D7b45D8BFeec19c6eF91A8'.toLowerCase()
  ) {
    uri =
      'https://raw.githubusercontent.com/anyswap/Brand-assets/master/logo/c-128-white.svg';
  }
  if (
    address?.toLowerCase() ===
    '0xe82808eaA78339b06a691fd92E1Be79671cAd8D3'.toLowerCase()
  ) {
    uri = 'https://i.imgur.com/nQDG9AQ.png';
  }
  if (
    address?.toLowerCase() ===
    '0x7ff2FC33E161E3b1C6511B934F0209D304267857'.toLowerCase()
  ) {
    uri =
      'https://www.opucoin.io/wp-content/uploads/2021/04/opu-coiin-icon-border.svg';
  }
  if (
    address?.toLowerCase() ===
    '0x3a3Df212b7AA91Aa0402B9035b098891d276572B'.toLowerCase()
  ) {
    uri = 'https://i.imgur.com/ncleoTN.png';
  }

  if (
    address?.toLowerCase() ===
    '0x05089C9EBFFa4F0AcA269e32056b1b36B37ED71b'.toLowerCase()
  ) {
    uri = 'https://i.imgur.com/REyP9yh.jpg';
  }
  if (
    address?.toLowerCase() ===
    '0xFbdd194376de19a88118e84E279b977f165d01b8'.toLowerCase()
  ) {
    uri =
      'https://raw.githubusercontent.com/beefyfinance/beefy-app/prod/src/images/single-assets/BIFI.png';
  }
  if (
    address?.toLowerCase() ===
    '0x580A84C73811E1839F75d86d75d88cCa0c241fF4'.toLowerCase()
  ) {
    uri = 'https://raw.githubusercontent.com/0xlaozi/qidao/main/images/qi.png';
  }
  if (
    address?.toLowerCase() ===
    '0xa3Fa99A148fA48D14Ed51d610c367C61876997F1'.toLowerCase()
  ) {
    uri =
      'https://raw.githubusercontent.com/0xlaozi/qidao/main/images/mimatic-red.png';
  }
  if (
    address?.toLowerCase() ===
    '0x8A953CfE442c5E8855cc6c61b1293FA648BAE472'.toLowerCase()
  ) {
    uri = 'https://polydoge.com/doge-webpage_files/doge.png';
  }
  if (
    address?.toLowerCase() ===
    '0xd6a5ab46ead26f49b03bbb1f9eb1ad5c1767974a'.toLowerCase()
  ) {
    uri = 'https://s2.coinmarketcap.com/static/img/coins/64x64/9651.png';
  }

  if (
    address?.toLowerCase() ===
    '0xc58158c14D4757EF36Ce25e493758F2fcEEDec5D'.toLowerCase()
  ) {
    uri = 'https://s2.coinmarketcap.com/static/img/coins/64x64/11147.png';
  }
  if (
    address?.toLowerCase() ===
    '0x0D6ae2a429df13e44A07Cd2969E085e4833f64A0'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/13744/small/symbol-whitebg200x200.png?1611377553';
  }
  if (
    address?.toLowerCase() ===
    '0x0B313b4C589A3BD3350f625f2e94DC80AB50017E'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/18403/small/A0782-F05-535-C-45-C8-BE4-F-FEBB4-B8-B5933.jpg?1631792934';
  }
  if (
    address?.toLowerCase() ===
    '0x6286A9e6f7e745A6D884561D88F94542d6715698'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/17983/small/Profile_picture_white.jpg?1630149169';
  }
  if (
    address?.toLowerCase() ===
    '0xcf32822ff397Ef82425153a9dcb726E5fF61DCA7'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/14716/small/gmee-200x200.png?1621827468';
  }

  if (
    address?.toLowerCase() ===
    '0x7E7fF932FAb08A0af569f93Ce65e7b8b23698Ad8'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/12385/small/1619048513068.png?1622193581';
  }
  if (
    address?.toLowerCase() ===
    '0x2db0Db271a10661e7090b6758350E18F6798a49D'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/18144/small/11322.png?1630668459';
  }
  if (
    address?.toLowerCase() ===
    '0xE8d17b127BA8b9899a160D9a07b69bCa8E08bfc6'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/18634/small/nadex.PNG?1632727863';
  }
  if (
    address?.toLowerCase() ===
    '0xa7051C5a22d963b81D71C2BA64D46a877fBc1821'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/14044/small/EROWAN.png?1614656300';
  }
  if (
    address?.toLowerCase() ===
    '0xac51C4c48Dc3116487eD4BC16542e27B5694Da1b'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/1481/small/cosmos_hub.png?1555657960';
  }

  if (
    address?.toLowerCase() ===
    '0x09211Dc67f9fe98Fb7bBB91Be0ef05f4a12FA2b2'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/14186/small/WATCH1.png?1614825718';
  }
  if (
    address?.toLowerCase() ===
    '0xa25610a77077390A75aD9072A084c5FbC7d43A0d'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/18632/small/DdcZZeP_%282%29.png?1632716316';
  }
  if (
    address?.toLowerCase() ===
    '0x4455eF8B4B4A007a93DaA12DE63a47EEAC700D9D'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/18441/small/Coin_Forest_Knight_200x200.png?1632480031';
  }
  if (
    address?.toLowerCase() ===
    '0x596eBE76e2DB4470966ea395B0d063aC6197A8C5'.toLowerCase()
  ) {
    uri =
      'https://raw.githubusercontent.com/trustwallet/assets/b8086dbc7040582d1412effe7a951914d4a96eef/blockchains/ethereum/assets/0x8A9C67fee641579dEbA04928c4BC45F66e26343A/logo.png';
  }

  if (
    address?.toLowerCase() ===
    '0xc56d17dD519e5eB43a19C9759b5D5372115220BD'.toLowerCase()
  ) {
    uri = 'https://i.postimg.cc/CxvzF5bJ/moon-black.png';
  }
  if (
    address?.toLowerCase() ===
    '0xc3FdbadC7c795EF1D6Ba111e06fF8F16A20Ea539'.toLowerCase()
  ) {
    uri = 'https://adamant.finance/img/adamant.png';
  }
  if (
    address?.toLowerCase() ===
    '0x0Af77B096cbDF53B5c39c2fcff8F14C5E3a36356'.toLowerCase()
  ) {
    uri = 'https://i.imgur.com/jv5A0eX.png';
  }
  if (
    address?.toLowerCase() ===
    '0x7f426F6Dc648e50464a0392E60E1BB465a67E9cf'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/13751/small/autofarm_icon_200x200.png?1611494288';
  }
  if (
    address?.toLowerCase() ===
    '0xD86b5923F3AD7b585eD81B448170ae026c65ae9a'.toLowerCase()
  ) {
    uri = 'https://ironfi.s3.amazonaws.com/images/IRON.png';
  }
  if (
    address?.toLowerCase() ===
    '0xaAa5B9e6c589642f98a1cDA99B9D024B8407285A'.toLowerCase()
  ) {
    uri = 'https://ironfi.s3.amazonaws.com/images/TITAN.png';
  }
  if (
    address?.toLowerCase() ===
    '0xfd4959c06FbCc02250952DAEbf8e0Fb38cF9FD8C'.toLowerCase()
  ) {
    uri =
      'https://pbs.twimg.com/profile_images/1366339230683652096/sit30Uuo_400x400.png';
  }
  if (
    address?.toLowerCase() ===
    '0x9aCeB6f749396d1930aBc9e263eFc449E5e82c13'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/15761/small/xg1NFl0.png?1621825451';
  }
  if (
    address?.toLowerCase() ===
    '0x5B4CF2C120A9702225814E18543ee658c5f8631e'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/12819/small/UniLend_Finance_logo_PNG.png?1602748658';
  }

  if (
    address?.toLowerCase() ===
    '0xB9638272aD6998708de56BBC0A290a1dE534a578'.toLowerCase()
  ) {
    uri =
      'https://raw.githubusercontent.com/sameepsi/quickswap-default-token-list/master/assets/IQ.png';
  }

  if (
    address?.toLowerCase() ===
    '0x6DdB31002abC64e1479Fc439692F7eA061e78165'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/13629/small/COMBO_token_ol.png?1610701537';
  }
  if (
    address?.toLowerCase() ===
    '0xa2CA40DBe72028D3Ac78B5250a8CB8c404e7Fb8C'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/15825/small/fear-logo-400-400.png?1625552865';
  }

  if (
    address?.toLowerCase() ===
    '0x874e178A2f3f3F9d34db862453Cd756E7eAb0381'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/15871/small/GFI-Icon.png?1622178588';
  }
  if (
    address?.toLowerCase() ===
    '0x2e2DDe47952b9c7deFDE7424d00dD2341AD927Ca'.toLowerCase()
  ) {
    uri = 'https://i.imgur.com/66lM7Rx.png';
  }
  if (
    address?.toLowerCase() ===
    '0xAcD7B3D9c10e97d0efA418903C0c7669E702E4C0'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/14541/small/eleven_finance_logo.png?1616895791';
  }
  if (
    address?.toLowerCase() ===
    '0x172370d5Cd63279eFa6d502DAB29171933a610AF'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/12124/small/Curve.png?1597369484';
  }

  if (
    address?.toLowerCase() ===
    '0xA16EbA3b7562FC92597579A80Fe53a92DCab7122'.toLowerCase()
  ) {
    uri = 'https://i.imgur.com/q0LZUrw.png';
  }
  if (
    address?.toLowerCase() ===
    '0x2628568509E87c4429fBb5c664Ed11391BE1BD29'.toLowerCase()
  ) {
    uri =
      'https://raw.githubusercontent.com/sameepsi/quickswap-default-token-list/master/assets/renDGB.svg';
  }
  if (
    address?.toLowerCase() ===
    '0x41b3966B4FF7b427969ddf5da3627d6AEAE9a48E'.toLowerCase()
  ) {
    uri = 'https://s2.coinmarketcap.com/static/img/coins/200x200/2694.png';
  }

  if (
    address?.toLowerCase() ===
    '0x5FFD62D3C3eE2E81C00A7b9079FB248e7dF024A8'.toLowerCase()
  ) {
    uri =
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x6810e776880C02933D47DB1b9fc05908e5386b96/logo.png';
  }
  if (
    address?.toLowerCase() ===
    '0x76e63a3E7Ba1e2E61D3DA86a87479f983dE89a7E'.toLowerCase()
  ) {
    uri = 'https://augury.finance/_nuxt/img/omen.b433161.png';
  }
  if (
    address?.toLowerCase() ===
    '0x13748d548D95D78a3c83fe3F32604B4796CFfa23'.toLowerCase()
  ) {
    uri = 'https://kogefarm.io/koge-logo-01.png';
  }
  if (
    address?.toLowerCase() ===
    '0x64aFDF9e28946419E325d801Fb3053d8B8FFdC23'.toLowerCase()
  ) {
    uri = 'https://i.imgur.com/tmPoZ1D.png';
  }
  if (
    address?.toLowerCase() ===
    '0x60bB3D364B765C497C8cE50AE0Ae3f0882c5bD05'.toLowerCase()
  ) {
    uri =
      'https://polygon.impermax.finance/build/assets/icons/0x60bb3d364b765c497c8ce50ae0ae3f0882c5bd05.png';
  }
  if (
    address?.toLowerCase() ===
    '0x2C89bbc92BD86F8075d1DEcc58C7F4E0107f286b'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/12559/small/coin-round-red.png?1604021818';
  }
  if (
    address?.toLowerCase() ===
    '0x948d2a81086A075b3130BAc19e4c6DEe1D2E3fE8'.toLowerCase()
  ) {
    uri = 'https://i.imgur.com/VtDIzy7.png';
  }
  if (
    address?.toLowerCase() ===
    '0xD3b71117E6C1558c1553305b44988cd944e97300'.toLowerCase()
  ) {
    uri = 'https://i.imgur.com/cwfndaf.png';
  }
  if (
    address?.toLowerCase() ===
    '0x5f1657896B38c4761dbc5484473c7A7C845910b6'.toLowerCase()
  ) {
    uri = 'https://swamp.finance/static/frontend/img/symbols/pswamp.svg';
  }

  if (
    address?.toLowerCase() ===
    '0x904371845Bc56dCbBcf0225ef84a669b2fD6bd0d'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/17816/small/relay-logo-200.png?1629339288';
  }
  if (
    address?.toLowerCase() ===
    '0xFAD65Eb62a97fF5Ed91B23aFD039956aaCa6e93b'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/2822/small/huobi-token-logo.png?1547036992';
  }
  if (
    address?.toLowerCase() ===
    '0x5f1657896B38c4761dbc5484473c7A7C845910b6'.toLowerCase()
  ) {
    uri = '0x3BA4c387f786bFEE076A58914F5Bd38d668B42c3';
  }

  if (
    address?.toLowerCase() ===
    '0x300211Def2a644b036A9bdd3e58159bb2074d388'.toLowerCase()
  ) {
    uri =
      'https://raw.githubusercontent.com/iotexproject/iotex-token-metadata/master/images/io1nxetpma4de3wx6tqcgxdtj5wc64a24t64dc76s.png';
  }
  if (
    address?.toLowerCase() ===
    '0x70c006878a5A50Ed185ac4C87d837633923De296'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/12373/small/REVV_TOKEN_Refined_2021_%281%29.png?1627652390';
  }

  if (
    address?.toLowerCase() ===
    '0xA55870278d6389ec5B524553D03C04F5677c061E'.toLowerCase()
  ) {
    uri = 'https://i.imgur.com/jykuRwK.png';
  }
  if (
    address?.toLowerCase() ===
    '0x2fe8733dcb25BFbbA79292294347415417510067'.toLowerCase()
  ) {
    uri = 'https://i.imgur.com/Kte7hVj.jpg';
  }
  if (
    address?.toLowerCase() ===
    '0x9d5565dA88e596730522CbC5a918d2A89dbC16d9'.toLowerCase()
  ) {
    uri = 'https://cloudstorage.openocean.finance/image/ooe_log.png';
  }
  if (
    address?.toLowerCase() ===
    '0x7E4c577ca35913af564ee2a24d882a4946Ec492B'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/17393/small/ME_logo_200_200.png?1627526275';
  }
  if (
    address?.toLowerCase() ===
    '0x5fCB9de282Af6122ce3518CDe28B7089c9F97b26'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/14926/small/logo_200x200.png?1626181831';
  }
  if (
    address?.toLowerCase() ===
    '0x855D4248672a1fCE482165e8DBE1207b94b1968a'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/14101/small/Group-423.png?1614317472';
  }

  if (
    address?.toLowerCase() ===
    '0xEe9801669C6138E84bD50dEB500827b776777d28'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/15460/small/o3.png?1620904316';
  }
  if (
    address?.toLowerCase() ===
    '0x598e49f01bEfeB1753737934a5b11fea9119C796'.toLowerCase()
  ) {
    uri = 'https://s2.coinmarketcap.com/static/img/coins/64x64/1883.png';
  }
  if (
    address?.toLowerCase() ===
    '0x34C1b299A74588D6Abdc1b85A53345A48428a521'.toLowerCase()
  ) {
    uri = 'https://etherscan.io/token/images/easyfi_32.png?v=2';
  }
  if (
    address?.toLowerCase() ===
    '0xcaF5191fc480F43e4DF80106c7695ECA56E48B18'.toLowerCase()
  ) {
    uri = 'https://dinox.io/images/asset_icon_dnx.png';
  }
  if (
    address?.toLowerCase() ===
    '0x25788a1a171ec66Da6502f9975a15B609fF54CF6'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/14003/small/PoolTogether.png?1613585632';
  }

  if (
    address?.toLowerCase() ===
    '0x28C388FB1F4fa9F9eB445f0579666849EE5eeb42'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/12478/small/Bella.png?1602230054';
  }
  if (
    address?.toLowerCase() ===
    '0x7DfF46370e9eA5f0Bad3C4E29711aD50062EA7A4'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/4128/small/coinmarketcap-solana-200.png?1616489452';
  }
  if (
    address?.toLowerCase() ===
    '0x9aF3b7DC29D3C4B1A5731408B6A9656fA7aC3b72'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/16762/small/PUSD-purple-200.png?1624937879';
  }
  if (
    address?.toLowerCase() ===
    '0xAa9654BECca45B5BDFA5ac646c939C62b527D394'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/17103/small/DINO.png?1626244014';
  }
  if (
    address?.toLowerCase() ===
    '0x348e62131fce2F4e0d5ead3Fe1719Bc039B380A9'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/14770/small/1617088937196.png?1619414736';
  }
  if (
    address?.toLowerCase() ===
    '0x87f654c4b347230C60CAD8d7ea9cF0D7238bcc79'.toLowerCase()
  ) {
    uri = 'https://yamp.finance/img/yamp_logo.svg';
  }

  if (
    address?.toLowerCase() ===
    '0x8346Ab8d5EA7A9Db0209aEd2d1806AFA0E2c4C21'.toLowerCase()
  ) {
    uri = 'https://modefi.io/images/modefi256.png';
  }
  if (
    address?.toLowerCase() ===
    '0x245e5ddb65eFea6522Fa913229dF1f4957fB2e21'.toLowerCase()
  ) {
    uri = 'https://i.loli.net/2021/07/28/bGfpAaC6idUZVNP.png';
  }
  if (
    address?.toLowerCase() ===
    '0x9e725Cf7265D12fd5f59499AFf1258CA92CAc74d'.toLowerCase()
  ) {
    uri = 'https://i.loli.net/2021/07/28/K83jnTJzG9bq7Xt.png';
  }
  if (
    address?.toLowerCase() ===
    '0xA731349fa468614c1698fc46ebf06Da6F380239e'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/2822/small/huobi-token-logo.png?1547036992';
  }

  if (
    address?.toLowerCase() ===
    '0x554f074d9cCda8F483d1812d4874cBebD682644E'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/13415/small/anrkey.jpg?1608311301';
  }
  if (
    address?.toLowerCase() ===
    '0x2B9E7ccDF0F4e5B24757c1E1a80e311E34Cb10c7'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/14051/small/Mask_Network.jpg?1614050316';
  }
  if (
    address?.toLowerCase() ===
    '0x9C1C23E60B72Bc88a043bf64aFdb16A02540Ae8f'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/9443/small/RING.png?1615271827';
  }
  if (
    address?.toLowerCase() ===
    '0x032F85b8FbF8540a92B986d953e4C3A61C76d39E'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/15054/small/tcp.PNG?1619579195';
  }
  if (
    address?.toLowerCase() ===
    '0x0B6afe834dab840335F87d99b45C2a4bd81A93c7'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/17739/small/Polylauncher_-_200_x_200.png?1629121147';
  }
  if (
    address?.toLowerCase() ===
    '0xBa4c54Ea2d66b904C82847A7d2357d22B857E812'.toLowerCase()
  ) {
    uri = 'https://s2.coinmarketcap.com/static/img/coins/200x200/11292.png';
  }
  if (
    address?.toLowerCase() ===
    '0xC004e2318722EA2b15499D6375905d75Ee5390B8'.toLowerCase()
  ) {
    uri = 'https://i.imgur.com/KTS2F7I.png';
  }
  if (
    address?.toLowerCase() ===
    '0x692597b009d13C4049a947CAB2239b7d6517875F'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/12681/small/UST.png?1601612407';
  }
  if (
    address?.toLowerCase() ===
    '0x74946A114ca2B26267983ef51aD8664Cabde4034'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/8284/small/luna1557227471663.png?1567147072';
  }
  if (
    address?.toLowerCase() ===
    '0xdae89dA41a96956e9e70320Ac9c0dd077070D3a5'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/12743/small/logo_%2898%29.png?1602630445';
  }
  if (
    address?.toLowerCase() ===
    '0x692AC1e363ae34b6B489148152b12e2785a3d8d6'.toLowerCase()
  ) {
    uri = 'https://polygonscan.com/token/images/polytrade_32.png';
  }

  if (
    address?.toLowerCase() ===
    '0xa6b37fC85d870711C56FbcB8afe2f8dB049AE774'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/809/small/v2logo-1.png?1624906282';
  }
  if (
    address?.toLowerCase() ===
    '0xDBf31dF14B66535aF65AaC99C32e9eA844e14501'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/11370/small/Bitcoin.jpg?1628072791';
  }
  if (
    address?.toLowerCase() ===
    '0x614389EaAE0A6821DC49062D56BDA3d9d45Fa2ff'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/4630/small/Orbs.jpg?1547039896';
  }
  if (
    address?.toLowerCase() ===
    '0xF239E69ce434c7Fb408b05a0Da416b14917d934e'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/17641/small/QRE5xI0.png?1628741510';
  }
  if (
    address?.toLowerCase() ===
    '0x9a05D1FF699ea187Dc8523E333eD63503f0d82db'.toLowerCase()
  ) {
    uri =
      'https://pbs.twimg.com/profile_images/1428328610444742660/4fa6uMzp_400x400.jpg';
  }
  if (
    address?.toLowerCase() ===
    '0xe95fD76CF16008c12FF3b3a937CB16Cd9Cc20284'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/16185/small/Pera.jpg?1623238387';
  }
  if (
    address?.toLowerCase() ===
    '0xdaB35042e63E93Cc8556c9bAE482E5415B5Ac4B1'.toLowerCase()
  ) {
    uri = 'https://www.hermesdefi.io/hermes-logo-1.png';
  }
  if (
    address?.toLowerCase() ===
    '0x03678f2c2c762DC63c2Bb738c3a837D366eDa560'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/6331/small/5fbb9e5b8f27d74dd8bcb912_xcash_coingecko_logo.png?1606133752';
  }
  if (
    address?.toLowerCase() ===
    '0x689f8e5913C158fFB5Ac5aeb83b3C875F5d20309'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/18197/small/snk.png?1630979321';
  }

  if (
    address?.toLowerCase() ===
    '0x229b1b6C23ff8953D663C4cBB519717e323a0a84'.toLowerCase()
  ) {
    uri =
      'https://pbs.twimg.com/profile_images/1443182135410634754/l1wH-p3b_400x400.jpg';
  }
  if (
    address?.toLowerCase() ===
    '0xa8fcEe762642f156b5D757b6FabC36E06b6d4A1A'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/14379/small/uaLoLU8c_400x400_%281%29.png?1627873106';
  }
  if (
    address?.toLowerCase() ===
    '0xb3b9c016AD1E9f7EFdAE451b04EF696e05658b32'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/14582/small/512_Light.png?1617149658';
  }
  if (
    address?.toLowerCase() ===
    '0x3dc6052a693E4a2fc28Eb2Ea12fe0CfD3BD221D1'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/5135/small/IRIS.png?1557999365';
  }
  if (
    address?.toLowerCase() ===
    '0xf14fbC6B30e2c4BC05A1D4fbE34bf9f14313309D'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/12785/small/akash-logo.png?1615447676';
  }
  if (
    address?.toLowerCase() ===
    '0x3C720206bFaCB2d16fA3ac0ed87D2048Dbc401Fc'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/12330/small/e353ZVj.png?1599112996';
  }
  if (
    address?.toLowerCase() ===
    '0xEc482De9569a5EA3Dd9779039b79e53F15791fDE'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/16733/small/REGEN.png?1624861317';
  }

  if (
    address?.toLowerCase() ===
    '0xc6C855AD634dCDAd23e64DA71Ba85b8C51E5aD7c'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/18110/small/ice-poker.png?1630500966';
  }
  if (
    address?.toLowerCase() ===
    '0x3c205C8B3e02421Da82064646788c82f7bd753B9'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/17341/small/purefi.PNG?1627362147';
  }
  if (
    address?.toLowerCase() ===
    '0x255707B70BF90aa112006E1b07B9AeA6De021424'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/17882/small/gradient_icon_926.png?1629707907';
  }
  if (
    address?.toLowerCase() ===
    '0xE5417Af564e4bFDA1c483642db72007871397896'.toLowerCase()
  ) {
    uri = 'https://gains.trade/images/logo.png';
  }
  if (
    address?.toLowerCase() ===
    '0x11a819Beb0AA3327E39f52F90d65Cc9bCA499F33'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/16360/small/thumbnail_1170823958_vertical_logo_lateral_radiance.png?1623810516';
  }

  if (
    address?.toLowerCase() ===
    '0x85955046DF4668e1DD369D2DE9f3AEB98DD2A369'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/12465/small/defi_pulse_index_set.png?1600051053';
  }
  if (
    address?.toLowerCase() ===
    '0xB85517b87BF64942adf3A0B9E4c71E4Bc5Caa4e5'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/4001/small/Fantom.png?1558015016';
  }
  if (
    address?.toLowerCase() ===
    '0xE0339c80fFDE91F3e20494Df88d4206D86024cdF'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/14962/small/6GxcPRo3_400x400.jpg?1619157413';
  }
  if (
    address?.toLowerCase() ===
    '0x6f8a06447Ff6FcF75d803135a7de15CE88C1d4ec'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/11939/small/shiba.png?1622619446';
  }
  if (
    address?.toLowerCase() ===
    '0xa062fc09cA6bdeb2f6E3b77E1d4e09C42C964742'.toLowerCase()
  ) {
    uri = 'https://i.imgur.com/rb4P2E3.jpg';
  }
  if (
    address?.toLowerCase() ===
    '0x32934CB16DA43fd661116468c1B225Fc26CF9A8c'.toLowerCase()
  ) {
    uri = 'https://s2.coinmarketcap.com/static/img/coins/64x64/12258.png';
  }

  if (
    address?.toLowerCase() ===
    '0x5c4b7CCBF908E64F32e12c6650ec0C96d717f03F'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/825/small/binance-coin-logo.png?1547034615';
  }
  if (
    address?.toLowerCase() ===
    '0x59E9261255644c411AfDd00bD89162d09D862e38'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/14141/small/etha_logo200x200.png?1614646986';
  }
  if (
    address?.toLowerCase() ===
    '0x31042A4E66eDa0d12143ffc8cC1552D611dA4cbA'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/3164/small/mitx.png?1604888269';
  }
  if (
    address?.toLowerCase() ===
    '0x5668F6d40E15188045a1dE6295054103C13ffAc1'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/17028/small/iconUSD.png?1626619046';
  }
  if (
    address?.toLowerCase() ===
    '0xB9f9e37c2CdbaFF928C3Da730b02F06fE09aE70E'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/17015/small/iconZerogoki.png?1626618921';
  }
  if (
    address?.toLowerCase() ===
    '0x9C6BfEdc14b5C23E3900889436Edca7805170f01'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/17675/small/phx_logo.png?1628832432';
  }
  if (
    address?.toLowerCase() ===
    '0x4e830F67Ec499E69930867f9017AEb5B3f629c73'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/14421/small/img_circle_200x200.png?1617345151';
  }

  if (
    address?.toLowerCase() ===
    '0x7e9928aFe96FefB820b85B4CE6597B8F660Fe4F4'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/825/small/binance-coin-logo.png?1547034615';
  }
  if (
    address?.toLowerCase() ===
    '0xAF24765F631C8830B5528B57002241eE7eef1C14'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/15952/small/IOI.jpg?1622514420';
  }
  if (
    address?.toLowerCase() ===
    '0x0E50BEA95Fe001A370A4F1C220C49AEdCB982DeC'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/14238/small/ethernity_logo.png?1615189750';
  }
  if (
    address?.toLowerCase() ===
    '0xaECeBfcF604AD245Eaf0D5BD68459C3a7A6399c2'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/12837/small/RAMP-Logo-v2-1000pxsq.png?1617952606';
  }
  if (
    address?.toLowerCase() ===
    '0xfC40a4F89b410a1b855b5e205064a38fC29F5eb5'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/16184/small/rUSD-Logo-200.png?1623231145';
  }
  if (
    address?.toLowerCase() ===
    '0x42dbBd5ae373FEA2FC320F62d44C058522Bb3758'.toLowerCase()
  ) {
    uri =
      'https://media.discordapp.net/attachments/846293892785242143/852874003928449054/mem_gold_with_white_5.png';
  }
  if (
    address?.toLowerCase() ===
    '0x87ff96aba480f1813aF5c780387d8De7cf7D8261'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/9576/small/BUSD.png?1568947766';
  }
  if (
    address?.toLowerCase() ===
    '0xff88434E29d1E2333aD6baa08D358b436196da6b'.toLowerCase()
  ) {
    uri = 'https://i.imgur.com/Jo6QWz7.png';
  }
  if (
    address?.toLowerCase() ===
    '0x1B815d120B3eF02039Ee11dC2d33DE7aA4a8C603'.toLowerCase()
  ) {
    uri =
      'https://raw.githubusercontent.com/sameepsi/quickswap-default-token-list/master/assets/wootrade_w.svg';
  }

  if (
    address?.toLowerCase() ===
    '0xB35fcBCF1fD489fCe02Ee146599e893FDCdC60e6'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/17438/small/derace-logo-black-coingecko.png?1627656907';
  }
  if (
    address?.toLowerCase() ===
    '0x709A4B6217584188DDb93c82f5d716D969accE1C'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/17161/small/Goji_Hanu_Logo_200x200.png?1627127472';
  }
  if (
    address?.toLowerCase() ===
    '0x22e3f02f86Bc8eA0D73718A2AE8851854e62adc5'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/17359/small/Logo_black_%282%29.png?1634095075';
  }
  if (
    address?.toLowerCase() ===
    '0x3f6b3595ecF70735D3f48D69b09C4E4506DB3F47'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/19584/small/game_station.PNG?1635471603';
  }
  if (
    address?.toLowerCase() ===
    '0x3eB177A6693eC81d1E170136f8AD02fffBE172a7'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/19413/small/automatic.PNG?1635212504';
  }
  if (
    address?.toLowerCase() ===
    '0x3B1A0c9252ee7403093fF55b4a5886d49a3d837a'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/18798/small/Moneda.png?1633474110';
  }
  if (
    address?.toLowerCase() ===
    '0x3C1BB39bb696B443a1D80BB2b3a3d950Ba9DEE87'.toLowerCase()
  ) {
    uri = 'https://i.imgur.com/BDibHLm.png';
  }

  if (
    address?.toLowerCase() ===
    '0x6AE7Dfc73E0dDE2aa99ac063DcF7e8A63265108c'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/17277/small/WoZ8rruL_400x400.png?1627016492';
  }
  if (
    address?.toLowerCase() ===
    '0x51869836681BcE74a514625c856aFb697a013797'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/19905/small/kKkWmniB_400x400.jpg?1636100432';
  }
  if (
    address?.toLowerCase() ===
    '0x873801Ae2ff12d816Db9a7B082F5796BEC64C82C'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/15155/small/coin_%282%29.png?1619995483';
  }
  if (
    address?.toLowerCase() ===
    '0xBA25B552C8A098AFdf276324C32C71fE28e0Ad40'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/14633/small/macaron.png?1623038435';
  }
  if (
    address?.toLowerCase() ===
    '0xB6bcae6468760bc0CDFb9C8ef4Ee75C9dd23e1Ed'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/11659/small/pNetwork.png?1592411134';
  }
  if (
    address?.toLowerCase() ===
    '0xd7ecf95Cf7eF5256990BeAf4ac895cD9e64cb947'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/10805/small/J51iIea.png?1583891599';
  }
  if (
    address?.toLowerCase() ===
    '0x1646C835d70F76D9030DF6BaAeec8f65c250353d'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/3688/small/mqTDGK7Q.png?1566256777';
  }
  if (
    address?.toLowerCase() ===
    '0x5647Fe4281F8F6F01E84BCE775AD4b828A7b8927'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/16825/small/logo200x200.png?1625834139';
  }
  if (
    address?.toLowerCase() ===
    '0x8f9E8e833A69Aa467E42c46cCA640da84DD4585f'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/19536/small/champ.png?1635905981';
  }
  if (
    address?.toLowerCase() ===
    '0xB382C1cfA622795a534e5bd56Fac93d59BAc8B0D'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/12688/small/QmScxyKBwqbGJZmp38EwaoRpXbzPkq3tvuMjeuJE1YLZeG.png?1601672684';
  }
  if (
    address?.toLowerCase() ===
    '0x61299774020dA444Af134c82fa83E3810b309991'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/11636/small/uTDd98ZN_400x400.jpg?1592200150';
  }

  if (
    address?.toLowerCase() ===
    '0xf2D8124b8F9267DaD61351c7aD252362880C6638'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/7310/small/cypto.png?1547043960';
  }
  if (
    address?.toLowerCase() ===
    '0xA9536B9c75A9E0faE3B56a96AC8EdF76AbC91978'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/19270/small/amun-peco.png?1634868167';
  }
  if (
    address?.toLowerCase() ===
    '0x23E8B6A3f6891254988B84Da3738D2bfe5E703b9'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/20505/small/welt.PNG?1637143324';
  }
  if (
    address?.toLowerCase() ===
    '0xEe9A352F6aAc4aF1A5B9f467F6a93E0ffBe9Dd35'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/13699/small/MASQ_Logo_Blue_Solo_Transparent.png?1616661801';
  }
  if (
    address?.toLowerCase() ===
    '0xED0bb69f9F96E8C5FffdF16c468eceC385134eA5'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/18941/small/starchi.jpg?1633961292';
  }
  if (
    address?.toLowerCase() ===
    '0x7BeBd226154E865954A87650FAefA8F485d36081'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/14796/small/zignaly.jpg?1618496339';
  }

  if (
    address?.toLowerCase() ===
    '0x723B17718289A91AF252D616DE2C77944962d122'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/19629/small/gaia_icon_new.png?1637559277';
  }
  if (
    address?.toLowerCase() ===
    '0xBbba073C31bF03b8ACf7c28EF0738DeCF3695683'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/12129/small/sandbox_logo.jpg?1597397942';
  }
  if (
    address?.toLowerCase() ===
    '0xFF2382Bd52efaceF02Cc895bcBFc4618608AA56F'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/19696/small/Thumbnail_-_500_px_-_Black.png?1635751681';
  }
  if (
    address?.toLowerCase() ===
    '0xcE899f26928a2B21c6a2Fddd393EF37c61dbA918'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/15829/small/photo_2021-06-04_09.36.16.jpeg?1622770606';
  }
  if (
    address?.toLowerCase() ===
    '0x3642c3c8eBe0b36a29e37809e1c9A7DE06BC0B26'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/18036/small/TQzTNi5.png?1630312183';
  }
  if (
    address?.toLowerCase() ===
    '0xc6480Da81151B2277761024599E8Db2Ad4C388C8'.toLowerCase()
  ) {
    uri = 'https://polygonscan.com/token/images/decentralgamesgov_32.png?v=1';
  }
  if (
    address?.toLowerCase() ===
    '0xf4C83080E80AE530d6f8180572cBbf1Ac9D5d435'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/14209/small/blank.png?1614940842';
  }
  if (
    address?.toLowerCase() ===
    '0xE0B52e49357Fd4DAf2c15e02058DCE6BC0057db4'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/19479/small/agEUR.png?1635283566';
  }

  if (
    address?.toLowerCase() ===
    '0x6Ccf12B480A99C54b23647c995f4525D544A7E72'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/14301/small/logo_poly_sym.png?1624893386';
  }
  if (
    address?.toLowerCase() ===
    '0x26f6Cb841F9D4D72b68D7dCb6fDB5d6C832dD2A7'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/16074/small/polysafu.PNG?1622770619';
  }
  if (
    address?.toLowerCase() ===
    '0xb82A20B4522680951F11c94c54B8800c1C237693'.toLowerCase()
  ) {
    uri = 'https://s2.coinmarketcap.com/static/img/coins/64x64/10620.png';
  }
  if (
    address?.toLowerCase() ===
    '0xad5dc12E88C6534Eea8cFe2265851D9d4A1472AD'.toLowerCase()
  ) {
    uri = 'https://falconswap.com/assets/img/logo/logo.png';
  }
  if (
    address?.toLowerCase() ===
    '0xf7058856f405542cd660e8ce4751248F2d037f2B'.toLowerCase()
  ) {
    uri =
      'https://raw.githubusercontent.com/YayoCorp/yayo-assets/master/avatar.png';
  }
  if (
    address?.toLowerCase() ===
    '0x2Ab4f9aC80F33071211729e45Cfc346C1f8446d5'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/14326/small/cgg_logo.png?1615429976';
  }

  if (
    address?.toLowerCase() ===
    '0x4C16f69302CcB511c5Fac682c7626B9eF0Dc126a'.toLowerCase()
  ) {
    uri =
      'https://raw.githubusercontent.com/PancakeBunny-finance/PolygonBUNNY/main/assets/token-bunny_32x32.png';
  }
  if (
    address?.toLowerCase() ===
    '0xbe9512e2754cb938dd69Bbb96c8a09Cb28a02D6D'.toLowerCase()
  ) {
    uri = 'https://i.ibb.co/D7nDtJK/Gem-Bites32x32.png';
  }

  if (
    address?.toLowerCase() ===
    '0x546b4c391520E6652897c65153074088BFC0A909'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/8242/small/for.png?1606195375';
  }
  if (
    address?.toLowerCase() ===
    '0xcE829A89d4A55a63418bcC43F00145adef0eDB8E'.toLowerCase()
  ) {
    uri =
      'https://assets.coingecko.com/coins/images/13796/small/renDOGE.png?1611897869';
  }

  if (!uri) {
    uri = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${address}/logo.png`;
  }

  return uri;
};

const useStyles = makeStyles(({}) => ({
  logoStyled: {
    boxShadow: '0px 6px 10px rgba(0, 0, 0, 0.075)',
    borderRadius: 24,
  },
}));

interface CurrencyLogoProps {
  currency?: Currency;
  size?: string;
  style?: React.CSSProperties;
}

const CurrencyLogo: React.FC<CurrencyLogoProps> = ({
  currency,
  size = '24px',
  style,
}) => {
  const classes = useStyles();
  const uriLocations = useHttpLocations(
    currency instanceof WrappedTokenInfo ? currency.logoURI : undefined,
  );

  const srcs: string[] = useMemo(() => {
    if (currency === ETHER) return [];

    if (currency instanceof Token) {
      if (currency instanceof WrappedTokenInfo) {
        return [...uriLocations, getTokenLogoURL(currency.address)];
      }

      return [getTokenLogoURL(currency.address)];
    }
    return [];
  }, [currency, uriLocations]);

  if (currency === ETHER) {
    return (
      <Box
        style={style}
        width={size}
        height={size}
        borderRadius={size}
        overflow='hidden'
      >
        <img
          className={classes.logoStyled}
          style={{ width: size, height: size }}
          src={EthereumLogo}
          alt='Ethereum Logo'
        />
      </Box>
    );
  }

  return (
    <Box
      width={size}
      height={size}
      borderRadius={size}
      overflow='hidden'
      bgcolor='white'
      display='flex'
      justifyContent='center'
      alignItems='center'
    >
      <Logo
        srcs={srcs}
        size={size}
        alt={`${currency?.symbol ?? 'token'} logo`}
      />
    </Box>
  );
};

export default CurrencyLogo;
