import express from "express"; 
import mongoose from "mongoose"; 
import authRoutes from "./routes/auth.js"; 
import adminRoutes from "./routes/admin.js"; 
import instructorRoutes from "./routes/instructor.js"; 
import cors from "cors"; 
import path from "path";
import dotenv from 'dotenv'; 
dotenv.config();

const PORT = 4000; 
const app = express(); 
app.use(cors()); 
app.use(express.json());  
app.use("/auth", authRoutes); 
app.use("/admin", adminRoutes); 
app.use("/instructor", instructorRoutes); 

mongoose.connect(`mongodb+srv://gAurav:7L3Hg16LTz6iJ8Vr@ideamagixassignment.rodvsyg.mongodb.net/?appName=IdeamagixAssignment`); 

app.listen(PORT, () => {
    console.log(`Example app is listening at http://localhost:${PORT}`)
}); 



// username = gAurav
// pass = 7L3Hg16LTz6iJ8Vr
// link = mongodb+srv://<db_username>:<db_password>@ideamagixassignment.rodvsyg.mongodb.net/?appName=IdeamagixAssignment



