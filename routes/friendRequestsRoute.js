const express = require("express");
const router = express.Router();
const FriendRequest = require("../models/friendRequestModal");
const User = require("../models/userModel");
const Conversation = require("../models/ConversationModel");







router.post("/sendRequest", async (req, res) => {
  const { senderId, receiverId } = req.body;
  // console.log(senderId);
  try {
    // Prevent sending a request to self
    if (senderId === receiverId) {
      return res.status(400).json("You cannot send a request to yourself.");
    }

    // Check if the request already exists
    const existingRequest = await FriendRequest.findOne({
      senderId,
      receiverId,
    });
    if (existingRequest) {
      return res.status(400).json("Request already sent.");
    }

    // Create new request
    const newRequest = new FriendRequest({ senderId, receiverId });
    await newRequest.save();

    return res.status(201).json(newRequest);
  } catch (err) {
    console.error(err);
    return res.status(500).json("Error sending friend request.");
  }
});







router.delete("/cancelRequest/:senderId/:receiverId", async (req, res) => {
  const { senderId, receiverId } = req.params;
  // console.log(senderId, receiverId);
  try {

    // Check if the request exists or not
    const existingRequest = await FriendRequest.findOne({senderId, receiverId});

    if (!existingRequest) {
      return res.status(400).json("No Request sent.");
    }

    // cancel request
    await FriendRequest.findOneAndDelete({ senderId, receiverId });

    return res.status(201).send({message:"successfully cancel request"});
  } catch (err) {
    console.error(err);
    return res.status(500).json("Error cancel friend request.");
  }
});











router.post("/acceptRequest", async (req, res) => {
  const { requestId } = req.body;

  try {
    const request = await FriendRequest.findById(requestId);

    if (!request) {
      return res.status(404).json("Request not found.");
    }

    if (request.status !== "pending") {
      return res.status(400).json("This request is not pending.");
    }

    // Update the status to "accepted"
    request.status = "accepted";
    await request.save();

    // Add sender and receiver to each other's friend lists
    await User.findByIdAndUpdate(request.senderId, {
      $push: { friends: request.receiverId },
    });

    await User.findByIdAndUpdate(request.receiverId, {
      $push: { friends: request.senderId },
    });

    

    // both can chat now
    const newConversation = new Conversation({
      members: [request.senderId.toString(), request.receiverId.toString()],
    });

    await newConversation.save();

    return res.json("Friend request accepted.");
  } catch (err) {
    console.error(err);
    return res.status(500).json("Error accepting friend request.");
  }
});









router.delete("/unfriends/:userId/:friendId", async (req, res) => {
  const { userId, friendId } = req.params;

  // console.log(userId,friendId);

  try {
    await User.findByIdAndUpdate(userId, { $pull: { friends: friendId } });
    await User.findByIdAndUpdate(friendId, { $pull: { friends: userId } });

    // Delete the friend request with status "Accepted"
    await FriendRequest.findOneAndDelete({
      $or: [
        { senderId: userId, receiverId: friendId, status: "accepted" },
        { senderId: friendId, receiverId: userId, status: "accepted" },
      ],
    });
    
    
    
    // Delete the friend request with status "Accepted"
    await Conversation.findOneAndDelete({
      $or:[
        {members: [userId, friendId]},
        {members: [friendId,userId]}
      ]
        
    });

  
    res.status(200).json({ message: "Friend removed successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error removing friend" });
  }
});








router.post("/rejectRequest", async (req, res) => {
  const { requestId } = req.body;

  try {
    const request = await FriendRequest.findById(requestId);

    if (!request) {
      return res.status(404).json("Request not found.");
    }

    // Delete the request if it's rejected
    await request.deleteOne();

    return res.send({message: "Friend request rejected."});
  } catch (err) {
    console.error(err);
    return res.status(500).json("Error rejecting friend request.");
  }
});











router.get("/requests/:userId", async (req, res) => {
  try {
    const requests = await FriendRequest.find({
      receiverId: req.params.userId,
      status: "pending",
    }).populate("senderId", "name email photo");

    return res.json(requests);
  } catch (err) {
    console.error(err);
    return res.status(500).json("Error fetching friend requests.");
  }
});






router.get("/sentRequests/:senderId", async (req, res) => {
  try {
    const sentRequests = await FriendRequest.find({
      senderId: req.params.senderId,
      status: "pending",
    });

    return res.json(sentRequests);
  } catch (err) {
    console.error(err);
    return res.status(500).json("Error fetching friend requests.");
  }
});











router.get("/friends/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate(
      "friends",
      "name email photo"
    );

    if (!user) {
      return res.status(404).json("User not found.");
    }

    return res.json(user.friends); // Returning populated friend details
  } catch (err) {
    console.error(err);
    return res.status(500).json("Error fetching friends list.");
  }
});

module.exports = router;
