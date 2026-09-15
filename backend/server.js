const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/User");

const app = express();
const PORT = 5000;


// =========================
// MIDDLEWARE
// =========================

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

        console.log(
            "MongoDB connection error:",
            error.message
        );

    });


// =========================
// TASK MODEL
// =========================

const taskSchema = new mongoose.Schema({

    text: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },

    completed: {
        type: Boolean,
        default: false
    },

    priority: {
        type: String,
        enum: ["Low", "Medium", "High"],
        default: "Medium"
    },

    category: {
        type: String,
        enum: [
            "General",
            "Work",
            "Study",
            "Personal",
            "Other"
        ],
        default: "General"
    },

    dueDate: {
        type: Date,
        default: null
    },

    status: {
        type: String,
        enum: [
            "Pending",
            "In Progress",
            "Completed"
        ],
        default: "Pending"
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }

});

const Task =
    mongoose.model("Task", taskSchema);


// =========================
// JWT AUTHENTICATION
// =========================

function authenticateToken(req, res, next) {

    const authHeader =
        req.headers["authorization"];

    const token =
        authHeader &&
        authHeader.split(" ")[1];


    if (!token) {

        return res.status(401).json({
            message:
                "Access denied. Please login."
        });

    }


    jwt.verify(
        token,
        process.env.JWT_SECRET,
        function (error, user) {

            if (error) {

                return res.status(403).json({
                    message:
                        "Invalid or expired token."
                });

            }


            req.user = user;

            next();

        }
    );

}


// =========================
// GET ALL USER TASKS
// =========================

app.get(
    "/api/tasks",
    authenticateToken,
    async function (req, res) {

        try {

            const tasks =
                await Task.find({

                    userId:
                        req.user.userId

                });


            res.json(tasks);


        } catch (error) {

            console.error(
                "Get tasks error:",
                error
            );

            res.status(500).json({
                message:
                    "Error getting tasks"
            });

        }

    }
);


// =========================
// CREATE TASK
// =========================

app.post(
    "/api/tasks",
    authenticateToken,
    async function (req, res) {

        try {

            const {
                text,
                priority,
                category,
                dueDate,
                status
            } = req.body;


            // =========================
            // TASK TEXT
            // =========================

            if (!text) {

                return res.status(400).json({
                    message:
                        "Task text is required"
                });

            }


            const cleanTaskText =
                text.trim();


            if (cleanTaskText === "") {

                return res.status(400).json({
                    message:
                        "Task cannot be empty"
                });

            }


            if (cleanTaskText.length > 200) {

                return res.status(400).json({
                    message:
                        "Task cannot be more than 200 characters"
                });

            }


            // =========================
            // PRIORITY
            // =========================

            const validPriorities = [
                "Low",
                "Medium",
                "High"
            ];


            const selectedPriority =
                priority || "Medium";


            if (
                !validPriorities.includes(
                    selectedPriority
                )
            ) {

                return res.status(400).json({
                    message:
                        "Invalid priority"
                });

            }


            // =========================
            // CATEGORY
            // =========================

            const validCategories = [
                "General",
                "Work",
                "Study",
                "Personal",
                "Other"
            ];


            const selectedCategory =
                category || "General";


            if (
                !validCategories.includes(
                    selectedCategory
                )
            ) {

                return res.status(400).json({
                    message:
                        "Invalid category"
                });

            }


            // =========================
            // STATUS
            // =========================

            const validStatuses = [
                "Pending",
                "In Progress",
                "Completed"
            ];


            const selectedStatus =
                status || "Pending";


            if (
                !validStatuses.includes(
                    selectedStatus
                )
            ) {

                return res.status(400).json({
                    message:
                        "Invalid status"
                });

            }


            // =========================
            // DUE DATE
            // =========================

            let selectedDueDate = null;


            if (dueDate) {

                const parsedDate =
                    new Date(dueDate);


                if (
                    isNaN(
                        parsedDate.getTime()
                    )
                ) {

                    return res.status(400).json({
                        message:
                            "Invalid due date"
                    });

                }


                selectedDueDate =
                    parsedDate;

            }


            // =========================
            // COMPLETED VALUE
            // =========================

            const isCompleted =
                selectedStatus === "Completed";


            // =========================
            // CREATE TASK
            // =========================

            const newTask =
                new Task({

                    text:
                        cleanTaskText,

                    completed:
                        isCompleted,

                    priority:
                        selectedPriority,

                    category:
                        selectedCategory,

                    dueDate:
                        selectedDueDate,

                    status:
                        selectedStatus,

                    userId:
                        req.user.userId

                });


            const savedTask =
                await newTask.save();


            res.status(201).json(
                savedTask
            );


        } catch (error) {

            console.error(
                "Create task error:",
                error
            );

            res.status(500).json({
                message:
                    "Error creating task"
            });

        }

    }
);


// =========================
// UPDATE TASK
// =========================

app.put(
    "/api/tasks/:id",
    authenticateToken,
    async function (req, res) {

        try {

            const taskId =
                req.params.id;


            // =========================
            // CHECK TASK ID
            // =========================

            if (
                !mongoose.Types.ObjectId.isValid(
                    taskId
                )
            ) {

                return res.status(400).json({
                    message:
                        "Invalid task ID"
                });

            }


            // =========================
            // TEXT VALIDATION
            // =========================

            if (
                req.body.text !== undefined
            ) {

                if (
                    !req.body.text ||
                    req.body.text.trim() === ""
                ) {

                    return res.status(400).json({
                        message:
                            "Task cannot be empty"
                    });

                }


                if (
                    req.body.text.trim().length > 200
                ) {

                    return res.status(400).json({
                        message:
                            "Task cannot be more than 200 characters"
                    });

                }

            }


            // =========================
            // PRIORITY VALIDATION
            // =========================

            if (
                req.body.priority !== undefined
            ) {

                const validPriorities = [
                    "Low",
                    "Medium",
                    "High"
                ];


                if (
                    !validPriorities.includes(
                        req.body.priority
                    )
                ) {

                    return res.status(400).json({
                        message:
                            "Invalid priority"
                    });

                }

            }


            // =========================
            // CATEGORY VALIDATION
            // =========================

            if (
                req.body.category !== undefined
            ) {

                const validCategories = [
                    "General",
                    "Work",
                    "Study",
                    "Personal",
                    "Other"
                ];


                if (
                    !validCategories.includes(
                        req.body.category
                    )
                ) {

                    return res.status(400).json({
                        message:
                            "Invalid category"
                    });

                }

            }


            // =========================
            // STATUS VALIDATION
            // =========================

            if (
                req.body.status !== undefined
            ) {

                const validStatuses = [
                    "Pending",
                    "In Progress",
                    "Completed"
                ];


                if (
                    !validStatuses.includes(
                        req.body.status
                    )
                ) {

                    return res.status(400).json({
                        message:
                            "Invalid status"
                    });

                }

            }


            // =========================
            // DUE DATE VALIDATION
            // =========================

            if (
                req.body.dueDate !== undefined &&
                req.body.dueDate !== null &&
                req.body.dueDate !== ""
            ) {

                const parsedDate =
                    new Date(
                        req.body.dueDate
                    );


                if (
                    isNaN(
                        parsedDate.getTime()
                    )
                ) {

                    return res.status(400).json({
                        message:
                            "Invalid due date"
                    });

                }

            }


            // =========================
            // UPDATE DATA
            // =========================

            const updateData = {};


            if (
                req.body.text !== undefined
            ) {

                updateData.text =
                    req.body.text.trim();

            }


            if (
                req.body.priority !== undefined
            ) {

                updateData.priority =
                    req.body.priority;

            }


            if (
                req.body.category !== undefined
            ) {

                updateData.category =
                    req.body.category;

            }


            if (
                req.body.dueDate !== undefined
            ) {

                if (
                    req.body.dueDate === "" ||
                    req.body.dueDate === null
                ) {

                    updateData.dueDate =
                        null;

                } else {

                    updateData.dueDate =
                        new Date(
                            req.body.dueDate
                        );

                }

            }


            // =========================
            // STATUS / COMPLETED
            // =========================

            if (
                req.body.status !== undefined
            ) {

                updateData.status =
                    req.body.status;


                updateData.completed =
                    req.body.status === "Completed";

            }


            if (
                req.body.completed !== undefined
            ) {

                updateData.completed =
                    req.body.completed;


                if (
                    req.body.completed === true
                ) {

                    updateData.status =
                        "Completed";

                } else {

                    updateData.status =
                        "Pending";

                }

            }


            // =========================
            // UPDATE TASK
            // =========================

            const updatedTask =
                await Task.findOneAndUpdate(

                    {
                        _id:
                            taskId,

                        userId:
                            req.user.userId
                    },

                    updateData,

                    {
                        returnDocument:
                            "after"
                    }

                );


            if (!updatedTask) {

                return res.status(404).json({
                    message:
                        "Task not found"
                });

            }


            res.json(
                updatedTask
            );


        } catch (error) {

            console.error(
                "Update task error:",
                error
            );

            res.status(500).json({
                message:
                    "Error updating task"
            });

        }

    }
);


// =========================
// DELETE TASK
// =========================

app.delete(
    "/api/tasks/:id",
    authenticateToken,
    async function (req, res) {

        try {

            const taskId =
                req.params.id;


            if (
                !mongoose.Types.ObjectId.isValid(
                    taskId
                )
            ) {

                return res.status(400).json({
                    message:
                        "Invalid task ID"
                });

            }


            const deletedTask =
                await Task.findOneAndDelete({

                    _id:
                        taskId,

                    userId:
                        req.user.userId

                });


            if (!deletedTask) {

                return res.status(404).json({
                    message:
                        "Task not found"
                });

            }


            res.json({
                message:
                    "Task deleted successfully"
            });


        } catch (error) {

            console.error(
                "Delete task error:",
                error
            );

            res.status(500).json({
                message:
                    "Error deleting task"
            });

        }

    }
);


// =========================
// USER REGISTER
// =========================

app.post(
    "/api/register",
    async function (req, res) {

        try {

            const {
                name,
                email,
                password
            } = req.body;


            if (
                !name ||
                !email ||
                !password
            ) {

                return res.status(400).json({
                    message:
                        "Name, email and password are required"
                });

            }


            const cleanName =
                name.trim();

            const cleanEmail =
                email.trim().toLowerCase();

            const cleanPassword =
                password.trim();


            if (cleanName.length < 2) {

                return res.status(400).json({
                    message:
                        "Name must be at least 2 characters"
                });

            }


            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (
                !emailPattern.test(cleanEmail)
            ) {

                return res.status(400).json({
                    message:
                        "Please enter a valid email address"
                });

            }


            if (cleanPassword.length < 6) {

                return res.status(400).json({
                    message:
                        "Password must be at least 6 characters"
                });

            }


            const existingUser =
                await User.findOne({

                    email:
                        cleanEmail

                });


            if (existingUser) {

                return res.status(400).json({
                    message:
                        "User already exists"
                });

            }


            const hashedPassword =
                await bcrypt.hash(
                    cleanPassword,
                    10
                );


            const newUser =
                new User({

                    name:
                        cleanName,

                    email:
                        cleanEmail,

                    password:
                        hashedPassword

                });


            const savedUser =
                await newUser.save();


            res.status(201).json({

                message:
                    "User registered successfully",

                user: {

                    id:
                        savedUser._id,

                    name:
                        savedUser.name,

                    email:
                        savedUser.email

                }

            });


        } catch (error) {

            console.error(
                "Register error:",
                error
            );

            res.status(500).json({
                message:
                    "Error registering user"
            });

        }

    }
);


// =========================
// USER LOGIN
// =========================

app.post(
    "/api/login",
    async function (req, res) {

        try {

            const {
                email,
                password
            } = req.body;


            if (
                !email ||
                !password
            ) {

                return res.status(400).json({
                    message:
                        "Email and password are required"
                });

            }


            const cleanEmail =
                email.trim().toLowerCase();

            const cleanPassword =
                password.trim();


            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (
                !emailPattern.test(cleanEmail)
            ) {

                return res.status(400).json({
                    message:
                        "Please enter a valid email address"
                });

            }


            if (cleanPassword.length < 6) {

                return res.status(400).json({
                    message:
                        "Password must be at least 6 characters"
                });

            }


            const user =
                await User.findOne({

                    email:
                        cleanEmail

                });


            if (!user) {

                return res.status(401).json({
                    message:
                        "Invalid email or password"
                });

            }


            const passwordMatch =
                await bcrypt.compare(
                    cleanPassword,
                    user.password
                );


            if (!passwordMatch) {

                return res.status(401).json({
                    message:
                        "Invalid email or password"
                });

            }


            const token =
                jwt.sign(

                    {
                        userId:
                            user._id
                    },

                    process.env.JWT_SECRET,

                    {
                        expiresIn:
                            "1d"
                    }

                );


            res.json({

                message:
                    "Login successful",

                token:
                    token,

                user: {

                    id:
                        user._id,

                    name:
                        user.name,

                    email:
                        user.email

                }

            });


        } catch (error) {

            console.error(
                "Login error:",
                error
            );

            res.status(500).json({
                message:
                    "Error logging in"
            });

        }

    }
);


// =========================
// TEST SERVER
// =========================

app.get(
    "/",
    function (req, res) {

        res.send(
            "Task Manager Backend is Running!"
        );

    }
);


// =========================
// START SERVER
// =========================

app.listen(
    PORT,
    function () {

        console.log(
            `Server is running at http://localhost:${PORT}`
        );

    }
);