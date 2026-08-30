const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = 5000;


// Middleware
app.use(cors());
app.use(express.json());


// =========================
// MONGODB CONNECTION
// =========================

mongoose.connect(process.env.MONGODB_URI)
    .then(function () {
        console.log("MongoDB connected successfully!");
    })
    .catch(function (error) {
        console.log("MongoDB connection error:", error.message);
    });


// =========================
// TASK MODEL
// =========================

const taskSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },

    completed: {
        type: Boolean,
        default: false
    }
});

const Task = mongoose.model("Task", taskSchema);


// =========================
// GET ALL TASKS
// =========================

app.get("/api/tasks", async function (req, res) {

    try {

        const tasks = await Task.find();

        res.json(tasks);

    } catch (error) {

        res.status(500).json({
            message: "Error getting tasks"
        });

    }

});


// =========================
// CREATE TASK
// =========================

app.post("/api/tasks", async function (req, res) {

    try {

        const taskText = req.body.text;

        if (!taskText || taskText.trim() === "") {

            return res.status(400).json({
                message: "Task text is required"
            });

        }

        const newTask = new Task({
            text: taskText.trim()
        });

        const savedTask = await newTask.save();

        res.status(201).json(savedTask);

    } catch (error) {

        res.status(500).json({
            message: "Error creating task"
        });

    }

});


// =========================
// UPDATE TASK
// =========================

app.put("/api/tasks/:id", async function (req, res) {

    try {

        const taskId = req.params.id;

        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            {
                text: req.body.text,
                completed: req.body.completed
            },
            {
                new: true
            }
        );

        if (!updatedTask) {

            return res.status(404).json({
                message: "Task not found"
            });

        }

        res.json(updatedTask);

    } catch (error) {

        res.status(500).json({
            message: "Error updating task"
        });

    }

});


// =========================
// DELETE TASK
// =========================

app.delete("/api/tasks/:id", async function (req, res) {

    try {

        const taskId = req.params.id;

        const deletedTask = await Task.findByIdAndDelete(taskId);

        if (!deletedTask) {

            return res.status(404).json({
                message: "Task not found"
            });

        }

        res.json({
            message: "Task deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: "Error deleting task"
        });

    }

});


// =========================
// TEST SERVER
// =========================

app.get("/", function (req, res) {

    res.send("Task Manager Backend is Running!");

});


// =========================
// START SERVER
// =========================

app.listen(PORT, function () {

    console.log(`Server is running at http://localhost:${PORT}`);

});