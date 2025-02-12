const Message = require("../models/messageModel");

const router = require("express").Router();

// new Conversation
router.post('/', async(req,res)=>{
    
    const newMessage = new Message(req.body);

    try {
        const savedMessage = await newMessage.save();
        res.status(200).json(savedMessage);
    } catch (error) {
        res.status(500).json(error);
    }
})



//get conversation of a user
router.post('/:conversationId', async (req,res)=>{
    try {
        const messages = await Message.find({conversationId: req.params.conversationId})
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json(error);
    }

})



module.exports = router;