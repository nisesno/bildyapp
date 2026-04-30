import Project from '../models/project.model.js';
import Client from '../models/client.model.js';
import { AppError } from '../utils/handleError.js';

const requireCompany = (req) => {
  if (!req.user.company) {
    throw new AppError('Necesitas tener una empresa asignada', 400);
  }
  return req.user.company;
};

export const create = async (req, res) => {
  const companyId = requireCompany(req);

  // verificar que el cliente existe y es de la misma compañia
  const client = await Client.findOne({
    _id: req.body.client,
    company: companyId,
    deleted: false,
  });
  if (!client) {
    throw new AppError('El cliente no existe o no es de tu compañia', 400);
  }

  // codigo unico por compañia
  const dup = await Project.findOne({
    company: companyId,
    projectCode: req.body.projectCode,
    deleted: false,
  });
  if (dup) {
    throw new AppError('Ya existe un proyecto con ese codigo', 409);
  }

  const project = await Project.create({
    ...req.body,
    user: req.user._id,
    company: companyId,
  });

  res.status(201).json(project);
};

export const update = async (req, res) => {
  const companyId = requireCompany(req);

  const project = await Project.findOneAndUpdate(
    { _id: req.params.id, company: companyId, deleted: false },
    req.body,
    { new: true, runValidators: true },
  );
  if (!project) throw new AppError('Proyecto no encontrado', 404);

  res.json(project);
};

export const list = async (req, res) => {
  const companyId = requireCompany(req);
  const { page, limit, name, client, active, sort } = req.validatedQuery;

  const filter = { company: companyId, deleted: false };
  if (name) filter.name = { $regex: name, $options: 'i' };
  if (client) filter.client = client;
  if (active !== undefined) filter.active = active;

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Project.find(filter)
      .populate('client', 'name cif')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Project.countDocuments(filter),
  ]);

  res.json({
    data: items,
    totalItems: total,
    totalPages: Math.ceil(total / limit) || 1,
    currentPage: page,
  });
};

export const archived = async (req, res) => {
  const companyId = requireCompany(req);

  const items = await Project.find({
    company: companyId,
    deleted: true,
  }).sort('-deletedAt');

  res.json({ data: items, totalItems: items.length });
};

export const getOne = async (req, res) => {
  const companyId = requireCompany(req);

  const project = await Project.findOne({
    _id: req.params.id,
    company: companyId,
  }).populate('client', 'name cif email');

  if (!project) throw new AppError('Proyecto no encontrado', 404);

  res.json(project);
};

export const remove = async (req, res) => {
  const companyId = requireCompany(req);
  const isSoft = req.validatedQuery?.soft === true;

  const project = await Project.findOne({
    _id: req.params.id,
    company: companyId,
  });
  if (!project) throw new AppError('Proyecto no encontrado', 404);

  if (isSoft) {
    project.deleted = true;
    project.deletedAt = new Date();
    await project.save();
  } else {
    await Project.deleteOne({ _id: project._id });
  }

  res.json({ acknowledged: true, soft: isSoft });
};

export const restore = async (req, res) => {
  const companyId = requireCompany(req);

  const project = await Project.findOne({
    _id: req.params.id,
    company: companyId,
    deleted: true,
  });
  if (!project) throw new AppError('Proyecto archivado no encontrado', 404);

  project.deleted = false;
  project.deletedAt = null;
  await project.save();

  res.json(project);
};
