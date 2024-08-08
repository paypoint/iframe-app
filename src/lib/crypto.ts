import CryptoJS from "crypto-js";

class Crypto {
  CryptoGraphEncrypt(value: string) {
    const _salt = "giNw3QjbSIRZPutL";
    const key = CryptoJS.enc.Utf8.parse(_salt);
    const iv = CryptoJS.enc.Utf8.parse(_salt);
    const encrypted = CryptoJS.AES.encrypt(
      CryptoJS.enc.Utf8.parse(value.toString()),
      key,
      {
        keySize: 128 / 8,
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    );
    return encrypted.toString();
  }

  CryptoGraphDecrypt(ciphertext: string) {
    const _salt = "giNw3QjbSIRZPutL";
    const key = CryptoJS.enc.Utf8.parse(_salt);
    const iv = CryptoJS.enc.Utf8.parse(_salt);
    const decrypted = CryptoJS.AES.decrypt(ciphertext, key, {
      keySize: 128 / 8,
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
  }
}
export default new Crypto();
