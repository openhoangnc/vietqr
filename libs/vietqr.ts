export function crc16(str: string): string {
  let crc = 0xffff;

  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;

    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
  }

  crc = crc & 0xffff;
  return crc.toString(16).padStart(4, "0").toUpperCase();
}

export type VietQRInput = {
  bankId: string;
  accountId: string;
  amount?: number;
  description?: string;
};

const pad2zero = (num: number) => num.toString().padStart(2, "0");

export function makeVietQRContent(input: VietQRInput): string {
  let v =
    "000201010211" +
    "38" +
    pad2zero(input.bankId.length + input.accountId.length + 38) +
    "0010A000000727" +
    "01" +
    pad2zero(input.bankId.length + input.accountId.length + 8) +
    "00" +
    pad2zero(input.bankId.length) +
    input.bankId +
    "01" +
    pad2zero(input.accountId.length) +
    input.accountId;

  v += "0208QRIBFTTA";
  v += "5303704";

  if (input.amount) {
    const amountStr = input.amount.toString();
    v += "54" + pad2zero(amountStr.length) + amountStr;
  }
  v += "5802VN";

  if (input.description) {
    v +=
      "62" +
      pad2zero(input.description.length + 4) +
      "08" +
      pad2zero(input.description.length) +
      input.description;
  }

  v += "6304";

  v += crc16(v);

  return v;
}
