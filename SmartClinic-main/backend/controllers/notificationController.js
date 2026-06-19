const Notification = require('../models/Notification');
const User = require('../models/User');
const { createCrud } = require('../utils/crudFactory');
const crud = createCrud(Notification, 'Notification');

exports.getAll = crud.list;
exports.getById = crud.get;
exports.create = crud.create;
exports.remove = crud.remove;
exports.markRead = async (req, res) => { try { const n = await Notification.findByIdAndUpdate(req.params.id, { status: 'Read' }, { new: true }); if (!n) return res.status(404).json({ success: false, message: 'Notification not found' }); return res.json({ success: true, notification: n }); } catch (e) { return res.status(500).json({ success: false, message: e.message }); } };
exports.markAllRead = async (req, res) => { try { const filter = req.body.userId ? { userId: req.body.userId } : {}; const q = await Notification.updateMany(filter, { status: 'Read' }); return res.json({ success: true, updated: q.modifiedCount || 0 }); } catch (e) { return res.status(500).json({ success: false, message: e.message }); } };
exports.getUnreadCount = async (req, res) => { try { const count = await Notification.countDocuments({ status: 'Unread' }); return res.json({ success: true, count }); } catch (e) { return res.status(500).json({ success: false, message: e.message }); } };
exports.broadcast = async (req, res) => {
  try {
    const audience = String(req.body?.audience || 'All Users');
    let query = {};
    if (audience === 'Patients Only') query = { role: 'Patient' };
    else if (audience === 'Doctors Only') query = { role: 'Doctor' };
    else if (audience === 'Admin Only') query = { role: 'Admin' };

    const users = await User.find(query, { _id: 1 });
    const docs = users.map((u) => ({
      userId: u._id,
      title: req.body?.title || 'Broadcast Notification',
      message: req.body?.message || '',
      notificationType: req.body?.notificationType || req.body?.type || 'Announcement',
      priorityLevel: req.body?.priorityLevel || req.body?.priority || 'Medium',
      deliveryMethod: req.body?.deliveryMethod || req.body?.delivery || 'Push',
      audience,
      scheduledAt: req.body?.scheduledAt || undefined,
      status: 'Unread',
    }));
    if (!docs.length) return res.json({ success: true, count: 0 });
    await Notification.insertMany(docs);
    return res.json({ success: true, count: docs.length });
  } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
};
