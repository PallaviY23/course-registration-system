const { getUserProfile, loginUser } = require('../services/userService');

const getProfileController = async (req, res) => {
    try {
        // In a real app, this ID comes from the decoded JWT token (req.user.user_id)
        // For testing without auth, you can pass it as a query param or header
        const userId = req.headers['user-id']; 

        if (!userId) {
            return res.status(400).json({ message: "User ID header missing" });
        }

        const profile = await getUserProfile(userId);
        
        if (!profile) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(profile);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const loginController = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. Validate input
        if (!username || !password) {
            return res.status(400).json({ 
                message: "Username and password are required" 
            });
        }

        // 2. Authenticate user and get token
        const result = await loginUser(username, password);

        // 3. Return token and user data with role information
        res.status(200).json({
            message: 'Login successful',
            token: result.token,
            user: result.user
        });

    } catch (err) {
        // Check if it's an authentication error or database error
        if (err.message.includes('Invalid') || err.message.includes('inactive')) {
            return res.status(401).json({ message: err.message });
        }
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getProfileController, loginController };