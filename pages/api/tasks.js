import { connectToDatabase, getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getUser, sameOrigin } from "@/lib/auth";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET" && !sameOrigin(req)) return res.status(403).json({ error: "Invalid request origin" });
  let user;
  try { user = await getUser(req); } catch { return res.status(503).json({ error: "Unable to verify your session. Please try again." }); }
  if (!user) return res.status(401).json({ error: "Please sign in to access your tasks." });
  if (!["GET", "POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    res.setHeader("Allow", "GET, POST, PUT, PATCH, DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (["POST", "PUT"].includes(req.method)) {
    if (typeof req.body?.title !== "string" || !req.body.title.trim()) {
      return res.status(400).json({ error: "A task title is required" });
    }
    if (req.body.subtasks != null && !Array.isArray(req.body.subtasks)) {
      return res.status(400).json({ error: "Action items must be an array" });
    }
    req.body.title = req.body.title.trim();
  }
  if (!process.env.MONGODB_URI) {
    return res.status(503).json({
      error: "Online MongoDB is not configured. Set MONGODB_URI in .env.local and restart the app.",
    });
  }
  try {
    await connectToDatabase();
    const db = await getDatabase();
    const tasksCollection = db.collection("tasks");

    if (req.method === "PATCH") {
      const { id } = req.body || {};
      if (typeof id !== "string" || !ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid task id" });
      const updates = { updatedAt: new Date() };
      if (Object.prototype.hasOwnProperty.call(req.body, "focusDate")) {
        const { focusDate } = req.body;
        if (focusDate !== null && (typeof focusDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(focusDate) || !Number.isFinite(Date.parse(focusDate)) || new Date(focusDate).toISOString().slice(0, 10) !== focusDate)) {
          return res.status(400).json({ error: "A valid focus date is required" });
        }
        updates.focusDate = focusDate;
      } else if (Object.prototype.hasOwnProperty.call(req.body, "manualProgress")) {
        const { manualProgress } = req.body;
        if (!Number.isInteger(manualProgress) || manualProgress < 0 || manualProgress > 100) {
          return res.status(400).json({ error: "Progress must be a whole number from 0 to 100" });
        }
        const existing = await tasksCollection.findOne(
          { _id: new ObjectId(id), userId: user.id },
          { projection: { status: 1 } },
        );
        if (!existing) return res.status(404).json({ error: "Task not found" });
        updates.manualProgress = manualProgress;
        updates.status = manualProgress === 100
          ? "Done"
          : existing.status === "Done" ? "Ongoing" : existing.status;
      } else {
        return res.status(400).json({ error: "A focus date or progress value is required" });
      }
      const result = await tasksCollection.updateOne(
        { _id: new ObjectId(id), userId: user.id },
        { $set: updates },
      );
      if (!result.matchedCount) return res.status(404).json({ error: "Task not found" });
      return res.status(200).json(updates);
    }

    if (req.method === "GET") {
      const tasks = await tasksCollection.find({ userId: user.id }).toArray();
      const dailyTasks = tasks.filter(
        (t) => !t.isStrategic && t.taskType !== "quarterly",
      );
      const fy27Tasks = tasks.filter(
        (t) => t.isStrategic && t.taskType !== "quarterly",
      );
      const quarterlyTasks = tasks.filter((t) => t.taskType === "quarterly");
      return res.status(200).json({ dailyTasks, fy27Tasks, quarterlyTasks });
    }

    if (req.method === "POST") {
      const {
        id,
        _id,
        title,
        category,
        status,
        owner,
        priority,
        notes,
        subtasks,
        isStrategic,
        quarter,
        taskType,
      } = req.body;

      const doc = {
        userId: user.id,
        title,
        category,
        status,
        owner,
        priority,
        notes,
        subtasks: subtasks || [],
        isStrategic: isStrategic || false,
        quarter: quarter || null,
        taskType: taskType || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await tasksCollection.insertOne(doc);
      return res
        .status(201)
        .json({
          id: result.insertedId.toString(),
          message: "Task created successfully",
        });
    }

    if (req.method === "PUT") {
      const {
        id,
        _id: bodyId,
        title,
        category,
        status,
        owner,
        priority,
        notes,
        subtasks,
        quarter,
        taskType,
      } = req.body;
      const taskId = id || bodyId;

      if (!taskId) {
        return res.status(400).json({ error: "Task id is required" });
      }

      let filter;
      try {
        filter = { _id: new ObjectId(taskId), userId: user.id };
      } catch {
        return res.status(400).json({ error: "Invalid task id format" });
      }

      const result = await tasksCollection.updateOne(filter, {
        $set: {
          title,
          category,
          status,
          owner,
          priority,
          notes,
          subtasks: subtasks || [],
          quarter: quarter || null,
          taskType: taskType || null,
          updatedAt: new Date(),
        },
      });

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
        filter = { _id: new ObjectId(taskId), userId: user.id };
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
    res
      .status(500)
      .json({
        error:
          "Unable to reach the database. Please check the connection and try again.",
      });
  }
}
