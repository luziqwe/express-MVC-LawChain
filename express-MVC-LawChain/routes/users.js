const express = require('express');
const router = express.Router();
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();
const userController = require('../Controllers/v_1/userController');

/* GET users listing. */
router.get('/SetMySQL', function(req, res, next) {
  userController.SetMySQL(req,res,next)
});

router.post('/user.ImageUpload', multipartMiddleware, (req, res, next) => {
    userController.ImageUpload(req, res, next);
});


module.exports = router;
