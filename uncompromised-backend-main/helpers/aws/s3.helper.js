const s3 = require('../../config/awsConfig');
const { queueLogger } = require('../../config/loggerConfig');
/**
 * Helper function to upload files to S3
 * @param {Object} file - The file object from the request (with .buffer and .mimetype).
 * @param {string} filePath - The dynamic path where the file will be stored in the S3 bucket (e.g., 'uploads/image.jpg').
 * @returns {Promise<Object>} - Returns the response data from the S3 upload (including file URL).
 */
const uploadToS3 = async (file, filePath) => {
  try {
    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: filePath,
      Body: file.buffer,
      ContentType: file.mimetype
    };

    // Upload the file to S3
    const data = await s3.upload(uploadParams).promise();
    queueLogger.info(`Uploaded file URL: ${data.Location}`);
    // Return the uploaded file's URL
    return data.Location;
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw new Error('File upload failed');
  }
};

/**
 * Helper function to delete files from S3
 * @param {Object} key - The file object to delete (with .buffer and .mimetype).
 * @returns {Promise<Object>} - Returns the response data from the S3 delete
 */
const deleteFromS3 = async key => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME, // Ensure this environment variable is set with your S3 bucket name
    Key: key // The key (path) of the file you want to delete from S3
  };

  try {
    const data = await s3.deleteObject(params).promise();
    console.log(`File deleted from S3: ${key}`);
    return data;
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    throw new Error('Failed to delete file from S3');
  }
};

module.exports = { uploadToS3, deleteFromS3 };
