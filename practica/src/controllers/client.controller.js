import Client from '../models/client.model.js';
import { AppError } from '../utils/handleError.js';

// Pequeño helper para asegurarme de que el usuario tiene company.
// Si no la tiene, no puede crear/listar nada.
const requireCompany = (req) => {
  if (!req.user.company) {
    throw new AppError('Necesitas tener una empresa asignada', 400);
  }
  return req.user.company;
};

export const create = async (req, res) => {
  const companyId = requireCompany(req);

  // valido que no exista ya un client con el mismo cif en la misma empresa
  const dup = await Client.findOne({
    company: companyId,
    cif: req.body.cif,
    deleted: false,
  });
  if (dup) throw new AppError('Ya existe un cliente con ese CIF', 409);

  const client = await Client.create({
    ...req.body,
    user: req.user._id,
    company: companyId,
  });

  res.status(201).json(client);
};

export const update = async (req, res) => {
  const companyId = requireCompany(req);

  const client = await Client.findOneAndUpdate(
    { _id: req.params.id, company: companyId, deleted: false },
    req.body,
    { new: true, runValidators: true },
  );

  if (!client) throw new AppError('Cliente no encontrado', 404);

  res.json(client);
};

export const list = async (req, res) => {
  const companyId = requireCompany(req);
  const { page, limit, name, sort } = req.validatedQuery;

  const filter = { company: companyId, deleted: false };
  if (name) filter.name = { $regex: name, $options: 'i' };

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Client.find(filter).sort(sort).skip(skip).limit(limit),
    Client.countDocuments(filter),
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

  const items = await Client.find({ company: companyId, deleted: true }).sort(
    '-deletedAt',
  );

  res.json({ data: items, totalItems: items.length });
};

export const getOne = async (req, res) => {
  const companyId = requireCompany(req);

  // los archivados tambien se pueden consultar por id
  const client = await Client.findOne({
    _id: req.params.id,
    company: companyId,
  });

  if (!client) throw new AppError('Cliente no encontrado', 404);

  res.json(client);
};

export const remove = async (req, res) => {
  const companyId = requireCompany(req);
  const isSoft = req.validatedQuery?.soft === true;

  const client = await Client.findOne({
    _id: req.params.id,
    company: companyId,
  });
  if (!client) throw new AppError('Cliente no encontrado', 404);

  if (isSoft) {
    client.deleted = true;
    client.deletedAt = new Date();
    await client.save();
  } else {
    await Client.deleteOne({ _id: client._id });
  }

  res.json({ acknowledged: true, soft: isSoft });
};

export const restore = async (req, res) => {
  const companyId = requireCompany(req);

  const client = await Client.findOne({
    _id: req.params.id,
    company: companyId,
    deleted: true,
  });
  if (!client) throw new AppError('Cliente archivado no encontrado', 404);

  client.deleted = false;
  client.deletedAt = null;
  await client.save();

  res.json(client);
};
