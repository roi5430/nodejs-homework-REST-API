const { HttpError, ctrlWrapper } = require("../helpers/index");

const {
  Contact,
  JoiSchema,
  updateContactSchema,
  favoriteSchema,
} = require("../models/contact");

const getAll = async (req, res) => {
  const { _id: owner } = req.user;
  const { favorite = [true, false], page = 1, limit = 10 } = req.query;

  if (favorite) {
    const contacts = await Contact.find({
      owner,
      favorite: favorite,
    });
    res.json({ contacts });
  }

  const skip = (page - 1) * limit;
  const result = await Contact.find({ owner }, "-createdAt -updatedAt", {
    skip,
    limit,
  }).populate("owner", "email");
  res.json({ result });
};

const getById = async (req, res) => {
  const { _id: owner } = req.user;
  const { contactId } = req.params;
  const result = await Contact.findOne({ _id: contactId, owner: owner });

  if (!result) {
    throw HttpError(404, "Not found");
  }
  res.json(result);
};

const addContact = async (req, res) => {
  const { _id: owner } = req.user;
  const { error } = JoiSchema.validate(req.body);

  if (error) {
    throw HttpError(400, "missing required name field");
  }
  const result = await Contact.create({ ...req.body, owner });
  res.status(201).json(result);
};

const updateContact = async (req, res) => {
  const { _id: owner } = req.user;

  const { error } = updateContactSchema.validate(req.body);
  if (error) {
    throw HttpError(400, "missing fields");
  }

  const { id } = req.params;
  const result = await Contact.findByIdAndUpdate(
    id,
    req.body,
    { owner: owner },
    { new: true }
  );
  if (!result) {
    throw HttpError(404, "Not found");
  }
  res.json(result);
};

const updateStatusContact = async (req, res) => {
  const { error } = favoriteSchema.validate(req.body);
  if (error) {
    throw HttpError(400, "missing field favorite");
  }

  const { id } = req.params;
  const { _id: owner } = req.user;
  const result = await Contact.findByIdAndUpdate(id, req.body, {
    new: true,
    owner: owner,
  });
  if (!result) {
    throw HttpError(404, "Not found");
  }
  res.json(result);
};

const deleteContact = async (req, res) => {
  const { _id: owner } = req.user;
  const { id } = req.params;
  const result = await Contact.findByIdAndRemove(id, { owner: owner });
  if (!result) {
    throw HttpError(404, "not found");
  }
  res.status({
    message: "contact deleted",
  });
};

module.exports = {
  getAll: ctrlWrapper(getAll),
  getById: ctrlWrapper(getById),
  addContact: ctrlWrapper(addContact),
  updateContact: ctrlWrapper(updateContact),
  updateStatusContact: ctrlWrapper(updateStatusContact),
  deleteContact: ctrlWrapper(deleteContact),
};
