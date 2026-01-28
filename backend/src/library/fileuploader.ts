
import { AWS_ACCESS_KEY_ID, AWS_REGION, AWS_S3_API_VERSION, AWS_S3_BUCKET, AWS_S3_BUCKET_BASE_URL, AWS_SECRET_ACCESS_KEY, BACKEND_LOCATION, BASE_FRONT_URL, UPLOAD_DIR } from "../var/env.config";
import { console_log, empty } from "../helpers/misc";
import * as AWS from 'aws-sdk';
import * as path from 'path'
import * as fs from 'fs'
import { PutObjectRequest } from "aws-sdk/clients/s3";

export default class FileUploader {
    public files: any;
    public publicStaticDir: string;
    public uploadDir: string;
    constructor(files: any) {
        this.files = files
        if (empty(UPLOAD_DIR)) {
            this.publicStaticDir = path.join(__dirname, '../../src/public')
        } else {
            this.publicStaticDir = UPLOAD_DIR
        }

        this.uploadDir = path.join(this.publicStaticDir, 'uploads')
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }

        //console.log('-------------uploadDir-------------', this.uploadDir)
    }

    public setFile = (files: any) => {
        this.files = files
    }

    /**
     * check if file type is valid
     */
    public isFileValid = (file: any) => {
        const fileExt = file.name.split(".").pop().toLowerCase();
        const type = file.type.split("/").pop();
        const validTypes = ["jpg", "jpeg", "png", "doc", "docx", "pdf"];
        if (validTypes.indexOf(type) === -1 && validTypes.indexOf(fileExt) === -1) {
            console_log(`isFileValid type:::`, type, fileExt)
            return false;
        }
        return true;
    }

    /**
     * get file mime type
     */    
    public getMimeType = (file: any) => {
        try {
            const mime = require('mime');
            const type = file.type.split("/").pop();
            let mimetype = mime.getType(type);
            return mimetype;
        } catch (e) {
            console.log(`getMimeType error:::`, e)
        }
    }

    /**
     * check if file size is valid
     */    
    public isFileSizeValid = (file: any) => {
        const maxUploadSize = 50 * 1024 * 1024
        const size = file.size;
        return size <= maxUploadSize
    }

    /**
     * check if file is in s3 or local server
     */    
    public checkFileTarget = (fileKey: string) => { //fileKey will be url or file key
        try {
            if (fileKey.includes(AWS_S3_BUCKET_BASE_URL)) {
                return 's3'
            } else {
                return 'local'
            }
        } catch (e) {

        }
    }

    /**
     * get file key from url
     */    
    public getFileKey = (fileKey: string) => { //fileKey will be url or file key
        try {
            if (empty(fileKey)) {
                return fileKey
            }

            if (fileKey.includes(AWS_S3_BUCKET_BASE_URL)) {
                let k = fileKey.replace(AWS_S3_BUCKET_BASE_URL, '');
                return k
            } else {
                return fileKey
            }
        } catch (e) {

        }
    }

     /**
     * get file url from file key
     */   
    public getFileUrl = (fileKey: string) => { //fileKey will be url or file key
        try {
            if (empty(fileKey)) {
                return fileKey
            }
            if (fileKey.includes(AWS_S3_BUCKET_BASE_URL)) {
                return fileKey
            } else {
                let upload_url = ""
                if (BACKEND_LOCATION !== 'localhost') {
                    upload_url = BASE_FRONT_URL
                } else {
                    let localIp = BASE_FRONT_URL.replace(':3000/', '')
                    upload_url = localIp + '/000_work/fixfeesplatform/source/backend/src/public/'
                }
                let url = `${upload_url}${fileKey}`
                return url
            }
        } catch (e) {

        }
    }

    /**
     * upload a file to server
     * @target : if local upload to server ifself, else if s3 upload to AWS S3 storage
     */    
    public uploadFile = async (file_upload_key: string, uploadFolder: string = "", target = 'local') => {
        try {
            let files = this.files
            console_log(`files::::::::`, files, file_upload_key)

            // Check if multiple files or a single file
            if (!files[file_upload_key].length) {
                //Single file

                const file = files[file_upload_key];

                // checks if the file is valid
                const isValid = this.isFileValid(file);
                //console.log('-------------------file--------------------',file)
                if (!isValid) {
                    return [false, "Invalid file type"]
                }

                const isValidSize = this.isFileSizeValid(file);
                if (!isValidSize) {
                    return [false, "The attachment is too big! The maximum file size is 5 MB."]
                }

                const fileNameOriginal = file.name;

                // creates a valid name by removing spaces
                const fileName = encodeURIComponent(fileNameOriginal.replace(/\s/g, "-")).toLowerCase();

                // renames the file in the directory
                const newFileName = "file_" + Date.now() + '_' + fileName;
                if (target !== 'local') {
                    // Set the region 
                    AWS.config.update({
                        region: AWS_REGION,
                        accessKeyId: AWS_ACCESS_KEY_ID,
                        secretAccessKey: AWS_SECRET_ACCESS_KEY
                    });

                    // Create S3 service object
                    let s3 = new AWS.S3({ apiVersion: AWS_S3_API_VERSION });

                    let uploadParams = { Bucket: AWS_S3_BUCKET };

                    // Configure the file stream and obtain the upload parameters
                    var fileStream = fs.createReadStream(file.path);
                    fileStream.on('error', function (err) {
                        console.log('File Error:::', err);
                    });
                    uploadParams['Body'] = fileStream;

                    let fileKey = newFileName
                    if (uploadFolder !== "") {
                        fileKey = `${uploadFolder}/${newFileName}`
                    }
                    uploadParams['Key'] = fileKey

                    let mimetype = this.getMimeType(file);
                    if (mimetype) {
                        uploadParams['ContentType'] = mimetype
                    }

                    let upload_params: PutObjectRequest = uploadParams as PutObjectRequest

                    const data = await s3.upload(upload_params).promise();
                    //console.log('upload result data', data)

                    if (!empty(data['Location'])) {
                        return [true, data['Location'], fileNameOriginal]
                    } else {
                        return [false, "Failed to upload file"]
                    }

                } else {
                    let outputDir = this.uploadDir
                    if (uploadFolder !== "") {
                        outputDir = path.join(outputDir, uploadFolder)
                        if (!fs.existsSync(outputDir)) {
                            fs.mkdirSync(outputDir, { recursive: true });
                        }
                    }
                    const outputPath = path.join(outputDir, newFileName)
                    fs.copyFileSync(file.path, outputPath);
                    const filePath = "uploads/" + uploadFolder + "/" + newFileName
                    console_log('-------------outputPath--------------', outputPath)
                    return [true, filePath, fileNameOriginal]
                }
            } else {
                // Multiple files
                return [false, "Failed to upload file!"]
            }
        } catch (e) {
            console.log(`e::::`, e)
            return [false, "Failed to upload file"]
        }
    }

    /**
     * delete a file from server or s3
     */    
    public deleteFile = async (file_key: string) => {
        try {
            if (empty(file_key)) {
                return [false, "empty"]
            }

            let target = this.checkFileTarget(file_key)
            let fileKey = this.getFileKey(file_key)
            if (target !== 'local') {
                // Set the region 
                AWS.config.update({
                    region: AWS_REGION,
                    accessKeyId: AWS_ACCESS_KEY_ID,
                    secretAccessKey: AWS_SECRET_ACCESS_KEY
                });

                // Create S3 service object
                let s3 = new AWS.S3({ apiVersion: AWS_S3_API_VERSION });
                let s3FileKey = fileKey

                const params = {
                    Bucket: AWS_S3_BUCKET,
                    Key: s3FileKey //if any sub folder-> path/of/the/folder.ext
                }
                //await s3.headObject(params).promise()
                await s3.deleteObject(params).promise()
                return [true, "success"]
            }
            else {
                const outputPath = path.join(this.publicStaticDir, fileKey)
                console_log(`deleteFile outputPath:::`, outputPath)
                fs.unlinkSync(outputPath);
                return [true, "success"]
            }
        } catch (e) {
            console.log(`deleteFile error::::`, e)
            return [false, "Failed to delete file"]
        }
    }

}

export const fileUploader = new FileUploader(null)