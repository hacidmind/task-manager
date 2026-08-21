import { connectToDatabase, getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
    try {
        await connectToDatabase();
        const db = await getDatabase();
        const tasksCollection = db.collection("tasks");

        if (req.method === "GET") {
            const tasks = await tasksCollection.find({}).toArray();
            const dailyTasks = tasks.filter(t => !t.isStrategic);
            const fy27Tasks = tasks.filter(t => t.isStrategic);
            return res.status(200).json({ dailyTasks, fy27Tasks });
        }

        if (req.method === "POST") {
            const { id, _id, title, category, status, owner, priority, notes, subtasks, isStrategic, quarter } = req.body;

            const doc = {
                title,
                category,
                status,
                owner,
                priority,
                notes,
                subtasks: subtasks || [],
                isStrategic: isStrategic || false,
                quarter: quarter || null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const result = await tasksCollection.insertOne(doc);
            return res.status(201).json({ id: result.insertedId.toString(), message: "Task created successfully" });
        }

        if (req.method === "PUT") {
            const { id, _id: bodyId, title, category, status, owner, priority, notes, subtasks, quarter } = req.body;
            const taskId = id || bodyId;

            if (!taskId) {
                return res.status(400).json({ error: "Task id is required" });
            }

            let filter;
            try {
                filter = { _id: new ObjectId(taskId) };
            } catch {
                return res.status(400).json({ error: "Invalid task id format" });
            }

            const result = await tasksCollection.updateOne(
                filter,
                {
                    $set: {
                        title,
                        category,
                        status,
                        owner,
                        priority,
                        notes,
                        subtasks: subtasks || [],
                        quarter: quarter || null,
                        updatedAt: new Date(),
                    },
                }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({ error: "Task not found" });
            }

            return res.status(200).json({ message: "Task updated successfully" });
        }

        if (req.method === "DELETE") {
            const { id, _id } = req.body;
            const taskId = id || _id;

            if (!taskId) {
                return res.status(400).json({ error: "Task id is required" });
            }

            let filter;
            try {
                filter = { _id: new ObjectId(taskId) };
            } catch {
                return res.status(400).json({ error: "Invalid task id format" });
            }

            const result = await tasksCollection.deleteOne(filter);

            if (result.deletedCount === 0) {
                return res.status(404).json({ error: "Task not found" });
            }

            return res.status(200).json({ message: "Task deleted successfully" });
        }

        res.status(405).json({ error: "Method not allowed" });
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ error: error.message });
    }
}