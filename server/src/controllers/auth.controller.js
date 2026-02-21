/**
 * Auth Controller
 * 
 * Handles user authentication via Supabase Auth (email/password).
 * Returns JWT token and user profile on successful login.
 */

const supabase = require('../config/supabase');

/**
 * POST /auth/login
 * Body: { email, password }
 * Returns: JWT access token + user profile
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required',
            });
        }

        // Sign in with Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password',
            });
        }

        // Fetch user profile from our users table
        const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('id, name, email, role')
            .eq('id', data.user.id)
            .single();

        if (profileError) {
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch user profile',
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token,
                expires_at: data.session.expires_at,
                user: profile,
            },
        });
    } catch (err) {
        console.error('Login error:', err.message);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
};

module.exports = { login };
