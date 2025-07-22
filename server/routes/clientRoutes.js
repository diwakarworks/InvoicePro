const express = require('express');
const {getClients, getClientById, createClient, updateClient, deleteClient} = require('../controllers/clientController');
const auth = require('../middleware/authmiddleware');
const router = express.Router();
router.use(auth);
router.get('/', getClients);
router.get('/:id',getClientById);
router.post('/', createClient);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);

module.exports = router;