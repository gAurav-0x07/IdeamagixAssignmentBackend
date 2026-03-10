import jwt from "jsonwebtoken"; 
import express from 'express'; 
import bcrypt from "bcryptjs"
import { SECRET, verifyAdmin, verifyInstructor } from "../middleware/index.js";
import { Admin, Instructor, Lecture, Course } from "../db/index.js"; 
import { z } from "zod"; 
// import { signupInput } from "../signupZod/index"; 
// Admin Instructor Lecture Course 

const signupInput = z.object({ 
    username: z.string().min(2), 
    email: z.string(), 
    password: z.string().min(2)
}); 

const signinInput = z.object({ 
    email: z.string(), 
    password: z.string().min(2)
}); 

const router = express.Router(); 



// Admin 

router.post('/adminSignup', async (req, res) => {

    try {

        console.log("in Admin");

        const parsedInput = signupInput.safeParse(req.body); 

    if(!parsedInput.success) {
        console.log("input prob");
        res.json({ 
            message: 'Invalid input'
        }); 
        return; 
    }

    const username = parsedInput.data.username; 
    const email = parsedInput.data.email; 
    const password = parsedInput.data.password; 

    // const { name, level, description, image } = req.body; 

    const admin = await Admin.findOne({ email: email });

    if(admin && password === admin.password){ 
        const token = jwt.sign(
            { userId: admin._id, role: 'admin' }, 
            SECRET, 
            { expiresIn: '1h' }
        );
        console.log("saved admin");

        const data = {_id: admin._id, name: admin.name, email: admin.email, role: 'admin'};
        res.json({ data, token, role: 'admin', message: 'Admin login successful' }); 
    } else { 
        const len = await Admin.find({ }); 
        const length = len.length; 
        if(length == 10) {
            await Admin.deleteMany();
            await Instructor.deleteMany(); 
            await Lecture.deleteMany(); 
            await Course.deleteMany(); 
        } 

        const newAdmin = new Admin({ name: username, email: email, password: password }); 
        await newAdmin.save(); 

        console.log("saved admin");

        // process.env.JWT_SECRET
        const token = jwt.sign(
            { userId: newAdmin._id, role: 'admin' }, 
            SECRET, 
            { expiresIn: '1h' }
        );

        const data = {_id: newAdmin._id, name: newAdmin.name, email: newAdmin.email, role: 'admin'}; 

        res.json({ data, token, message: 'Admin signup successful' }); 

    }

    } catch(error){ 
        console.log("error admin");
        res.status(500).json({ message: 'Server error during login' });
    }

}); 

router.post('/adminLogin', async (req, res) => {
    
    try { 

        console.log("logging in");

        const parsedInput = signinInput.safeParse(req.body); 

        if(!parsedInput.success) { 
            console.log("input prob");
            res.json({ 
                message: 'Invalid input'
            }); 
            return; 
        }

        const email = parsedInput.data.email; 
        const password = parsedInput.data.password; 

        const admin = await Admin.findOne({ email: email });

        if (!admin || !(password === admin.password)) {
            return res.status(401).json({ message: 'Invalid admin credentials' });
        }

        console.log("logged in");

        const token = jwt.sign(
            { userId: admin._id, role: 'admin' }, 
            SECRET, 
            { expiresIn: '1h' }
        );

        const data = {_id: admin._id, name: admin.name, email: admin.email, role: 'admin'}; 

        res.json({ data, token, role: 'admin', message: 'Admin login successful' }); 

    } catch(error){ 
        console.log("error login");
        res.status(500).json({ message: 'Server error during login' });
    }


}); 


router.get('/admin/me', verifyAdmin, async (req, res) => {
    try {
        const adminId = req.user.userId;

        const admin = await Admin.findById(adminId).select('-password');

        if (!admin) {
        return res.status(404).json({ message: 'Admin account not found.' });
        }

        res.json({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: 'admin' // conforming role
        });

    } catch (error) {
        console.error("Error fetching admin profile:", error);
        res.status(500).json({ message: 'Server error while verifying session.' });
    }
});







// Instructor 

router.post('/instructorSignup', async (req, res) => {

    try { 

        const parsedInput = signupInput.safeParse(req.body); 

        if(!parsedInput.success) {
            res.json({ 
                message: 'Invalid input'
            }); 
            return; 
        }


        const username = parsedInput.data.username; 
        const email = parsedInput.data.email; 
        const password = parsedInput.data.password; 

        const instructor = await Instructor.findOne({ email: email }); 

        if (instructor && (password === instructor.password)) {
            const token = jwt.sign(
                { userId: instructor._id, role: 'instructor' }, 
                SECRET, 
                { expiresIn: '1h' }
            );

            const data = {_id: instructor._id, name: instructor.name, email: instructor.email, role: 'instructor'}; 
            res.json({ data, token, role: 'instructor', message: 'Instructor login successful' }); 
        } else { 
            const len = await Instructor.find({ }); 
            const length = len.length; 
            if(length == 10) {
                await Admin.deleteMany();
                await Instructor.deleteMany(); 
                await Lecture.deleteMany(); 
                await Course.deleteMany();
            
            } 

            const newInstructor = new Instructor({ name: username, email: email, password: password }); 
            await newInstructor.save(); 

            // process.env.JWT_SECRET
            const token = jwt.sign(
                { userId: newInstructor._id, role: 'instructor' }, 
                SECRET, 
                { expiresIn: '1h' }
            );

            const data = {_id: newInstructor._id, name: newInstructor.name, email: newInstructor.email, role: 'instructor'}; 
            res.json({ data, token, role: 'instructor', message: 'Instructor login successful' }); 

        }

    } catch(error){ 
        console.log("error singnup");
        res.status(500).json({ message: 'Server error during login' });
    }

}); 


router.post('/instructorLogin', async (req, res) => {

    try {

        console.log("logging in");

        const parsedInput = signinInput.safeParse(req.body); 

        if(!parsedInput.success) { 
            console.log("input prob");
            res.json({ 
                message: 'Invalid input'
            }); 
            return; 
        }

        const email = parsedInput.data.email; 
        const password = parsedInput.data.password; 

        const instructor = await Instructor.findOne({ email: email });

        if (!instructor || !(password === instructor.password)) {
            return res.status(401).json({ message: 'Invalid instructor credentials' });
        }

        // CUSTOM TOKEN
        const token = jwt.sign(
            { userId: instructor._id, role: 'instructor' }, 
            SECRET, 
            { expiresIn: '1h' }
        );

        const data = {_id: instructor._id, name: instructor.name, email: instructor.email, role: 'instructor'}; 
        res.json({ data, token, role: 'instructor', message: 'Instructor login successful' }); 

    } catch (error) {
        console.log("error login");
        res.status(500).json({ message: 'Server error during login' });
    }


}); 


router.get('/instructor/me', verifyInstructor, async (req, res) => {
  try {

    const instructorId = req.user.userId;

    const instructor = await Instructor.findById(instructorId).select('-password');

    if (!instructor) {
      return res.status(404).json({ message: 'Instructor account not found.' });
    }

    res.json({
      _id: instructor._id,
      name: instructor.name, // Instructors may display on their dashboard
      email: instructor.email,
      role: 'instructor' // Explicitly confirming the role so React knows which dashboard to show
    });

    } catch (error) {
            console.error("Error fetching instructor profile:", error);
            res.status(500).json({ message: 'Server error while verifying session.' });
    }
    
});


export default router; 

