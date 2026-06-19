const Reminder = require('../models/Reminder');
const { createCrud } = require('../utils/crudFactory');
const crud = createCrud(Reminder, 'Reminder');

exports.getAll = crud.list;
exports.getById = crud.get;
exports.create = crud.create;
exports.update = crud.update;
exports.remove = crud.remove;
exports.markTaken = async (req, res) => { try { const r = await Reminder.findByIdAndUpdate(req.params.id, { takenStatus: 'Taken' }, { new: true }); if (!r) return res.status(404).json({ success: false, message: 'Reminder not found' }); return res.json({ success: true, reminder: r }); } catch (e) { return res.status(500).json({ success: false, message: e.message }); } };
exports.snooze = async (req, res) => { try { const r = await Reminder.findByIdAndUpdate(req.params.id, { takenStatus: 'Snoozed' }, { new: true }); if (!r) return res.status(404).json({ success: false, message: 'Reminder not found' }); return res.json({ success: true, reminder: r }); } catch (e) { return res.status(500).json({ success: false, message: e.message }); } };
exports.markMissed = async (req, res) => { try { const r = await Reminder.findById(req.params.id); if (!r) return res.status(404).json({ success: false, message: 'Reminder not found' }); r.takenStatus = 'Missed'; r.missedCount = (r.missedCount || 0) + 1; await r.save(); return res.json({ success: true, reminder: r }); } catch (e) { return res.status(500).json({ success: false, message: e.message }); } };
exports.toggleStatus = async (req, res) => { try { const r = await Reminder.findById(req.params.id); if (!r) return res.status(404).json({ success: false, message: 'Reminder not found' }); r.status = r.status === 'Active' ? 'Disabled' : 'Active'; await r.save(); return res.json({ success: true, reminder: r }); } catch (e) { return res.status(500).json({ success: false, message: e.message }); } };
exports.autoStop = async (req, res) => { try { const q = await Reminder.updateMany({ endDate: { $lt: new Date() }, status: 'Active' }, { status: 'Disabled' }); return res.json({ success: true, updated: q.modifiedCount || 0 }); } catch (e) { return res.status(500).json({ success: false, message: e.message }); } };
exports.getStats = async (req, res) => { try { const total = await Reminder.countDocuments(); const taken = await Reminder.countDocuments({ takenStatus: 'Taken' }); const missed = await Reminder.countDocuments({ takenStatus: 'Missed' }); return res.json({ success: true, stats: { total, taken, missed } }); } catch (e) { return res.status(500).json({ success: false, message: e.message }); } };
