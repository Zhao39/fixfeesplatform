import { BACKEND_LOCATION, BASE_UPLOAD_URL } from "config/constants";
import moment from 'moment';
import momentZ from 'moment-timezone';

export const console_log = (...data) => {
	if (BACKEND_LOCATION !== "localhost") {
		return false
	}
	console.log(...data)
};

export const ValidEmail = (email) => {
	var pattern = new RegExp(
		/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i
	);
	if (!pattern.test(email)) {
		return false;
	} else {
		return true;
	}
};

export const get_data_value = (data, field, default_value) => {
	if (is_empty(default_value)) {
		default_value = "";
	}
	if (is_empty(data)) {
		return default_value;
	}
	if (is_null(data[field])) {
		return default_value;
	} else {
		return data[field];
	}
};
export const isJson = (str) => {
	try {
		JSON.parse(str);
	} catch (e) {
		return false;
	}
	return true;
};
export const isEmpty = (list, field, errorList) => {
	if (list[field] === undefined || list[field] === null || list[field] === "") {
		var res = [...errorList, field];
		return res;
	}
	return errorList;
};
export const is_empty = (value) => {
	if (
		value === undefined ||
		value === null ||
		value === "" ||
		value === false
	) {
		return true;
	} else {
		return false;
	}
};
export const is_null = (value) => {
	if (value === undefined || value === null) {
		return true;
	} else {
		return false;
	}
};
export const isEmptyObject = (obj) => {
	for (var prop in obj) {
		if (obj.hasOwnProperty(prop)) {
			return false;
		}
	}
	return JSON.stringify(obj) === JSON.stringify({});
};
export const empty = (value) => {
	let res = is_empty(value);
	//return res;
	if (!res) {
		//if value is not empty (res is false)
		if (Array.isArray(value)) {
			return value.length === 0;
		} else if (typeof value === "object") {
			return isEmptyObject(value);
		} else {
			return false;
		}
	} else {
		return true;
	}
};
export const isNum = (val) => {
	return !isNaN(val)
}
export const intval = (value) => {
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

export const priceFormat = (num, currencySign = null) => {
	num = Number(num)
	let num_formatted = num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
	if (currencySign) {
		num_formatted = `${currencySign}${num_formatted}`
	} else {
		num_formatted = `${num_formatted}`
	}
	return num_formatted
};
export const numberFormat = (num, dicimal = 0) => {
	num = Number(num)
	let num_formatted = num.toFixed(dicimal).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
	return num_formatted
};

export const checkNumber = (x) => {
	// check if the passed value is a number
	if (!isNaN(x)) {
		x = Number(x)
		// check if it is integer
		if (Number.isInteger(x)) {
			//console.log(`${x} is integer.`);
			return 'integer'
		}
		else {
			//console.log(`${x} is a float value.`);
			return 'float'
		}
	}
	return false
}

export const to_array = (obj) => {
	let arr = [];
	for (let key in obj) {
		arr.push(obj[key]);
	}
	return arr;
};
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
export const addItemToArray = (arr, value) => {
	const index = arr.indexOf(value);
	if (index > -1) {
		//return arr
	} else {
		arr = [...arr, value]
	}
	return arr;
}

export const get_utc_timestamp = () => {
	let a = 0;
	let timestamp = new Date().getTime();
	a = Math.floor(timestamp / 1000); //a = Math.floor(Date.now() / 1000);
	return a;
};

export const get_utc_timestamp_ms = () => {
	let a = 0;
	let timestamp = new Date().getTime();
	return timestamp
};

export const formatDate = (date) => { //javascript date object to yyyy-mm-dd
	var d = new Date(date),
		month = '' + (d.getMonth() + 1),
		day = '' + d.getDate(),
		year = d.getFullYear();

	if (month.length < 2)
		month = '0' + month;
	if (day.length < 2)
		day = '0' + day;

	return [year, month, day].join('-');
}

export const timeConverter = (UNIX_timestamp, with_ago = false, with_time = true) => {
	var unix = Math.round(Date.now() / 1000);
	//unix = moment().unix();
	//unix = unix - 360;///////////////////////////////
	var delta = unix - UNIX_timestamp;
	if (delta < 0) delta = 0;

	var time = "";
	if (with_ago) {
		if (delta < 86400) {
			var hour = Math.floor(delta / 3600);
			delta = delta - hour * 3600;
			var min = Math.floor(delta / 60);
			delta = delta - min * 60;
			if (hour === 0) {
				if (min === 0) {
					time = "Just now";
				} else {
					time = min + " minute" + (min > 1 ? "s" : "") + " ago";
				}
			} else {
				time = hour + " hour" + (hour > 1 ? "s" : "") + " ago";
			}
		} else {
			const days = Math.floor(delta / 86400);
			time = days + " day" + (days > 1 ? "s" : "") + " ago";
		}
	} else {
		var a = new Date(UNIX_timestamp * 1000);
		var months = [
			"Jan",
			"Feb",
			"Mar",
			"Apr",
			"May",
			"Jun",
			"Jul",
			"Aug",
			"Sep",
			"Oct",
			"Nov",
			"Dec",
		];
		var year = a.getFullYear();
		var month = months[a.getMonth()];
		var date = "" + a.getDate();
		var hour = "0" + a.getHours();
		var min = "0" + a.getMinutes();
		var sec = "0" + a.getSeconds();
		//time = date.substr(-2) + ' ' + month + ' ' + year + ' ' + hour.substr(-2) + ':' + min.substr(-2) + ':' + sec.substr(-2) ;
		time = month + " " + date + ", " + year;
		if (with_time) {
			time += " " + hour.substr(-2) + ":" + min.substr(-2);
		}
	}
	return time;
}

export const getTimeStringFromSeconds = (delta) => {
	let time = ""
	if (delta < 86400) {
		var hour = Math.floor(delta / 3600);
		delta = delta - hour * 3600;
		var min = Math.floor(delta / 60);
		delta = delta - min * 60;
		if (hour === 0) {
			if (min === 0) {
				time = delta + " second" + (delta > 1 ? "s" : "") + "";
			} else {
				time = min + " minute" + (min > 1 ? "s" : "") + "";
			}
		} else {
			time = hour + " hour" + (hour > 1 ? "s" : "") + "";
		}
	} else {
		time = ""
	}
	return time;
}

export const getMonthDate = (UNIX_timestamp, with_time = true) => {
	var unix = Math.round(Date.now() / 1000);
	//unix = moment().unix();
	//unix = unix - 360;///////////////////////////////
	var delta = unix - UNIX_timestamp;
	if (delta < 0) delta = 0;

	var time = "";
	var a = new Date(UNIX_timestamp * 1000);
	var months = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec",
	];
	var year = a.getFullYear();
	var month = months[a.getMonth()];
	var date = "" + a.getDate();
	var hour = "0" + a.getHours();
	var min = "0" + a.getMinutes();
	var sec = "0" + a.getSeconds();
	//time = date.substr(-2) + ' ' + month + ' ' + year + ' ' + hour.substr(-2) + ':' + min.substr(-2) + ':' + sec.substr(-2) ;
	time = month + " " + date
	if (with_time) {
		time += " " + hour.substr(-2) + ":" + min.substr(-2);
	}
	return time;
}

export const getLocalTimezone = () => { // return  iana_timezone: ex: "Australia/Sydney" (local timezone)
	let tz = null
	try {
		tz = momentZ.tz.guess();
	} catch (e) {
		console.log("getLocalTimezone error:::", e)
	}
	return tz
}

export const curl_post = (path, params, method = 'post', target = '') => {

	// The rest of this code assumes you are not using a library.
	// It can be made less verbose if you use one.
	const form = document.createElement('form');
	if (target !== "") { // _blank or _self
		form.target = target;
	}
	form.method = method;
	form.action = path;

	for (const key in params) {
		if (params.hasOwnProperty(key)) {
			const hiddenField = document.createElement('input');
			hiddenField.type = 'hidden';
			hiddenField.name = key;
			hiddenField.value = params[key];

			form.appendChild(hiddenField);
		}
	}

	document.body.appendChild(form);
	form.submit();
	form.remove()
}

export const isValidHttpUrl = (string) => {
	let url;
	try {
		url = new URL(string);
	} catch (_) {
		return false;
	}
	return url.protocol === "http:" || url.protocol === "https:";
}

export const getDomainFromUrl = (url) => {
	if (isValidHttpUrl(url)) {
		let domain = (new URL(url));
		let domainName = domain.hostname;
		return domainName
	} else {
		return url
	}
}

export const getMainUrlFromUrl = (url) => {
	if (isValidHttpUrl(url)) {
		let domain = (new URL(url));
		let mainUrl = domain.hostname + domain.pathname
		return mainUrl
	} else {
		return url
	}
}

export const getVideoIdFromUrl = (url) => {
	if (isValidHttpUrl(url)) {
		let domain = (new URL(url));
		let pathname = domain.pathname
		const obj = pathname.split('/')
		return obj[1]
	} else {
		return url
	}
}

export const getItemLabelFromList = (item_list, value) => {
	const v = item_list.find((item) => { return item['value'] === value })
	if (v) {
		return v['text']
	} else {
		return ''
	}
}

export const isoDateToTimezoneDate = (isoDateString) => { //convert iso string to datetime of that timezone
	//var str = moment.parseZone(isoDateString).format('YYYY-MM-DD HH:mm:ss')
	var str = moment.parseZone(isoDateString).format('LLL')
	return str
}
export const isoDateToUtcDate = (isoDateString) => {
	var str = moment.utc(isoDateString).format('YYYY-MM-DD HH:mm:ss')
	return str
}

export const getPlanInfo = (membership) => {
	return false
}

export const ucfirst = (string) => {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

export const strtolower = (string) => {
	return string.toLowerCase();
}

export const strtoupper = (string) => {
	return string.toUpperCase();
}

export const arrayUnderReset = (arr, field_name) => {
	try {
		const obj = {}
		for (let k in arr) {
			const key = arr[k][field_name]
			obj[key] = arr[k]
		}
		return obj
	} catch (e) {
		console.log("arrayUnderReset e:::", e)
	}
}

export const copyObject = (obj) => {
	return JSON.parse(JSON.stringify(obj))
}

export const getTicketAttachmentUrl = (file_path) => {
	if (file_path.includes("http://") || file_path.includes("https://")) {
		return file_path
	}

	// if (BACKEND_LOCATION === "localhost") {
	// }
	const url = `${BASE_UPLOAD_URL}/${file_path}`
	return url
}

export const getPixelInstallMode = (store_info) => {
	let pixel_install_mode = store_info['pixel_install_mode']
	if (pixel_install_mode !== 'auto') {
		pixel_install_mode = "custom"
	}
	return pixel_install_mode
}

export const getCardExpYearMonth = (expiryDateObj) => {
	let exp_year = ""
	let exp_month = ""
	try {
		const year = expiryDateObj.getFullYear()
		const month = 1 + expiryDateObj.getMonth()
		const yearStr = `00${year}`
		const monthStr = `00${month}`
		exp_year = yearStr.slice(-2);
		exp_month = monthStr.slice(-2);
	} catch (e) {

	}
	return { exp_year, exp_month }
}

export const trimSpacesFromString = (str) => {
	const noWhitespace = str.replace(/\s/g, '');
	return noWhitespace
}

export const trim_phone = (num) => {
	num = num.replace(/\+/g, '');
	num = num.replace(/-/g, '');
	num = num.replace(/_/g, '');
	num = num.replace(/\(/g, '');
	num = num.replace(/\)/g, '');
	num = num.replace(' ', '');
	num = num.replace(/ /g, '');
	return num;
}

export const format_phone = (phoneNoInput) => {
	var phoneNo = trim_phone(phoneNoInput)
	const formatNum = phoneNo.substr(0, 3) + '-' + phoneNo.substr(3, 3) + '-' + phoneNo.substr(6, 4);
	return formatNum
}

export const getFileExtension = (fileName) => {
	if (empty(fileName)) {
		return ''
	}
	const fileExt = fileName.split('.').pop().toLowerCase()
	return fileExt
}
