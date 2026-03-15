import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { AuthRequest } from '../middleware/auth';

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const { my, status, reportType, assignee, search } = req.query;

    const whereClause: any = {};

    // If 'my' is passed or user is employee (can only see own tasks)
    if (my === 'true' || user.role === 'employee') {
      whereClause.assigneeId = user.id;
    } else if (assignee) { // manager viewing specific assignees
      const assignees = Array.isArray(assignee) ? assignee : (assignee as string).split(',');
      whereClause.assigneeId = { in: assignees.map(a => parseInt(a as string)) };
    }

    if (status) {
      const statuses = Array.isArray(status) ? status : (status as string).split(',');
      whereClause.statusId = { in: statuses.map(s => parseInt(s as string)) };
    }

    if (reportType) {
      const rts = Array.isArray(reportType) ? reportType : (reportType as string).split(',');
      whereClause.reportTypeId = { in: rts.map(r => parseInt(r as string)) };
    }

    // search relates to comments and maybe task assignees? Spec says 'Names+comments'
    if (search) {
      whereClause.OR = [
        { assignee: { firstName: { contains: search as string } } },
        { assignee: { lastName: { contains: search as string } } },
        { comments: { some: { content: { contains: search as string } } } }
      ];
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        assignee: { select: { id: true, firstName: true, lastName: true } },
        reportType: true,
        status: true,
        comments: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        _count: { select: { comments: true } }
      },
      orderBy: { dueDate: 'asc' }
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getTaskById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const task = await prisma.task.findUnique({
      where: { id: parseInt(id as string) },
      include: {
        assignee: { select: { id: true, firstName: true, lastName: true } },
        reportType: true,
        status: true,
        comments: {
          include: { author: { select: { id: true, firstName: true, lastName: true } } },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!task) return res.status(404).json({ message: 'Task not found' });
    
    // Employee access control check
    if (req.user.role === 'employee' && task.assigneeId !== req.user.id) {
       return res.status(403).json({ message: 'Forbidden' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const { assigneeId, reportTypeId, statusId, dueDate, comment } = req.body;
    
    // Requires transaction if creating initial comment
    const task = await prisma.task.create({
      data: {
        assigneeId: parseInt(assigneeId),
        reportTypeId: parseInt(reportTypeId),
        statusId: parseInt(statusId),
        dueDate: new Date(dueDate),
        comments: comment ? {
          create: { authorId: req.user.id, content: comment }
        } : undefined
      },
      include: { assignee: true, reportType: true, status: true }
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { statusId, comment, assigneeId, reportTypeId, dueDate } = req.body;
    
    const updates: any = {};
    if (statusId) updates.statusId = parseInt(statusId);
    
    // Managers can update these fields:
    if (req.user.role !== 'employee') {
       if (assigneeId) updates.assigneeId = parseInt(assigneeId);
       if (reportTypeId) updates.reportTypeId = parseInt(reportTypeId);
       if (dueDate) updates.dueDate = new Date(dueDate);
    }

    const task = await prisma.task.update({
      where: { id: parseInt(id as string) },
      data: updates
    });

    // Add comment independently if provided
    if (comment) {
      await prisma.comment.create({
        data: {
          taskId: task.id,
          authorId: req.user.id,
          content: comment
        }
      });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
