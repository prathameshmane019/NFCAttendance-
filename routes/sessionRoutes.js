const express = require('express');
const sessionController = require('../controllers/sessionControllers');

const router = express.Router();

router.get('/', sessionController.getSessions);
router.post('/', sessionController.addSession);
router.put('/:id', sessionController.updateSession);
router.delete('/:id', sessionController.deleteSession);

module.exports = router;