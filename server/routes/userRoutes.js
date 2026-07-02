const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();

router.get('/getUserDetails/:userId', userController.getUserDetails);
router.get("/getAllUsers", userController.getAllUsers);
router.patch("/updateUser/:userId/role", userController.updateUserRole);
router.delete("/deleteUser/:userId", userController.deleteUser);

module.exports = router;
