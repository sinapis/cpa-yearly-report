import { Request, Response } from 'express';
import { prisma } from '../prisma';

export const getReportTypes = async (req: Request, res: Response) => {
  const reports = await prisma.reportType.findMany({ orderBy: { id: 'asc' } });
  res.json(reports);
};

export const createReportType = async (req: Request, res: Response) => {
  try {
    const { name, description, active } = req.body;
    const rt = await prisma.reportType.create({ data: { name, description, active } });
    res.status(201).json(rt);
  } catch (error) { res.status(500).json({ error }); }
};

export const updateReportType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, active } = req.body;
    const rt = await prisma.reportType.update({ where: { id: parseInt(id as string) }, data: { name, description, active } });
    res.json(rt);
  } catch (error) { res.status(500).json({ error }); }
};

export const deleteReportType = async (req: Request, res: Response) => {
  try {
    await prisma.reportType.delete({ where: { id: parseInt(req.params.id as string) } });
    res.status(204).send();
  } catch (error) { res.status(500).json({ error }); }
};

export const getStatusTypes = async (req: Request, res: Response) => {
  const statuses = await prisma.statusType.findMany({ orderBy: { id: 'asc' } });
  res.json(statuses);
};

export const createStatusType = async (req: Request, res: Response) => {
  try {
    const { name, color, active, isDefault } = req.body;
    if (isDefault) await prisma.statusType.updateMany({ data: { isDefault: false }});
    const st = await prisma.statusType.create({ data: { name, color, active, isDefault } });
    res.status(201).json(st);
  } catch (error) { res.status(500).json({ error }); }
};

export const updateStatusType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, color, active, isDefault } = req.body;
    if (isDefault) await prisma.statusType.updateMany({ data: { isDefault: false }});
    const st = await prisma.statusType.update({ where: { id: parseInt(id as string) }, data: { name, color, active, isDefault } });
    res.json(st);
  } catch (error) { res.status(500).json({ error }); }
};

export const deleteStatusType = async (req: Request, res: Response) => {
  try {
    await prisma.statusType.delete({ where: { id: parseInt(req.params.id as string) } });
    res.status(204).send();
  } catch (error) { res.status(500).json({ error }); }
};

export const getSettings = async (req: Request, res: Response) => {
  let settings = await prisma.systemSettings.findFirst();
  if (!settings) {
    settings = await prisma.systemSettings.create({ data: { defaultDueDays: 7, orangeWarningDays: 7 }});
  }
  res.json(settings);
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const { id, defaultDueDays, orangeWarningDays } = req.body;
    const settings = await prisma.systemSettings.update({
      where: { id: parseInt(id) },
      data: { defaultDueDays, orangeWarningDays }
    });
    res.json(settings);
  } catch (error) { res.status(500).json({ error }); }
};
