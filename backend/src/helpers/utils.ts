import moment from 'moment';
import momentZ from 'moment-timezone';
import * as path from 'path'
import { Worker } from 'worker_threads';
import { empty } from './misc';
import { DATE_OPTION } from '../var/config';

/**
 * get moment object from date string (ex: date ISO string)
 */
export const convertMomentObj = (date_string: string) => {
  return moment(date_string)
}

/**
 * get unixtimestamp from iso string
 */
export const getUnixtimestampFromIsoString = (date_string: string) => { //eg: 2023-05-10T06:06:43-04:00
  return moment(date_string).unix()
}

/**
 * get unixtimestamp from time utc string
 */
export const getUnixtimestampFromUtcString = (date_string: string) => { //2023-05-10T06:06:43
  return moment.utc(date_string).unix()
}

/**
 * get unixtimestamp from local date string
 */
export const getUnixtimestampFromLocalString = (date_string: string, iana_timezone: string = "") => {
  if (iana_timezone) {
    return moment.tz(date_string, iana_timezone).unix()
  } else {
    return moment.utc(date_string).unix()
  }
}

/**
 * convert iso date format to human readable date format
 */
export const isoDateToTimezoneDate = (isoDateString) => { //convert iso string to datetime of that timezone //eg:  2023-05-10T06:06:43-04:00
  //var str = moment.parseZone(isoDateString).format('YYYY-MM-DD HH:mm:ss')
  var str = moment.parseZone(isoDateString).format('LLL')
  return str
}

/**
 * convert iso date format to utc format
 */
export const isoDateToUtcDate = (isoDateString) => { // 2023-05-10T06:06:43-04:00
  var str = moment.utc(isoDateString).format('YYYY-MM-DD HH:mm:ss')
  return str
}

export const enumerateBetweenDates = (startMoment, endMoment, step) => { //step: daily, monthly, yearly
  try {
    const startDate = startMoment.clone();
    const endDate = endMoment.clone();
    const dates = [];
    if (step === 'daily') {
      const date = startDate.startOf('day');
      while (date < endDate.endOf('day')) {
        dates.push(date.format('YYYY-MM-DD'));
        date.add(1, 'days');
      }
    }
    else if (step === 'monthly') {
      const date = startDate.startOf('month');
      while (date < endDate.endOf('month')) {
        dates.push(date.format('YYYY-MM'));
        date.add(1, 'months');
      }
    }
    else if (step === 'yearly') {
      const date = startDate.startOf('year');
      while (date < endDate.endOf('year')) {
        dates.push(date.format('YYYY'));
        date.add(1, 'years');
      }
    }
    return dates
  } catch (e) {
    console.log(`enumerateBetweenDates:::`, e)
  }
}

export const getDateOptionWhereQuery = (dateOption, fieldName = '') => {
  let sql = ""
  if (empty(fieldName)) {
    fieldName = `createdAt`
  }
  if (dateOption === DATE_OPTION.today) {
    sql += ` and ${fieldName} >= NOW() - INTERVAL 1 DAY`
  }
  else if (dateOption === DATE_OPTION.last_7) {
    sql += ` and ${fieldName} >= NOW() - INTERVAL 7 DAY`
  }
  else if (dateOption === DATE_OPTION.last_30) {
    sql += ` and ${fieldName} >= NOW() - INTERVAL 30 DAY`
  }
  else if (dateOption === DATE_OPTION.last_90) {
    sql += ` and ${fieldName} >= NOW() - INTERVAL 90 DAY`
  }
  else if (dateOption === DATE_OPTION.ytd) {
    sql += ` and YEAR(${fieldName}) = YEAR(NOW())`
  }
  else if (dateOption === DATE_OPTION.lifetime) {
    //continue
  }
  return sql
}

/**
 * create worker for multi-cpu
 */
export const createWorker = (workerName, workerData) => {
  let workerFilePath = path.join(__dirname, `../workers/${workerName}.js`);
  //console.log(`isMainThread, parentPort, workerName, workerFilePath:::::`, isMainThread, parentPort, workerName, workerFilePath)

  return new Promise(function (resolve, reject) {
    const worker = new Worker(workerFilePath, {
      workerData: { ...workerData },
    });
    worker.on("message", (data) => {
      resolve(data);
    });
    worker.on("error", (msg) => {
      reject(`An error ocurred: ${msg}`);
    });
  });
}
