import jwt from "jsonwebtoken"; 
import express from 'express'; 
import { authenticateJwt, SECRET, verifyInstructor } from "../middleware/index.js";
import { Admin, Instructor, Lecture, Course } from "../db/index.js"; 
import { z } from "zod"; 
// Admin Instructor Lecture Course 

const router = express.Router(); 



router.get('/lectures', verifyInstructor, async (req, res) => {
    try {
        console.log("reached here");
        const instructorId = req.user.userId; 

        const myLectures = await Lecture.find({ instructor: instructorId })
        .populate('course', 'name level') 
        .sort({ date: 1 }); 

        res.json({ lectures: myLectures });
    } catch (error) {
        console.error("Error fetching schedule:", error);
        res.status(500).json({ message: "Server error fetching schedule" });
    }
});



export default router; 