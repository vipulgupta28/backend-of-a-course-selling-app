const { Router } = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const zod = require('zod');
const { userModel, purchaseModel } = require('../db'); 

const userRouter = Router();


userRouter.post("/signup", async function (req, res) {
    try {
        const schema = zod.object({
            email: zod.string().email(),
            password: zod.string().min(6),
            firstName: zod.string().min(1),
            lastName: zod.string().min(1),
        });

        const { email, password, firstName, lastName } = schema.parse(req.body);

        const hashedPassword = await bcrypt.hash(password, 10);

        await userModel.create({
            email,
            password: hashedPassword,
            firstName,
            lastName,
        });

        res.status(201).json({ message: "User signed up successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

userRouter.post("/login", async (req, res) => {
    try {
        const schema = zod.object({
            email: zod.string().email(),
            password: zod.string().min(6),
        });

        const { email, password } = schema.parse(req.body);

        const user = await userModel.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        res.status(200).json({ token });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


userRouter.post("/purchases", async (req, res) => {
    try {
        const schema = zod.object({
            userId: zod.string(),
            items: zod.array(zod.object({
                productId: zod.string(),
                quantity: zod.number().min(1),
            })),
        });

        const { userId, items } = schema.parse(req.body);

        const purchase = new purchaseModel({
            userId,
            items,
        });

        await purchase.save();

        res.status(201).json({ message: "Purchase recorded successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = {
    userRouter: userRouter
};
