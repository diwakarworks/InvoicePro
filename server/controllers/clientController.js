const asyncHandler = require('express-async-handler')
const Client = require('../models/Client');
const logger = require('../utils/logger');

const getClients = asyncHandler(async (req, res) => {
    try {
        const userSub = req.auth?.sub || req.user?.sub;
        console.log('Token sub:', userSub);
        const clients = await Client.find({ 
            $or: [
                { userId: userSub },
                { userId: `${userSub}@clients` }
            ]
        });
        return res.status(200).json(clients);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

const getClientById = asyncHandler(async(req,res)=> {
    try{
        const {id} = req.params;
        const client = await Client.findById(id);
        if(!client){
            return res.status(404).json({message: "Client Id not Found"})
        }
        return res.status(200).json(client)
    }
    catch(error){
        console.error(`Error:${error.message}`)
        return res.status(500).json({message: 'Internal Server Error'});
    }
})

const createClient = asyncHandler(async (req, res) => {
    try {
        const { name, email, phone, company } = req.body
        if (! name || ! email) {
            return res.status(400).json({ messsage: 'Name and Email are required' })
        }

        const userId = req.auth?.sub || req.user?.sub

        const newClient = new Client({
            name,
            email,
            phone,
            company,
            userId: userId,
        })
        logger.client('Client Created Successfully');
        await newClient.save();
        return res.status(200).json({ message: 'Client Created Successfully' })
    }
    catch (error) {
        console.error(`Error: ${error.message}`)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
})

const updateClient = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await Client.findOneAndUpdate(
            { _id: id, userId: req.auth.sub },
            req.body,
            { new: true }
        )
        if (!updated) {
            return res.status(404).json({ message: 'Client Not Found or Not Authorized' })
        }
        return res.status(200).json({message: "updated Successfully",updated})
    }
    catch (error) {
        console.error(`Error: ${error.message}`)
        return res.status(500).json({ message: 'Internal Server Error' })
    }

})

const deleteClient = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params
        const deleted = await Client.findOneAndDelete({ _id: id, userId: req.auth?.sub || req.user?.sub })
        if (!deleted) {
            return res.status(404).json({ message: 'Client not found or unauthorized' });
        }
        return res.status(200).json({ message: 'Client Deleted Successfully' })
    }
    catch (error) {
        console.error(`Error: ${error.message}`)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
})

module.exports= {getClients,getClientById,createClient,updateClient,deleteClient}