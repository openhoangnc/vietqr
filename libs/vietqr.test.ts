import { makeVietQRContent, VietQRInput } from "./vietqr";
import testData from "./test-data.json";

describe("makeVietQRContent", () => {
  testData.forEach((data: any) => {
    const { bankID, accountNo, amount, description, qr } = data;

    const input: VietQRInput = {
      bankId: bankID,
      accountId: accountNo,
      amount: amount,
      description: description,
    };

    it("should generate the correct VietQR content", () => {
      const generatedQR = makeVietQRContent(input);
      // show input and output for debugging if not equal
      if (generatedQR !== qr) {
        console.log("input:", input);
        console.log("generatedQR:", generatedQR);
        console.log("expected QR:", qr);
      }
      expect(generatedQR).toEqual(qr);
    });
  });
});
