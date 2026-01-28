import { settingService } from '../services/setting.service';
import { globSync } from "glob"
import { isArray, isEmpty, isObject, random, union } from 'lodash'
import * as CryptoJS from 'crypto-js';
import * as nodemailer from 'nodemailer';
import * as path from 'path'
import * as fs from 'fs';
import { sprintf } from 'sprintf-js';
import { APP_NAME, ENCRYPT_HASH_KEY } from '../var/config';
import { readFileSync } from 'fs';
import { ASSETS_DIR, AWS_REGION, AWS_S3_API_VERSION, AWS_S3_BUCKET, AWS_S3_BUCKET_BASE_URL, BACKEND_LOCATION, BASE_FRONT_URL, BASE_APP_URL, BASE_URL, GMAIL_SMTP_PASSWORD, GMAIL_SMTP_USERNAME, MAILER_TYPE, SENDER_EMAIL, SES_HOST, SES_PASS, SES_SENDER_EMAIL, SES_USER, SMTP_PASSWORD, SMTP_SERVER, SMTP_USERNAME, UPLOAD_DIR, DB_HOST } from '../var/env.config';
import * as AWS from 'aws-sdk';
import moment from 'moment';
import { detect } from 'detect-browser';
import getSymbolFromCurrency from 'currency-symbol-map'

/**
 * get all files inside the folder
 */
export const globFiles = (location: string): string[] => {
  return union([], globSync(location))
}

/**
 * check if value is empty,
 * value can be undefined, null, '', false
 */
export const is_empty = (value: any): boolean => {
  if (value === undefined || value === null || value == '' || value === false) {
    return true;
  } else {
    return false;
  }
}

/**
 * check if variable is empty
 * variable can be basic value or array or object
 */
export const empty = (value: any): boolean => {
  let res = is_empty(value)
  //return res;
  if (!res) { //if value is not empty (res is false)
    if (Array.isArray(value)) {
      return value.length === 0
    } else if (isObject(value)) {
      return isEmpty(value)
    } else {
      return false
    }
  } else {
    return true
  }
}

/**
 * check if variable is set. (not null or undefined)
 */
export const isset = (value: any): boolean => {
  if (value === undefined || value === null) {
    return false;
  } else {
    return true;
  }
}

/**
 * check if variable is null or undefined
 */
export const is_null = (value: any): boolean => {
  if (value === undefined || value === null) {
    return true;
  } else {
    return false;
  }
}

/**
 * check if variable is numberic
 */
export const isNum = (val: any) => {
  return !isNaN(val)
}

/**
 * convert a variable to numberic value
 */
export const intval = (value: any): number => {
  if (empty(value)) {
    return 0;
  } else {
    if (isNum(value)) {
      if (value < 1) {
        return 0
      } else {
        let val = parseInt(value)
        return val
      }
    } else {
      let val = parseInt(value)
      return val
    }
  }
}

/**
 * convert a variabel to float value
 */
export const floatval = (value: any): number => {
  if (empty(value)) {
    value = 0;
  }
  let val = parseFloat(value)
  return val
}

/**
 * check if string is email format
 */
export const is_email = (email: string): boolean => {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

/**
 * trim all unnecessary chars from phone number string
 */
export const trim_phone = (num: string): string => {
  num = num.replace(/\+/g, '');
  num = num.replace(/-/g, '');
  num = num.replace(/_/g, '');
  num = num.replace(/\(/g, '');
  num = num.replace(/\)/g, '');
  num = num.replace(' ', '');
  num = num.replace(/ /g, '');
  return num;
}

/**
 * format phone number 
 */
export const format_phone = (phoneNoInput) => {
  const phoneNo = trim_phone(phoneNoInput)
  const formatNum = phoneNo.substr(0, 3) + '-' + phoneNo.substr(3, 3) + '-' + phoneNo.substr(6, 4);
  return formatNum
}

/**
 * remove all spaces inside a string
 */
export const removeAllSpaces = (num: string): string => {
  num = num.replace(' ', '');
  num = num.replace(/ /g, '');
  return num;
}

/**
 * get value from any variable.
 * variable can be any type (object, array,,,)
 */
export const get_data_value = (obj: any, key: string, default_value: any = ''): any => {
  if (empty(obj)) {
    return default_value
  }

  if (obj[key] !== undefined) {
    return obj[key]
  } else {
    return default_value
  }
}

/**
 * unset a field inside object or array
 */
export const unset = (myArray: any, key: number | string): any => { //remove item from array
  if (Array.isArray(myArray)) {
    if (typeof key === 'number') {
      myArray.splice(key, 1);
    } else {
      const index = myArray.indexOf(key, 0);
      if (index > -1) {
        myArray.splice(index, 1);
      }
    }
    return myArray
  } else if (isObject(myArray)) {
    delete myArray[key];
    return myArray
  }
  return myArray
}

/**
 * remove a specific item from array
 */
export const removeItemFromArray = (arr, value) => {
  var i = 0;
  while (i < arr.length) {
    if (arr[i] === value) {
      arr.splice(i, 1);
    } else {
      ++i;
    }
  }
  return arr;
}

/**
 * add item into array, 
 * item can not be duplicated
 */
export const addItemToArray = (arr, value) => {
  const index = arr.indexOf(value);
  if (index > -1) {
    //return arr
  } else {
    arr = [...arr, value]
  }
  return arr;
}

/**
 * get last character ('s') according to the value is greater than 1
 */
export const get_boxes = (val: number | string): string => {
  let str = "";
  if (intval(val) > 1) {
    str = "s";
  }
  return str;
}

/**
 * get current utc timestamp
 */
export const get_utc_timestamp = (): number => {
  let a: number = 0;
  let timestamp: number = new Date().getTime();
  a = Math.floor(timestamp / 1000);//a = Math.floor(Date.now() / 1000);
  return a
}

/**
 * get current utc timestamp (miliseconds)
 */
export const get_utc_timestamp_ms = (): number => {
  let timestamp: number = new Date().getTime();
  return timestamp
}

/**
 * get remaining time for human readable
 */
export const get_time_remain = (delta: number): any => {
  let duration = intval(delta);
  let year = intval(duration / (3600 * 24 * 30 * 365));
  duration = duration - year * 3600 * 24 * 30 * 365;
  let month = intval(duration / (3600 * 24 * 30));
  duration = duration - month * 3600 * 24 * 30;
  let day = intval(duration / (3600 * 24));
  duration = duration - day * 3600 * 24;
  let hour = intval(duration / 3600);
  duration = duration - hour * 3600;
  let minute = intval(duration / 60);
  duration = duration - minute * 60;
  let second = duration;
  let time_str = "just now";
  if (year === 0 && month === 0 && day === 0 && hour === 0 && minute === 0) {
    time_str = "just now";
  } else if (year === 0 && month === 0 && day === 0 && hour === 0) {
    time_str = minute + " minute" + (get_boxes(minute)) + "";
  } else if (year === 0 && month === 0 && day === 0) {
    time_str = hour + " hour" + (get_boxes(hour)) + "";
  } else if (year === 0 && month === 0) {
    time_str = day + " day" + (get_boxes(day)) + "";
  } else if (year === 0) {
    time_str = month + " month" + (get_boxes(month)) + "";
  } else {
    time_str = year + " year" + (get_boxes(year)) + "";
  }
  return time_str;
}

/**
 * get current date
 */
export const get_current_date = () => {
  let date_ob = new Date();
  // current date
  // adjust 0 before single digit date
  let date = ("0" + date_ob.getDate()).slice(-2);
  // current month
  let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  // current year
  let year = date_ob.getFullYear();
  // current hours
  let hours = date_ob.getHours();
  // current minutes
  let minutes = date_ob.getMinutes();
  // current seconds
  let seconds = date_ob.getSeconds();
  let result = year + "-" + month + "-" + date

  return result
}

/**
 * get human readable date from unixtimestamp
 */
export const toLocalDate = (unix_timestamp) => {
  var milliseconds = unix_timestamp * 1000;
  const dateObject = new Date(milliseconds);
  const humanDateFormat = dateObject.toLocaleDateString(); //2019-12-9 
  return humanDateFormat;
};

/**
 * encrypt string as md5
 */
export const encrypt_md5 = (str: string | number): string => {
  let new_str = str + "";
  const str_encrypted: string = CryptoJS.MD5(new_str).toString();
  return str_encrypted;
}

/**
 * encrypt string as md5
 */
export const generate_encrypted_id = (str: string | number, user_type: string): string => {
  let new_str = `${user_type}_${str}`;
  const str_encrypted: string = CryptoJS.MD5(new_str).toString();
  return str_encrypted;
}

/**
 * encrypt string by using cryptojs
 */
export const encrypt__str = (str: string): string => {
  try {
    let ciphertext: string = CryptoJS.AES.encrypt(str, ENCRYPT_HASH_KEY).toString();
    return ciphertext
  } catch (e) {
    return ''
  }
}

/**
 * decrypt string by using cryptojs
 */
export const decrypt__str = (str: string): string => {
  try {
    let bytes = CryptoJS.AES.decrypt(str, ENCRYPT_HASH_KEY);
    //console.log('bytes', bytes)
    let originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText
  } catch (e) {
    return ''
  }
}

/**
 * serialize value
 */
export const serialize = (mixed_value: any) => {
  var _utf8Size = function (str) {
    var size = 0, i = 0, l = str.length;
    let code: number;
    for (i = 0; i < l; i++) {
      code = str[i].charCodeAt(0) as number;
      if (code < 0x0080) {
        size += 1;
      } else if (code < 0x0800) {
        size += 2;
      } else {
        size += 3;
      }
    }
    return size;
  };
  var _getType = function (inp) {
    var type = typeof inp, match;
    var key;
    if (type === 'object' && !inp) {
      return 'null';
    }
    if (type === "object") {
      if (!inp.constructor) {
        return 'object';
      }
      var cons = inp.constructor.toString();
      match = cons.match(/(\w+)\(/);
      if (match) {
        cons = match[1].toLowerCase();
      }
      var types = ["boolean", "number", "string", "array"];
      for (key in types) {
        if (cons == types[key]) {
          return types[key];
          break;
        }
      }
    }
    return type;
  };
  var type = _getType(mixed_value);
  var val, ktype = '';
  switch (type) {
    case "function":
      val = "";
      break;
    case "boolean":
      val = "b:" + (mixed_value ? "1" : "0");
      break;
    case "number":
      val = (Math.round(mixed_value) == mixed_value ? "i" : "d") + ":" + mixed_value;
      break;
    case "string":
      val = "s:" + _utf8Size(mixed_value) + ":\"" + mixed_value + "\"";
      break;
    case "array":
    case "object":
      val = "a";
      var count = 0;
      var vals = "";
      var okey;
      var key;
      for (key in mixed_value) {
        if (mixed_value.hasOwnProperty(key)) {
          ktype = _getType(mixed_value[key]);
          if (ktype === "function") {
            continue;
          }
          okey = (key.match(/^[0-9]+$/) ? parseInt(key, 10) : key);
          vals += serialize(okey) +
            serialize(mixed_value[key]);
          count++;
        }
      }
      val += ":" + count + ":{" + vals + "}";
      break;
    case "undefined":
    default:
      val = "N";
      break;
  }
  if (type !== "object" && type !== "array") {
    val += ";";
  }
  return val;
}

/**
 * unserialize value
 */
export const unserialize = (data: any) => {
  var that = this;
  var utf8Overhead = function (chr) {
    var code = chr.charCodeAt(0);
    if (code < 0x0080) {
      return 0;
    }
    if (code < 0x0800) {
      return 1;
    }
    return 2;
  };
  var error = function (type, msg, filename, line) {
    return false//throw new that.window[type](msg, filename, line);
  };
  var utf8_decode = function (str_data) {
    var tmp_arr = [],
      i = 0,
      ac = 0,
      c1 = 0,
      c2 = 0,
      c3 = 0;
    str_data += '';
    while (i < str_data.length) {
      c1 = str_data.charCodeAt(i);
      if (c1 < 128) {
        tmp_arr[ac++] = String.fromCharCode(c1);
        i++;
      } else if ((c1 > 191) && (c1 < 224)) {
        c2 = str_data.charCodeAt(i + 1);
        tmp_arr[ac++] = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
        i += 2;
      } else {
        c2 = str_data.charCodeAt(i + 1);
        c3 = str_data.charCodeAt(i + 2);
        tmp_arr[ac++] = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
        i += 3;
      }
    }
    return tmp_arr.join('');
  };

  var utf8_encode = function (argString) {
    var string = (argString + '');
    var utftext = "";
    var start, end;
    var stringl = 0;
    start = end = 0;
    stringl = string.length;
    for (var n = 0; n < stringl; n++) {
      var c1 = string.charCodeAt(n);
      var enc = null;
      if (c1 < 128) {
        end++;
      } else if (c1 > 127 && c1 < 2048) {
        enc = String.fromCharCode((c1 >> 6) | 192) + String.fromCharCode((c1 & 63) | 128);
      } else {
        enc = String.fromCharCode((c1 >> 12) | 224) + String.fromCharCode(((c1 >> 6) & 63) | 128) + String.fromCharCode((c1 & 63) | 128);
      }
      if (enc !== null) {
        if (end > start) {
          utftext += string.substring(start, end);
        }
        utftext += enc;
        start = end = n + 1;
      }
    }
    if (end > start) {
      utftext += string.substring(start, string.length);
    }
    return utftext;
  };
  var read_until = function (data, offset, stopchr) {
    var buf = [];
    var chr = data.slice(offset, offset + 1);
    var i = 2;
    while (chr != stopchr) {
      if ((i + offset) > data.length) {
        return false//error('Error', 'Invalid');
      }
      buf.push(chr);
      chr = data.slice(offset + (i - 1), offset + i);
      i += 1;
    }
    return [buf.length, buf.join('')];
  };
  var read_chrs = function (data, offset, length) {
    var buf;
    buf = [];
    for (var i = 0; i < length; i++) {
      var chr = data.slice(offset + (i - 1), offset + i);
      buf.push(chr);
      length -= utf8Overhead(chr);
    }
    return [buf.length, buf.join('')];
  };
  var _unserialize = function (data, offset) {
    var readdata;
    var readData;
    var chrs = 0;
    var ccount;
    var stringlength;
    var keyandchrs;
    var keys;
    if (!offset) {
      offset = 0;
    }
    var dtype = (data.slice(offset, offset + 1)).toLowerCase();
    var dataoffset = offset + 2;
    var typeconvert = function (x) {
      return x;
    };
    switch (dtype) {
      case 'i':
        typeconvert = function (x) {
          return parseInt(x, 10);
        };
        readData = read_until(data, dataoffset, ';');
        chrs = readData[0];
        readdata = readData[1];
        dataoffset += chrs + 1;
        break;
      case 'b':
        typeconvert = function (x) {
          return parseInt(x, 10) !== 0;
        };
        readData = read_until(data, dataoffset, ';');
        chrs = readData[0];
        readdata = readData[1];
        dataoffset += chrs + 1;
        break;
      case 'd':
        typeconvert = function (x) {
          return parseFloat(x);
        };
        readData = read_until(data, dataoffset, ';');
        chrs = readData[0];
        readdata = readData[1];
        dataoffset += chrs + 1;
        break;
      case 'n':
        readdata = null;
        break;
      case 's':
        ccount = read_until(data, dataoffset, ':');
        chrs = ccount[0];
        stringlength = ccount[1];
        dataoffset += chrs + 2;
        readData = read_chrs(data, dataoffset + 1, parseInt(stringlength, 10));
        chrs = readData[0];
        readdata = readData[1];
        dataoffset += chrs + 2;
        if (chrs != parseInt(stringlength, 10) && chrs != readdata.length) {
          return false//error('SyntaxError', 'String length mismatch');
        }
        readdata = utf8_decode(readdata);
        break;
      case 'a':
        readdata = {};
        keyandchrs = read_until(data, dataoffset, ':');
        chrs = keyandchrs[0];
        keys = keyandchrs[1];
        dataoffset += chrs + 2;
        for (var i = 0; i < parseInt(keys, 10); i++) {
          var kprops = _unserialize(data, dataoffset);
          var kchrs = kprops[1];
          var key = kprops[2];
          dataoffset += kchrs;
          var vprops = _unserialize(data, dataoffset);
          var vchrs = vprops[1];
          var value = vprops[2];
          dataoffset += vchrs;
          readdata[key] = value;
        }
        dataoffset += 1;
        break;
      default:
        return false
        //error('SyntaxError', 'Unknown / Unhandled data type(s): ' + dtype);
        break;
    }
    return [dtype, dataoffset - offset, typeconvert(readdata)];
  };
  return _unserialize((data + ''), 0)[2];
}

/**
 * encrypt data
 */
export const encrypt__data = (data: object): string => {
  let str: string = encrypt__str(serialize(data))
  return str;
}

/**
 * decrypt data
 */
export const decrypt__data = (str: string): any => {
  let serialized_str: string = decrypt__str(str)
  if (!is_empty(serialized_str)) {
    let result = unserialize(serialized_str);
    return result
  }
  return false;
}

/**
 * convert string to base64 encoded string
 */
export const base64_encode = (str: string): string => {
  return Buffer.from(str).toString('base64');
}

/**
 * convert string to base64 decoded string
 */
export const base64_decode = (str: string): string => {
  return Buffer.from(str, 'base64').toString('ascii')
}

/**
 * format number for decimal digits
 */
export const number_format = (number: string | number, decimals: number = 0, dec_point: string = '.', thousands_sep: string = ','): string => {
  const lib_number_format = require("number_format-php");
  const number_formatted: string = lib_number_format(number, decimals, dec_point, thousands_sep)
  return number_formatted;
}

/**
 * create a random string for payment serial number
 */
export const makePaySn = (member_id: number): string => {
  let rand_str: number = random(10, 99)
  let str: string = rand_str + sprintf('%03d', get_utc_timestamp()) + sprintf('%03d', member_id % 1000)
  return str
}

/**
 * convert object to array
 */
export const to_array = (obj: any) => {
  let arr = [];
  for (let key in obj) {
    arr.push(obj[key])
  }
  return arr;
}

/**
 * sort an array by desc
 */
export const rsort = (arr: any) => {
  if (isArray(arr) || isObject(arr)) {
    if (isObject(arr)) {
      arr = to_array(arr)
    }
    let numArray = [];
    for (let i = 0; i < arr.length; i++) {
      numArray.push(Number(arr[i]))
    }
    numArray.sort(function (a, b) {
      return b - a;
    });
    return numArray
  } else {
    return []
  }
}

/**
 * sort array by using oject key
 */
export const usort = (arr: any, sort_key: string) => {
  if (isArray(arr) || isObject(arr)) {
    if (isObject(arr)) {
      arr = to_array(arr)
    }
    for (let i = 0; i < arr.length; i++) {
      let item = arr[i]
      arr[i][sort_key] = Number(item[sort_key])
    }
    arr.sort(function (a, b) {
      return b[sort_key] - a[sort_key];
    });
    return arr
  } else {
    return []
  }
}

/**
 * clone object
 */
export const copy_object = (arr: any) => {
  if (isArray(arr) || isObject(arr)) {
    return JSON.parse(JSON.stringify(arr))
  } else {
    return arr
  }
}

/**
 * reset array by using item key
 */
export const array_under_reset = (arr: any, reset_key: string, type: number = 1) => {
  if (isObject(arr) || isArray(arr)) {
    let tmp = {};
    for (let key in arr) {
      let v = arr[key]
      if (type === 1) {
        tmp[v[reset_key]] = v;
      } else if (type === 2) {
        if (empty(tmp[v[reset_key]])) {
          tmp[v[reset_key]] = [v];
        } else {
          tmp[v[reset_key]].push(v)
        }
      }
    }
    return tmp;
  } else {
    return arr;
  }
}

/**
 * merget 2 arrays into one
 */
export const array_merge = (arr1: any, arr2: any) => {
  let new_arr = [];
  if (isArray(arr1)) {
    for (let key in arr1) {
      new_arr.push(arr1[key])
    }
  }
  if (isArray(arr2)) {
    for (let key in arr2) {
      new_arr.push(arr2[key])
    }
  }
  return new_arr
}

/**
 * check if item exist in array
 */
export const in_array = (element: any, arr: any) => {
  if (arr.indexOf(element) >= 0) {
    return true
  } else {
    return false
  }
}

/**
 * decode the html encoded string
 */
export const decodeEntities = (encodedString: string) => {
  let translate_re = /&(nbsp|amp|quot|lt|gt);/g;
  let translate = {
    "nbsp": " ",
    "amp": "&",
    "quot": "\"",
    "lt": "<",
    "gt": ">"
  };
  return encodedString.replace(translate_re, function (match, entity) {
    return translate[entity];
  }).replace(/&#(\d+);/gi, function (match, numStr) {
    let num = parseInt(numStr, 10);
    return String.fromCharCode(num);
  });
}

/**
 * get aws file key from url or path
 */
export const getAWSFileKey = (path: string) => {
  if (path.includes(AWS_S3_BUCKET_BASE_URL)) {
    let file_key = path.replace(AWS_S3_BUCKET_BASE_URL, "");
    file_key = decodeURI(file_key)
    return file_key
  } else {
    return false
  }
}

/**
 * get email template html
 */
export const get_message_template = (template_id: number, adjust: boolean = true): string => {
  let container_file_path = "assets/global/email_template/email_template.html";
  let email_banner_file_path = "assets/global/email_template/email_banner.html";
  let message_title_file_path = "assets/global/email_template/email_message_title.html";
  let email_business_footer_path = "assets/global/email_template/email_business_footer.html";
  let email_partner_footer_path = "assets/global/email_template/email_partner_footer.html";

  let file_path = "assets/global/email_template/email_template_" + template_id + ".html";
  if (ASSETS_DIR !== "") {
    container_file_path = ASSETS_DIR + "/global/email_template/email_template.html";
    email_banner_file_path = ASSETS_DIR + "/global/email_template/email_banner.html";
    message_title_file_path = ASSETS_DIR + "/global/email_template/email_message_title.html";
    file_path = ASSETS_DIR + "/global/email_template/email_template_" + template_id + ".html";
    email_business_footer_path = ASSETS_DIR + "/assets/global/email_template/email_business_footer.html";
    email_partner_footer_path = ASSETS_DIR + "/assets/global/email_template/email_partner_footer.html";
  }

  let container_file_content: any;
  let email_banner_content: any;
  let message_title_content: any;
  let email_business_footer_content: any;
  let email_partner_footer_content: any;
  let file_content: any;
  try {
    container_file_content = readFileSync(container_file_path, 'utf-8');
    email_banner_content = readFileSync(email_banner_file_path, 'utf-8');
    message_title_content = readFileSync(message_title_file_path, 'utf-8');
    email_business_footer_content = readFileSync(email_business_footer_path, 'utf-8');
    email_partner_footer_content = readFileSync(email_partner_footer_path, 'utf-8');
    file_content = readFileSync(file_path, 'utf-8');
    //console.log("file", file_content)
  } catch (err) {

  }

  if (empty(file_content)) {
    return "";
  }
  let container_html: string = container_file_content as string;
  let email_banner_content_html: string = email_banner_content as string;
  let message_title_content_html: string = message_title_content as string;
  let html: string = file_content as string;
  container_html = container_html.replace(/%%email_template_content%%/gi, html);
  container_html = container_html.replace(/%%email_business_footer%%/gi, email_business_footer_content);
  container_html = container_html.replace(/%%email_partner_footer%%/gi, email_partner_footer_content);

  /////////////////// replace all variables in the template /////////////////////////////////////////
  let base_app_url = "https://partners.fixmyfees.com"
  let email_img_base_url = base_app_url
  container_html = container_html.replace(/%%email_banner_content%%/gi, email_banner_content_html);

  let banner_filename = "0_welcome.jpeg" // default image
  let message_title = ""

  // if (template_id === 0) { //confirm email (signup)
  //   banner_filename = "0_confirm_email.jpg"
  //   message_title = "EMAIL CONFIRMATION!"
  // }
  // else if (template_id === 1) { // reset password
  //   banner_filename = "1_reset_password.jpg"
  //   message_title = "RESET PASSWORD"
  // }

  if (message_title) {
    container_html = container_html.replace(/%%message_title_content%%/gi, message_title_content_html);
  } else {
    container_html = container_html.replace(/%%message_title_content%%/gi, "");
  }

  container_html = container_html.replace(/%%banner_url%%/gi, email_img_base_url + "/assets/global/images/email/email_banners/" + banner_filename);
  container_html = container_html.replace(/%%message_title%%/gi, message_title);

  let logo_url = email_img_base_url + "/assets/global/images/email/logo-email.png";
  container_html = container_html.replace(/%%site_title%%/gi, APP_NAME);
  container_html = container_html.replace(/%%logo_url%%/gi, logo_url);
  container_html = container_html.replace(/%%site_url%%/gi, BASE_FRONT_URL);

  if (template_id != 11) {
    container_html = container_html.replace(/%%display_unsubscribe_link%%/gi, "none");
    container_html = container_html.replace(/%%unsubscribe_link%%/gi, "#");
  } else {
    container_html = container_html.replace(/%%display_unsubscribe_link%%/gi, "block");
  }

  container_html = container_html.replace(/%%base_app_url%%/gi, base_app_url);
  return container_html;
}

/**
 * send an email
 */
export const send_email = async (to: string, subject: string, message: string, from_email: string = '', attachments: any = []) => {
  let app_settings = await settingService.get_app_settings();
  if (app_settings['email_func'] === 'false') {
    return true
  }

  if (from_email == "") {
    from_email = SENDER_EMAIL
  }
  let transporter: any;

  if (MAILER_TYPE === "AWS_SES") {
    transporter = nodemailer.createTransport({
      host: SES_HOST,
      port: 465,
      // pool: true,
      secure: true, // use TLS
      auth: {
        user: SES_USER,
        pass: SES_PASS
      }
    });
    from_email = SES_SENDER_EMAIL
  }
  else if (MAILER_TYPE === "GMAIL") {
    //console.log('GMAIL_SMTP_USERNAME,GMAIL_SMTP_PASSWORD, SES_SENDER_EMAIL', GMAIL_SMTP_USERNAME, GMAIL_SMTP_PASSWORD, SES_SENDER_EMAIL)
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: GMAIL_SMTP_USERNAME,
        pass: GMAIL_SMTP_PASSWORD
      }
    });
    from_email = SES_SENDER_EMAIL
  }
  else { //SMTP
    transporter = nodemailer.createTransport({
      host: SMTP_SERVER,
      port: 2525,
      // pool: true,
      secure: false, // use TLS
      auth: {
        user: SMTP_USERNAME,
        pass: SMTP_PASSWORD
      }
    });
    from_email = SES_SENDER_EMAIL
  }

  var mailOptions = {
    from: APP_NAME + '<' + from_email + '>',
    to: to,
    subject: subject,
    html: message
  };
  if (!empty(attachments)) {
    mailOptions['attachments'] = attachments
  }
  try {
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.error('email sent error', to, subject, error)
      } else {
        console.log('Email sent::::: ', to, subject, info.response)
      }
    });
  } catch (e) {
    console.log("sendEmail error", e)
  }
  return true
}

/**
 * send an email with attachment file
 */
export const mail_attachment = async (to: string, subject: string, message: string, from_email: string = '', attach_path_arr: any = []) => {
  let attachments = [];
  for (let key in attach_path_arr) {
    let attach_path = <string>attach_path_arr[key]
    let aws_file_key = getAWSFileKey(attach_path)
    if (aws_file_key === false) {
      let filename = path.basename(attach_path)
      let absolutePath = path.resolve(__dirname, "../../src/public/" + attach_path);
      if (!empty(UPLOAD_DIR)) {
        absolutePath = UPLOAD_DIR + "/" + attach_path
      }
      let dirname = __dirname
      //console.log('----------------attach_path, absolutePath----------', attach_path, absolutePath)
      let attachment = {
        filename: filename,
        content: fs.createReadStream(absolutePath)
      }
      attachments.push(attachment)
    }
    else {
      attach_path = aws_file_key
      //console.log('----------------aws_file_key----------', aws_file_key)
      AWS.config.update({ region: AWS_REGION });

      // Create S3 service object
      let s3 = new AWS.S3({ apiVersion: AWS_S3_API_VERSION });
      let theObject: any
      try {
        const params = {
          Bucket: AWS_S3_BUCKET,
          Key: aws_file_key
        };
        theObject = await s3.getObject(params).promise();
        //console.log('----------------the AWS Object----------', theObject)
        let attachment = {
          filename: aws_file_key,
          content: theObject.Body
        }
        attachments.push(attachment)
      } catch (error) {
        console.log(error);
        return;
      }
    }
  }
  //console.log('------------------------attachments---------------------', attachments)

  return await send_email(to, subject, message, from_email, attachments)
}

/**
 * generate random string
 */
export const randomString = (length: number, number_only: boolean = false): string => {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  if (number_only) {
    characters = '0123456789';
  }
  let charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    let c = characters.charAt(Math.floor(Math.random() * charactersLength));
    if (number_only && i === 0) {
      if (c === '0') {
        c = '1'
      }
    }
    result += c
  }
  return result;
}

/**
 * check password strenth
 */
export const checkPasswordStrenth = (passwordParameter: string, check_type: number = 1): any => {
  let result: boolean = true;
  let strongPassword = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9])(?=.{8,})') //has at least one lowercase letter (?=.*[a-z]), one uppercase letter (?=.*[A-Z]), one special character (?=.*[^A-Za-z0-9]), and is at least eight characters long(?=.{8,}).
  let strongPassword1 = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})') //has at least one lowercase letter (?=.*[a-z]), one uppercase letter (?=.*[A-Z]), one digit (?=.*[0-9]), one special character (?=.*[^A-Za-z0-9]), and is at least eight characters long(?=.{8,}).
  let mediumPassword = new RegExp('((?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{6,}))|((?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9])(?=.{8,}))') //The code is the same as for the Strong level only that ?=.{6,} shows that we are checking for at least six characters. It also has | to check for either of the two conditions

  if (check_type === 1) {  //strong checker
    if (!strongPassword.test(passwordParameter)) {
      result = false;
    }
  } else if (check_type === 2) { //mediun checker
    if (!mediumPassword.test(passwordParameter)) {
      result = false;
    }
  }
  let message = ""
  if (!result) {
    message = "Password must have at least one lowercase letter, one uppercase letter, one special character and it is at least eight characters long"
  }
  return [result, message];
}

/**
 * get network interface for current server
 */
export const getNetworkInterface = () => {
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  const results = Object.create(null); // Or just '{}', an empty object

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === 'IPv4' && !net.internal) {
        if (!results[name]) {
          results[name] = [];
        }
        results[name].push(net.address);
      }
    }
  }
  console.log('getNetworkInterface results', results)
  return results;
}

/**
 * get public ipv4 of current server
 */
export const getPublicIp = async () => {
  const publicIp = require('public-ip');
  let public_ip = "";
  try {
    public_ip = await publicIp.v4();
  } catch (e) {
    public_ip = "";
  }
  //console.log('public_ip', public_ip)
  return public_ip;
}

/**
 * wait for some miliseconds
 */
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * check if string is valid http url
 */
export const isValidHttpUrl = (string) => {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

/**
 * get domain name from url
 */
export const getDomainFromUrl = (url) => {
  if (isValidHttpUrl(url)) {
    let domain = (new URL(url));
    let domainName = domain.hostname;
    if (domainName) {
      domainName = domainName.trim()
    }
    return domainName
  } else {
    return url
  }
}

/**
 * uglify js file
 */
export const minifyJs = (jsCode: string) => {
  var UglifyJS = require("uglify-js");
  var result = UglifyJS.minify(jsCode);
  return result
}

/**
 * parse params from url string
 */
export const parseUrl = (urlString: string) => {
  var url = require('url');
  var parseData = url.parse(urlString, true);
  return parseData
}

/**
 * add prefix key into array object
 */
export const addKeyPrefix = (data, prefix) => {
  let dataAdjusted = {}
  try {
    for (let k in data) {
      const newKey = `${prefix}${k}`
      dataAdjusted[newKey] = data[k]
    }
  } catch (e) {
    console.log("addKeyPrefix error:::", e)
  }
  return dataAdjusted
}

/**
 * get ip address from http request
 */
export const getIpFromRequest = (request) => {
  let ip = "";
  try {
    ip = request.headers['x-forwarded-for'] || request.socket.remoteAddress
  } catch (e) {

  }

  //::ffff:192.168.0.71

  if (ip.substr(0, 7) == "::ffff:") {
    ip = ip.substr(7)
  }
  return ip;
}

/**
 * detect browser type from http request
 */
export const detectBrowser = (request) => {
  try {
    const browser = detect(request.headers['user-agent']);
    // console.log("browserInfo:::", browserInfo)
    // browserInfo::: BrowserInfo {
    //     name: 'chrome',
    //     version: '112.0.0',
    //     os: 'Windows 10',
    //     type: 'browser'
    //   }
    const browserName = browser.name
    return browserName
  } catch (e) {
    return ""
  }
}

/**
 * split array to chunks
 */
export const splitArrayToChunks = (arr, chunkSize) => {
  try {
    const chunks = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      const chunk = arr.slice(i, i + chunkSize);
      chunks.push(chunk);
    }
    return chunks
  } catch (e) {
    console.log("splitArrayToChunks error:::", e)
    return null
  }
}

/**
 * merge 2 objects
 */
export const mergeObjects = (mainObj, objAdded, prefix = "") => {
  try {
    for (let k in objAdded) {
      const v = objAdded[k]
      const newKey = `${prefix}${k}`
      mainObj[newKey] = v
    }
    return mainObj
  } catch (e) {
    console.log("mergeObjects error:::", e)
    return mainObj
  }
}

/**
 * check if string has only letters and numbers
 */
export const onlyLettersAndNumbers = (str) => {
  return /^[A-Za-z0-9]*$/.test(str);
}

/**
 * generate api sample 
 * this function is used for testing
 */
export const get_api_sample_response = async (file_name) => {
  if (BASE_URL === 'http://localhost:8090' && DB_HOST === 'localhost') { // for local
    // continue
    // return false
  } else { // for live
    return false
  }

  let file_path = `assets/global/tmp/${file_name}`;
  if (ASSETS_DIR !== "") {
    file_path = ASSETS_DIR + `/global/tmp/${file_name}`;
  }
  let file_content: any;
  try {
    console.log("::::::::get_api_sample_response file_path::::", file_path)
    file_content = readFileSync(file_path, 'utf-8');
    file_content = JSON.parse(file_content)
    //console.log("file", file_content)
  } catch (err) {

  }
  return file_content;
}

/**
 * unescape string
 */
export const unescapeHTML = (htmlString) => {
  return htmlString.replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

/**
 * extranct url inside iframe
 */
export const extractUrlFromIframe = (iframeString) => {
  try {
    var iframeURL = ""
    // Your HTML string containing the iframe
    //var iframeString = '<iframe src="https://www.example.com"></iframe>';

    // Regular expression to match the src attribute in the iframe tag
    var regex = /<iframe[^>]+src="([^"]+)"/;

    // Use the regex to extract the URL from the iframe string
    var match = regex.exec(iframeString);

    // Check if a match was found
    if (match && match[1]) {
      iframeURL = match[1];
      //console.log("Extracted URL from iframe: " + iframeURL);

      iframeURL = unescapeHTML(iframeURL)
    } else {
      //console.log("No URL found in the iframe string.");
    }
    return iframeURL
  } catch (e) {
    console.log("extractUrlFromIframe error:::", e)
  }
}

/**
 * sort multidimensional array
 */
export const sortObjectArray = (o_arr, key) => {
  return o_arr.sort((a, b) => a[key].localeCompare(b[key]))
}

/**
 * check if variable is circular
 */
export const isCircular = (d) => {
  try {
    JSON.stringify(d)
  }
  catch (e) {
    return true
  }
  return false
}

/**
 * sort multidimensional array
 */
export const get_transaprent_1_pixel_file = async () => {
  try {
    const file_name = `transparent-1-pixel.png`
    let file_path = `assets/global/img/${file_name}`;
    if (ASSETS_DIR !== "") {
      file_path = ASSETS_DIR + `/global/img/${file_name}`;
    }
    if (fs.existsSync(file_path)) {
      return file_path
    }
  } catch (err) {

  }
}

/**
 * write text into a file
 */
export const writeFileSync = (data, filePath) => {
  try {
    data = data + "\n"
    fs.writeFileSync(filePath, data, { flag: 'a+', encoding: "utf8" });   //'a+' is append mode 
    return true;
  } catch (error) {
    console.log("writeFileSync error:::", error)
    return false;
  }
}

/**
 * add log into log file
 */
export const addToLogFile = (log_item, logType = "general", logfilePath = "") => {
  try {
    let currentDateUtc = moment.utc().format('YYYY-MM-DD');
    let currentUtc = moment.utc().format('YYYY-MM-DD HH:mm:ss');
    if (empty(logfilePath)) {
      const logDirectoryPath = path.join(__dirname, `../../logs/${logType}-logs`)
      if (!fs.existsSync(logDirectoryPath)) {
        fs.mkdirSync(logDirectoryPath, { recursive: true });
      }
      logfilePath = path.join(logDirectoryPath, `log-${currentDateUtc}.txt`)
    }
    //console.log('logfilePath:::', logfilePath)

    const type = typeof log_item;
    //console.log("type:::::", type)
    let log_data_str = ""
    if (type == "number") {
      log_data_str = log_item
    }
    else if (type == "string") {
      log_data_str = log_item
    }
    else if (type == "object") {
      if (!isCircular(log_item)) {
        log_data_str = JSON.stringify(log_item)
      } else {
        console.log(log_item)
      }
    } else { //boolean
      log_data_str = log_item
    }
    const logText = `[${currentUtc}] ${log_data_str}`
    writeFileSync(logText, logfilePath)
    return logfilePath
  } catch (e) {
    console.log("addToLogFile error:::", e)
  }
}

/**
 * output runtime log
 */
export const runtime_log = (status) => {
  const timestamp_ms = Date.now()
  console.log(`----------${status} timestamp ms--------: ${timestamp_ms}`);
  return true
}

/**
 * output console log
 */
export const console_log = (...log_data) => {
  if (BACKEND_LOCATION !== 'localhost') {
    return false
  }
  console.log(...log_data);
}
