/**
 * Auth Middleware
 * 
 * Verifies the JWT from the Authorization header using Supabase Auth.
 * On success, attaches the user profile (id, email, role) to req.user.
 * 
 * Dev Mode: When token is "dev-token", bypasses auth and uses a default Manager profile.
 * This allows the frontend to work without real Supabase Auth setup.
 */

const supabase = require('../config/supabase');

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Missing or invalid Authorization header. Expected: Bearer <token>',
            });
        }

        const token = authHeader.split(' ')[1];

        // ── Dev Mode Bypass ──
        // When using "dev-token" or "demo-token", skip Supabase auth
        // and use a default Manager profile for full access
        if (token === 'dev-token' || token === 'demo-token') {
            req.user = {
                id: 'dev-user',
                name: 'Dev Manager',
                email: 'dev@fleetflow.com',
                role: 'Manager',
            };
            return next();
        }

        // Verify the JWT with Supabase Auth
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired token',
            });
        }

        // Fetch the user's profile (including role) from our users table
        const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('id, name, email, role')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            return res.status(401).json({
                success: false,
                error: 'User profile not found. Please contact an administrator.',
            });
        }

        // Attach user info to request for downstream use
        req.user = profile;
        next();
    } catch (err) {
        console.error('Auth middleware error:', err.message);
        return res.status(500).json({
            success: false,
            error: 'Authentication service error',
        });
    }
};

module.exports = authMiddleware;
