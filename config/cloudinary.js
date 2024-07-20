const cloudinary = require("cloudinary").v2;

// Cloudinary config
cloudinary.config({
  cloud_name: 'dfubtb083',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY
});

function uploadToCloudinary(image) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(image, (err, result) => {
      if (err) return reject(err);
      return resolve(result);
    })
  });
}

function removeFromCloudinary(public_id) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(public_id, (result) => {
      resolve(result);
    })
  })
}

module.exports = { uploadToCloudinary, removeFromCloudinary };
