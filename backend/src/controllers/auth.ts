import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';
import { AuthRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev';

export const login = async (req: Request, res: Response) => {
  try {
    const { identifier, password, rememberMe } = req.body;
    
    // Identifier can be email or possibly username. Just match email for now since firstName/lastName is what users have.
    // If username is needed later, we could add username field. The spec says "Email OR username".
    // For now we check email.
    const user = await prisma.user.findFirst({
      where: {
        OR: [
           { email: identifier },
           // { username: identifier } // IF we add username later
        ]
      }
    });

    if (!user || !user.active) {
      return res.status(401).json({ message: 'Invalid credentials or inactive user' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const tokenExpiry = rememberMe ? '30d' : '1d';
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: tokenExpiry });

    res.json({
      jwt: token,
      user: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        role: user.role,
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed }
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
