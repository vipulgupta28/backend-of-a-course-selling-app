import express from "express";
import mongoose from "mongoose";
require ('dotenv').config();
const {userRouter} = require("./routes/user");
const {courseRouter} = require("./routes/course");
const {adminRouter} = require("./routes/admin");

const app = express();

app.use("/api/v1/user", userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/course", courseRouter);

async function main() {
    await mongoose.connect(process.env.CONNECTION_STRING,{
        useNewurlParser: true,
        useUnifiedTopology: true,
    });
    app.listen(3000);

    console.log("Listening");
}

main();




