const express = require('express');
const usersController = require('../controllers/usersController');
const authController = require('../controllers/authController');



const router = express.Router();


router.post('/user-login', authController.login);
router
    .route('/')
    .post(authController.singup)
    .get(authController.protect, usersController.getAllUsers)


// PASSWORD RESTORE

router.post('/password-restore-1', authController.forgottenPassword )
router.post('/password-reset/:token', authController.resetPassword);

// UPDATE PASSWORD
router.use(authController.protect)
router.post('/password-update/:uid', authController.updatePassword)

// GET SELF-RELATED DATA
router.get('/self', usersController.self)

// DELETEUSER
router.patch('/user-delete/:uid', usersController.deleteUser);





module.exports = router;