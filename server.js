const dotenv = require("dotenv").config();
const express = require("express");
const mongoose =require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const userRoute = require("./routes/userRoute");
const productRoute = require("./routes/productRoute");
const conversationRoute = require("./routes/conversationRoute");
const messageRoute = require("./routes/messageRoute");
const friendRequestsRoute = require("./routes/friendRequestsRoute");
const errorHandler = require("./middleware/errorMiddlerware");

const app = express();

// MiddleWare
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: false}));
app.use(
    cors({
    origin: ["https://chat-web-frontend-rho.vercel.app", "http://localhost:3000"],
    credentials: true,
}));

const PORT = process.env.PORT || 5000;

//  Routes
app.get("/",(req,res)=>{
    res.send("home page....")
})
// User Routes
app.use("/api/users", userRoute)
app.use("/api/products", productRoute)
app.use("/api/conversations", conversationRoute)
app.use("/api/messages", messageRoute)
app.use("/api/friends", friendRequestsRoute)

//Error Middleware
app.use(errorHandler);

mongoose
.connect(process.env.MONGO_URI)
.then(()=>{
    app.listen(PORT, ()=>{
        console.log(`server running on port ${PORT}`)
    })
})
.catch((err)=> console.log(err))