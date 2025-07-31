import jwt from 'jsonwebtoken';

// Access Token (15 min)
export const generateAccessToken = (userId: string): string => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET || 'cinnami_secret',
        { expiresIn: '15d' }
    );
};

// Refresh Token (7 días)
export const generateRefreshToken = (userId: string): string => {
    return jwt.sign(
        { userId },
        process.env.REFRESH_SECRET || 'refresh_cinnami_secret',
        { expiresIn: '7d' }
    );
};