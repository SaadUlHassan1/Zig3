import { Logo } from "@stellar/design-system";
import Finger from '../svg/finger'
import Rabet from '../svg/rabet'
import Key from '../svg/key'
import NewWallet from '../svg/wallet'
import { ModalType, Wallets } from "types/types.d";

export const wallets: Wallets = {
  fingerFace: {
    title: "Login with Finger/Face",
    logoSvg: <Finger/>,
    modalType: ModalType.SIGNIN_FINGER_FACE,
    infoText: "No biometrics? Don't worry we'll switch in to pin.",
    infoLinkText: "Learn more",
    infoLink: "https://zig3.io",
  },
  rabet: {
    title: "Login with Rabet",
    logoSvg: <Rabet/>,
    modalType: ModalType.SIGNIN_RABET,
    infoText: "Rabet is a browser extension wallet. Available on Chrome and Firefox.",
    infoLinkText: "Download",
    infoLink: "https://rabet.io/",
  },
  albedo: {
    title: "Login with Albedo",
    logoSvg: <Logo.Albedo />,
    modalType: ModalType.SIGNIN_ALBEDO,
    infoText: "Albedo is a browser wallet.",
    infoLinkText: "Learn more",
    infoLink: "https://albedo.link",
  },
  freighter: {
    title: "Login with Freighter",
    logoSvg: <Logo.Freighter />,
    modalType: ModalType.SIGNIN_FREIGHTER,
    infoText:
      "Freighter is a browser extension wallet. Available on Chrome and Firefox.",
    infoLinkText: "Download",
    infoLink: "https://freighter.app",
  },
  ledger: {
    title: "Login with Ledger",
    logoSvg: <Logo.Ledger />,
    modalType: ModalType.SIGNIN_LEDGER,
    infoText: "Ledger is a Stellar-compatible hardware wallet.",
    infoLinkText: "Learn more",
    infoLink: "https://www.ledger.com",
  },
  trezor: {
    title: "Login with Trezor",
    logoSvg: <Logo.Trezor />,
    modalType: ModalType.SIGNIN_TREZOR,
    infoText: "Trezor is a Stellar-compatible hardware wallet.",
    infoLinkText: "Learn more",
    infoLink: "https://trezor.io",
  },
  secretKey: {
    title: "Login with SecretKey",
    logoSvg: <Key/>,
    modalType: ModalType.SIGNIN_SECRET_KEY,
    infoText: "Trezor is a Stellar-compatible hardware wallet.",
    infoLinkText: "Learn more",
    infoLink: "https://trezor.io",
  },
  newWallet: {
    title: "Create A New Wallet",
    logoSvg: <NewWallet/>,
    modalType: ModalType.NEW_KEY_PAIR,
    infoText: "Trezor is a Stellar-compatible hardware wallet.",
    infoLinkText: "Learn more",
    infoLink: "https://trezor.io",
  },
};
// import { Logo } from "@stellar/design-system";


// export const wallets: Wallets = {
//   albedo: {
//     title: "Connect with Albedo",
//     logoSvg: <Logo.Albedo />,
//     modalType: ModalType.SIGNIN_ALBEDO,
//     infoText: "Albedo is a browser wallet.",
//     infoLinkText: "Learn more",
//     infoLink: "https://albedo.link",
//   },
//   freighter: {
//     title: "Connect with Freighter",
//     logoSvg: <Logo.Freighter />,
//     modalType: ModalType.SIGNIN_FREIGHTER,
//     infoText:
//       "Freighter is a browser extension wallet. Available on Chrome and Firefox.",
//     infoLinkText: "Download",
//     infoLink: "https://freighter.app",
//   },
//   ledger: {
//     title: "Connect with Ledger",
//     logoSvg: <Logo.Ledger />,
//     modalType: ModalType.SIGNIN_LEDGER,
//     infoText: "Ledger is a Stellar-compatible hardware wallet.",
//     infoLinkText: "Learn more",
//     infoLink: "https://www.ledger.com",
//   },
//   trezor: {
//     title: "Connect with Trezor",
//     logoSvg: <Logo.Trezor />,
//     modalType: ModalType.SIGNIN_TREZOR,
//     infoText: "Trezor is a Stellar-compatible hardware wallet.",
//     infoLinkText: "Learn more",
//     infoLink: "https://trezor.io",
//   },
// };


