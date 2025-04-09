import { clerkClient } from "@clerk/express"

// Middleware for general authentication
export const protect = async (req, res, next) => {
    try {
        if (!req.auth || !req.auth.userId) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }
        
        // Add the user ID to the request object for use in controllers
        req.user = { id: req.auth.userId };
        
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ success: false, message: 'Authentication error' });
    }
};

// Middleware ( Protect Educator Routes )
export const protectEducator = async (req,res,next) => {

    try {

        const userId = req.auth.userId
        
        const response = await clerkClient.users.getUser(userId)

        if (response.publicMetadata.role !== 'educator') {
            return res.json({success:false, message: 'Unauthorized Access'})
        }
        
        next ()

    } catch (error) {
        res.json({success:false, message: error.message})
    }

}