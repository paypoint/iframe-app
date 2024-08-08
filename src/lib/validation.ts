const isMobileNumberValid = (mobile_number: string) => {
  // if country code is 91, then it should validate
  // mobile no. and return true or false result
  const mobile_number_regex = /^[6-9]\d{9}$/;
  return mobile_number_regex.test(mobile_number);
};

const isRequired = (required: string) => {
  //should not be empty
  const requiredRegex = /^[\s\t\r\n]*\S+/;
  return requiredRegex.test(required);
};

const onlyAlphabetic = (alphabetic: string) => {
  // only alphabetic characters //

  const onlyAlphabeticRegex = /^[a-zA-Z ]*$/;
  return onlyAlphabeticRegex.test(alphabetic);
};

const isPasswordValid = (password: string) => {
  // should contain at least one digit
  // should contain at least one lower case
  // should contain at least one upper case
  // should contain at least 8 from the mentioned characters
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;
  return passwordRegex.test(password);
};

const isPINValid = (pin: string) => {
  // Pin should be min. 6 digit and numeric
  const pinRegex = /^[0-9]{1}[0-9]{2}[0-9]{3}$/;
  return pinRegex.test(pin);
};

const isOTPValid = (otp: string) => {
  // Check for OTP, min 6 and numeric
  const otpRegex = /^[0-9]{6}$/;
  return otpRegex.test(otp);
};

const isInputValid = (value: string, min_char_length = 1) => {
  // This will be used for name, address etc
  // its should 1st trim empty values
  // and char length should meet minimum requirement
  const value_trimmed = value.trim();
  return value_trimmed.length >= min_char_length;
};

/**
 *
 * @param {string} pan_card_number
 * @description PAN Card Number should be in "ABCDE1234F" format
 * @returns {boolean}
 */
const isPANCardValid = (pan_card_number: string) => {
  // This should match the criteria of Indian PAN Card
  // 10 Char
  // Char 1-5 upper case alphabet
  // Char 6-9 numeric value 0-9
  // Char 10th upper case alphabet
  // no whitespaces
  pan_card_number = pan_card_number.toUpperCase();
  const pan_card_regex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return pan_card_regex.test(pan_card_number);
};
const isVOTERIDValid = (voter_id_number: string) => {
  // This should match the criteria of Indian PAN Card
  // 10 Char
  // Char 1-3 upper case alphabet
  // Char 7 numeric value 0-9
  // Char 10th upper case alphabet
  // no whitespaces
  const voter_id_regex = /^[A-Z]{3}[0-9]{7}$/;
  return voter_id_regex.test(voter_id_number);
};
// Driving License //
const isDrivingLicense = (driving_license_number: string) => {
  // This should match the criteria of Indian PAN Card
  // 10 Char
  // Char 1-3 upper case alphabet
  // Char 7 numeric value 0-9
  // Char 10th upper case alphabet
  // no whitespaces
  const driving_license_regex =
    /^(([A-Z]{2}[0-9]{2})( ?))((19|20)[0-9][0-9])[0-9]{7}$/gm;
  return driving_license_regex.test(driving_license_number);
};

// spacial charter not allowed //

const isRemark = (remark_valid: string) => {
  const remark_regex = /^[\w\s]*$/;
  return remark_regex.test(remark_valid);
};
/**
 *
 * @param {Date} birth_date
 * @param {number} min_age
 * @description Date format must be in "MM-DD-YYYY"
 * @returns {boolean}
 */
const isAgeValid = (birth_date: string, min_age = 18) => {
  // Age should be minimum 18 years(default value)
  const today = new Date();
  const birth_date_obj = new Date(birth_date); // it set birth date in object one day before

  birth_date_obj.setDate(birth_date_obj.getDate() + 1);
  let age = today.getFullYear() - birth_date_obj.getFullYear();
  const m = today.getMonth() - birth_date_obj.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth_date_obj.getDate())) {
    age--;
  }
  return age >= min_age;
};
// Upi
const isUpivalidation = (upi: string) => {
  const upiRegex = /^[\w\.\-_]{1,}@[a-zA-Z]{2,}/;
  return upiRegex.test(upi);
};
const isEmailValid = (email: string) => {
  // Validate Email Address
  // Email should be in proper format
  // and should not contain whitespaces
  const emailRegex =
    /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g;
  return emailRegex.test(email);
};

const obj = {
  isTestValid: () => {
    return true;
  },
  isMobileNumberValid,
  isPINValid,
  isOTPValid,
  isInputValid,
  isPANCardValid,
  isRemark,
  isAgeValid,
  isEmailValid,
  isPasswordValid,
  isVOTERIDValid,
  isRequired,

  onlyAlphabetic,
  isDrivingLicense,
  isUpivalidation,
};

export default obj;
