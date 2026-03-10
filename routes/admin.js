import jwt from "jsonwebtoken"; 
import express from 'express'; 
import { authenticateJwt, SECRET, verifyAdmin, verifyInstructor } from "../middleware/index.js";
import { Admin, Instructor, Lecture, Course } from "../db/index.js"; 
import { z } from "zod"; 
// Admin Instructor Lecture Course 

const router = express.Router(); 


router.post('/createCourse', verifyAdmin, async (req, res) => {
    const { name, level, description, image } = req.body; 
    const userId = req.headers["userId"]; 

    const newCourse = new Course({ name: name, level: level, description: description, image: image }); 
    await newCourse.save()
        .then((savedCourse) => {
            console.log("course created");
            res.status(201).json({courses: savedCourse}); 
        })
        .catch((err) => { 
            res.status(500).json({ error: 'Failed to create a new Course' }); 
        }); 
}); 


router.get('/courses', verifyAdmin, async (req, res) => {
    
    try{ 
      const courses = await Course.find({ }); 
      res.json({ courses }); 
    } catch(error){ 
      res.status(500).json({ message: "Could not fetch courses" });
    }

}); 


router.get('/courses/:courseId', verifyAdmin, async (req, res) => {

    try { 

      const { courseId } = req.params; 

      const course = await Course.findById(courseId) 
      .populate({
          path: 'batches', 
          populate: {
            path: 'instructor', 
            select: 'name email' 
          }
      });

      res.json(course);

    } catch(error){ 
      console.log("no course");
      res.status(404).json({ message: 'Failed to retrieve Lectures' });
    }    

});



// add batch
router.post('/courses/:courseId/batches', verifyAdmin, async (req, res) => {
  try {
    console.log("Entered batches");
    const { courseId } = req.params;
    const { instructorId, date, lectureNumber } = req.body;

    // Optional but good safety check
    if (!instructorId || !date) {
      console.log("no date or instID"); 
        return res.status(400).json({ message: "Instructor and Date are required." });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      console.log("no course");
      return res.status(404).json({ message: 'Course not found.' });
    }

    // Build Lecture
    const newLecture = new Lecture({
      course: courseId,
      instructor: instructorId,
      date: new Date(date), 
      lectureNumber: lectureNumber || 1 
    });

    const savedLecture = await newLecture.save();

    await Course.findByIdAndUpdate(
      courseId, 
      { $push: { batches: savedLecture._id } }
    );

    // 🔥 Populate the instructor details so React doesn't crash
    const populatedLecture = await Lecture.findById(savedLecture._id).populate(
        'instructor', 
        'name email'
    );

    res.status(201).json({
      message: 'Lecture scheduled successfully!',
      batch: populatedLecture // Sending the fully populated object!
    });

  } catch (error) {

    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Clash Detected: This instructor is already assigned to a lecture on this exact date. Please select a different date or instructor.' 
      });
    }

    console.error("Error creating batch:", error);
    res.status(500).json({ message: 'Server error while scheduling lecture.' });
  }
});



// delete batch 
router.delete('/lectures/:lectureId', verifyAdmin, async (req, res) => {
    try {
        const { lectureId } = req.params;

        const deletedLecture = await Lecture.findByIdAndDelete(lectureId);

        if (!deletedLecture) {
            return res.status(404).json({ message: "Lecture not found" });
        }

        await Course.updateOne(
            { batches: lectureId }, 
            { $pull: { batches: lectureId } } 
        );

        res.json({ message: "Lecture deleted successfully" });

    } catch (error) {
        console.error("Error deleting lecture:", error);
        res.status(500).json({ message: "Server error while deleting lecture" });
    }
});


router.get('/instructors', verifyAdmin, async (req, res) => {
    try {
        const instructors = await Instructor.find({}).select('name email _id');
        res.json(instructors);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch instructors" });
    }
});



export default router; 


