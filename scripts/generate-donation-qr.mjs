import QRCode from "qrcode";

const donationUrl = "https://airaxai-6vcs6pth.manus.space/donasi.html";
const appDeepLink = "manusairaxai://";

await QRCode.toFile("assets/images/donation-qr.png", donationUrl, {
  color: { dark: "#0B1220", light: "#FFFFFF" },
  errorCorrectionLevel: "M",
  margin: 2,
  width: 512,
});

await QRCode.toFile("public/vaira-ai-app-qr.png", appDeepLink, {
  color: { dark: "#0B1220", light: "#FFFFFF" },
  errorCorrectionLevel: "M",
  margin: 2,
  width: 360,
});
