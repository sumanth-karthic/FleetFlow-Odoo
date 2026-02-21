/**
 * RBAC (Role-Based Access Control) Middleware
 * 
 * Factory function that returns middleware checking if the
 * authenticated user's role is in the allowed list.
 * 
 * Usage: router.post('/vehicles', authMiddleware, allowRoles(['Manager']), handler)
 */

const allowRoles = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required',
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}`,
            });
        }

        next();
    };
};

module.exports = { allowRoles };
