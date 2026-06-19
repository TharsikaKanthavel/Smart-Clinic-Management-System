function normalizeDoc(doc) {
  const o = doc.toObject ? doc.toObject() : doc;
  if (o.doctorName && !o.name) o.name = o.doctorName;
  if (o.patientName && !o.name) o.name = o.patientName;
  return o;
}

function createCrud(Model, label) {
  return {
    list: async (req, res) => {
      try {
        const docs = await Model.find({}).sort({ createdAt: -1 });
        const key = label.toLowerCase() + 's';
        return res.json({ success: true, count: docs.length, [key]: docs.map(normalizeDoc) });
      } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
    },
    get: async (req, res) => {
      try {
        const doc = await Model.findById(req.params.id);
        if (!doc) return res.status(404).json({ success: false, message: `${label} not found` });
        return res.json({ success: true, [label.toLowerCase()]: normalizeDoc(doc) });
      } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
    },
    create: async (req, res) => {
      try {
        const body = req.body;
        if (body.items && typeof body.items === 'string') body.items = JSON.parse(body.items);
        if (body.medicines && typeof body.medicines === 'string') body.medicines = JSON.parse(body.medicines);
        if (body.availableDays && typeof body.availableDays === 'string') body.availableDays = JSON.parse(body.availableDays);
        if (body.detailedResults && typeof body.detailedResults === 'string') body.detailedResults = JSON.parse(body.detailedResults);
        if (req.file) {
          if (label === 'Doctor') body.profileImage = `/uploads/${req.file.filename}`;
          if (label === 'Patient') body.medicalReport = [`/uploads/${req.file.filename}`];
          if (label === 'Appointment') body.appointmentDocument = `/uploads/${req.file.filename}`;
          if (label === 'Prescription') body.prescriptionImage = `/uploads/${req.file.filename}`;
          if (label === 'LabTest') body.reportFile = `/uploads/${req.file.filename}`;
        }
        if (label === 'Doctor') body.doctorName = body.doctorName || body.name;
        if (label === 'Patient') body.patientName = body.patientName || body.name;
        const doc = await Model.create(body);
        return res.status(201).json({ success: true, [label.toLowerCase()]: normalizeDoc(doc) });
      } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
    },
    update: async (req, res) => {
      try {
        const body = req.body;
        if (body.items && typeof body.items === 'string') body.items = JSON.parse(body.items);
        if (body.medicines && typeof body.medicines === 'string') body.medicines = JSON.parse(body.medicines);
        if (body.availableDays && typeof body.availableDays === 'string') body.availableDays = JSON.parse(body.availableDays);
        if (body.detailedResults && typeof body.detailedResults === 'string') body.detailedResults = JSON.parse(body.detailedResults);
        if (req.file) {
          if (label === 'Doctor') body.profileImage = `/uploads/${req.file.filename}`;
          if (label === 'Patient') {
            const current = await Model.findById(req.params.id);
            body.medicalReport = [...(current?.medicalReport || []), `/uploads/${req.file.filename}`];
          }
          if (label === 'Appointment') body.appointmentDocument = `/uploads/${req.file.filename}`;
          if (label === 'Prescription') body.prescriptionImage = `/uploads/${req.file.filename}`;
          if (label === 'LabTest') body.reportFile = `/uploads/${req.file.filename}`;
        }
        if (label === 'Doctor') body.doctorName = body.doctorName || body.name;
        if (label === 'Patient') body.patientName = body.patientName || body.name;
        const doc = await Model.findByIdAndUpdate(req.params.id, body, { new: true });
        if (!doc) return res.status(404).json({ success: false, message: `${label} not found` });
        return res.json({ success: true, [label.toLowerCase()]: normalizeDoc(doc) });
      } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
    },
    remove: async (req, res) => {
      try {
        const doc = await Model.findByIdAndDelete(req.params.id);
        if (!doc) return res.status(404).json({ success: false, message: `${label} not found` });
        return res.json({ success: true, message: `${label} deleted` });
      } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
    }
  };
}

module.exports = { createCrud };
