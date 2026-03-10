import jwt from 'jsonwebtoken'; 
export const SECRET = "SecureIdeamagix";  

export const authenticateJwt = (req, res, next) => {
    const authHeader = req.headers.authorization; 
    if(authHeader){ 
        const token = authHeader.split(' ')[1]; 
        jwt.verify(token, SECRET, (err, payload) => {

            if(err || !payload || typeof payload == "string"){ 
                return res.sendStatus(403); 
            }

            req.headers["userId"] = payload.id; 
            next(); 
        });  

    } else{ 
        console.log("Nahhh");
        return res.sendStatus(401).json("Nahh");  
    } 
}



// admin verification 
export const verifyAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // process.env.JWT_SECRET
        const decoded = jwt.verify(token,  SECRET);
        
        if (decoded.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
        }

        req.user = decoded; // Now req.user.userId is available to your routes
        next();
    } catch (error) {
        res.status(403).json({ message: 'Invalid or expired token.' });
    }
};



// instructor verification 
export const verifyInstructor = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        // process.env.JWT_SECRET
        const decoded = jwt.verify(token, SECRET);
        
        if (decoded.role !== 'instructor') {
            return res.status(403).json({ message: 'Access denied. Instructors only.' });
        }

        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ message: 'Invalid or expired token.' });
    }
};


