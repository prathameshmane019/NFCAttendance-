const express = require('express');
const classController = require('../controllers/classControllers');

const router = express.Router();

router.get('/', classController.getClasses);
router.post('/', classController.addClass);
router.put('/:id', classController.updateClass);
router.delete('/:id', classController.deleteClass);

module.exports = router;