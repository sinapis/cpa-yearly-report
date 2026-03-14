import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../prisma';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const { role, active, search } = req.query;

    const whereClause: any = {};
    
    if (role) {
      const roles = Array.isArray(role) ? role : (role as string).split(',');
      whereClause.role = { in: roles };
    }
    
    if (active !== undefined) {
      whereClause.active = active === 'true';
    }

    if (search) {
      whereClause.OR = [
        { firstName: { contains: search as string } },
        { lastName: { contains: search as string } },
        { email: { contains: search as string } }
      ];
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: { id: true, email: true, firstName: true, lastName: true, role: true, active: true, createdAt: true }
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, firstName, lastName, role, active, password } = req.body;
    
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ message: 'Email already exists' });

    let hashedPassword = '';
    if (password) {
       hashedPassword = await bcrypt.hash(password, 10);
    } else {
       // if not provided, just generate something random or require it
       hashedPassword = await bcrypt.hash('12345678', 10);
    }

    const user = await prisma.user.create({
      data: {
        email, firstName, lastName, role: role || 'employee', active: active !== false, password: hashedPassword
      },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, active: true }
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { email, firstName, lastName, role, active, password } = req.body;

    const data: any = { email, firstName, lastName, role, active };
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id: parseInt(id as string) },
      data,
      select: { id: true, email: true, firstName: true, lastName: true, role: true, active: true }
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id: parseInt(id as string) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
