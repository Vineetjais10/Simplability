const multer = require('multer');
const path = require('path');
const { StatusCodes } = require('http-status-codes');

const memoryStorage = multer.memoryStorage();

// multer upload for csv files.
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = ['.csv', '.xls', '.xlsx'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedFileTypes.includes(ext)) {
    cb(null, true);
  } else {
    const error = new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'file');
    error.message = 'Only .csv, .xlsx and .xls files are allowed!';
    cb(error, false);
  }
};

const upload = multer({ storage: memoryStorage, fileFilter: fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

/**
 * Image upload handler
 */
// File filter function to allow only jpg, jpeg, and png
const imageFileFilter = (req, file, cb) => {
  const allowedFileTypes = ['.jpg', '.jpeg', '.png'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedFileTypes.includes(ext)) {
    cb(null, true);
  } else {
    const error = new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'image');
    error.message = 'Invalid file type. Please upload a file in .jpg, .jpeg, or .png format.';
    cb(error, false);
  }
};

const uploadImage = multer({
  storage: memoryStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // Limit file size to 2MB
});

const proofMediaFileFilter = (req, file, cb) => {
  const imageTypes = ['.jpg'];
  const videoTypes = ['.mp4', '.mov']; // Supporting .mov for videos and .jpg for images
  const ext = path.extname(file.originalname).toLowerCase();

  if (imageTypes.includes(ext) || videoTypes.includes(ext)) {
    req.isImage = imageTypes.includes(ext);
    cb(null, true);
  } else {
    const error = new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'proof_media');
    error.message = 'Invalid media format. Please upload a .jpg or .mov or .mp4 file .';
    cb(error, false);
  }
};

const uploadProofMedia = (req, res, next) => {
  const uploadMediaLimits = {
    image: 10 * 1024 * 1024, // 10 MB
    video: 100 * 1024 * 1024 // 100 MB
  };
  const maxSize = uploadMediaLimits[req.file?.isImage ? 'image' : 'video'];

  const upload = multer({
    storage: memoryStorage,
    limits: { fileSize: maxSize },
    fileFilter: proofMediaFileFilter
  }).single('proof_media');

  upload(req, res, error => {
    if (error) {
      return handleMulterError(error, req, res, next);
    }
    next();
  });
};

// handle multer errors
const handleMulterError = function (error, req, res, next) {
  if (error instanceof multer.MulterError) {
    const { field, code, message } = error;

    const errorMessages = {
      image: {
        LIMIT_FILE_SIZE: 'The image size should be 2MB or less',
        LIMIT_UNEXPECTED_FILE: message || 'Invalid file type!'
      },
      file: {
        LIMIT_FILE_SIZE: message,
        LIMIT_UNEXPECTED_FILE: message
      },
      proof_media: {
        LIMIT_FILE_SIZE: req.file?.isImage ? 'The image size should be 10MB or less.' : 'The video size should be 100MB or less.',
        LIMIT_UNEXPECTED_FILE: message || 'Invalid media type!'
      }
    };

    if (errorMessages[field][code]) {
      let details;

      if (field === 'image') {
        details = [{ field: 'image', message: errorMessages[field][code] }];
      } else if (field === 'proof_media') {
        details = [{ field: 'proof_media', message: errorMessages[field][code] }];
      } else {
        details = undefined;
      }

      return res.error(details ? { details } : errorMessages[field][code], '', StatusCodes.UNPROCESSABLE_ENTITY);
    }
  }
  next(error);
};

module.exports = {
  upload,
  uploadImage,
  handleMulterError,
  uploadProofMedia
};
