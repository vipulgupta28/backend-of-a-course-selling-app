const { Router } = require("express");
const zod = require("zod");
const { courseModel, purchaseModel } = require("../db");

const courseRouter = Router();

courseRouter.post("/preview", async (req, res) => {
    try {
        const schema = zod.object({
            courseId: zod.string(),
        });

        const { courseId } = schema.parse(req.body);

        const course = await courseModel.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        res.status(200).json({
            title: course.title,
            description: course.description,
            price: course.price,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


courseRouter.post("/purchase", async (req, res) => {
    try {
        const schema = zod.object({
            userId: zod.string(),
            courseId: zod.string(),
        });

        const { userId, courseId } = schema.parse(req.body);

        const course = await courseModel.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        await purchaseModel.create({
            userId,
            courseId,
            purchasedAt: new Date(),
        });

        res.status(201).json({ message: "Course purchased successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = {
    courseRouter: courseRouter,
};
