import mongoose from "mongoose"; 

// Admin Schema
const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true });


// Instructor Schema
const instructorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // array to store instructor's lectore ID 
  lectures: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lecture' }]
}, { timestamps: true });


const courseSchema = new mongoose.Schema({
  name: { type: String, required: true }, 
  level: { type: String, required: true }, 
  description: { type: String, required: true }, 
  image: { type: String }, 
  // lectures / Batches added after course creation 
  batches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lecture' }] 
}, { timestamps: true });



const lectureSchema = new mongoose.Schema({
  course: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true 
  },
  instructor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Instructor', 
    required: true 
  },
  date: { 
    type: Date, 
    required: true 
  }, 
  lectureNumber: { 
    type: Number 
  }
}, { timestamps: true });

// THE ANTI-CLASH LOGIC:
// This compound index ensures that the combination of 'instructor' and 'date' MUST be unique.
// If the admin tries to assign an instructor to a new lecture on the same date, MongoDB will throw an error automatically.
lectureSchema.index({ instructor: 1, date: 1 }, { unique: true });



export const Admin = mongoose.model('Admin', adminSchema);
export const Instructor = mongoose.model('Instructor', instructorSchema);
export const Lecture = mongoose.model('Lecture', lectureSchema);
export const Course = mongoose.model('Course', courseSchema);

