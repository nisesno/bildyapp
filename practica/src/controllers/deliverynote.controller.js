import DeliveryNote from '../models/deliverynote.model.js';
import Project from '../models/project.model.js';
import { AppError } from '../utils/handleError.js';

const requireCompany = (req) => {
  if (!req.user.company) {
    throw new AppError('Necesitas tener una empresa asignada', 400);
  }
  return req.user.company;
};

export const create = async (req, res) => {
  const companyId = requireCompany(req);

  // saco el proyecto y de paso me llevo el cliente
  const project = await Project.findOne({
    _id: req.body.project,
    company: companyId,
    deleted: false,
  });
  if (!project) {
    throw new AppError('Proyecto no encontrado en tu compañia', 400);
  }

  const note = await DeliveryNote.create({
    ...req.body,
    user: req.user._id,
    company: companyId,
    client: project.client,
  });

  res.status(201).json(note);
};

export const list = async (req, res) => {
  const companyId = requireCompany(req);
  const { page, limit, project, client, format, signed, from, to, sort } =
    req.validatedQuery;

  const filter = { company: companyId, deleted: false };
  if (project) filter.project = project;
  if (client) filter.client = client;
  if (format) filter.format = format;
  if (signed !== undefined) filter.signed = signed;
  if (from || to) {
    filter.workDate = {};
    if (from) filter.workDate.$gte = from;
    if (to) filter.workDate.$lte = to;
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    DeliveryNote.find(filter)
      .populate('client', 'name cif')
      .populate('project', 'name projectCode')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    DeliveryNote.countDocuments(filter),
  ]);

  res.json({
    data: items,
    totalItems: total,
    totalPages: Math.ceil(total / limit) || 1,
    currentPage: page,
  });
};

export const getOne = async (req, res) => {
  const companyId = requireCompany(req);

  const note = await DeliveryNote.findOne({
    _id: req.params.id,
    company: companyId,
    deleted: false,
  })
    .populate('user', 'name lastName email')
    .populate('client', 'name cif email address')
    .populate('project', 'name projectCode address');

  if (!note) throw new AppError('Albaran no encontrado', 404);

  res.json(note);
};

export const remove = async (req, res) => {
  const companyId = requireCompany(req);

  const note = await DeliveryNote.findOne({
    _id: req.params.id,
    company: companyId,
  });
  if (!note) throw new AppError('Albaran no encontrado', 404);

  // los firmados no se borran (regla de negocio)
  if (note.signed) {
    throw new AppError('No se puede borrar un albaran firmado', 409);
  }

  await DeliveryNote.deleteOne({ _id: note._id });
  res.json({ acknowledged: true });
};
