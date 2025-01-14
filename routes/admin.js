const { Router } = require("express");
const bcrypt = require("bcrypt");
const zod = require("zod");
const jwt = require("jsonwebtoken");
const { adminModel, courseModel } = require("../db");

const adminRouter = Router();

const adminMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};

adminRouter.use(adminMiddleware);


adminRouter.post("/signup", async (req, res) => {
    try {
        const schema = zod.object({
            email: zod.string().email(),
            password: zod.string().min(6),
            name: zod.string().min(1),
        });

        const { email, password, name } = schema.parse(req.body);

        const existingAdmin = await adminModel.findOne({ email });
        if (existingAdmin) return res.status(400).json({ message: "Admin already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        await adminModel.create({
            email,
            password: hashedPassword,
            name,
        });

        res.status(201).json({ message: "Admin signed up successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


adminRouter.post("/signin", async (req, res) => {
    try {
        const schema = zod.object({
            email: zod.string().email(),
            password: zod.string().min(6),
        });

        const { email, password } = schema.parse(req.body);

        const admin = await adminModel.findOne({ email });
        if (!admin) return res.status(404).json({ message: "Admin not found" });

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: admin._id, email: admin.email }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        res.status(200).json({ token });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


adminRouter.post("/course", async (req, res) => {
    try {
        const schema = zod.object({
            title: zod.string().min(1),
            description: zod.string().min(1),
            price: zod.number().positive(),
        });

        const { title, description, price } = schema.parse(req.body);

        const course = new courseModel({
            title,
            description,
            price,
        });

        await course.save();

        res.status(201).json({ message: "Course added successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

adminRouter.put("/course", async (req, res) => {
    try {
        const schema = zod.object({
            courseId: zod.string(),
            title: zod.string().optional(),
            description: zod.string().optional(),
            price: zod.number().positive().optional(),
        });

        const { courseId, title, description, price } = schema.parse(req.body);

        const course = await courseModel.findById(courseId);
        if (!course) return res.status(404).json({ message: "Course not found" });

        if (title) course.title = title;
        if (description) course.description = description;
        if (price) course.price = price;

        await course.save();

        res.status(200).json({ message: "Course updated successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

adminRouter.get("/course/bulk", async (req, res) => {
    try {
        const courses = await courseModel.find();
        res.status(200).json(courses);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = {
    adminRouter: adminRouter,
};
