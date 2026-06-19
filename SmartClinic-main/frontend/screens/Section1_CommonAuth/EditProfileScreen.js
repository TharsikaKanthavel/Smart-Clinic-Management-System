import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme, ThemeProvider, Card, Input, Button, ScreenHeader } from '../Section0_SharedTheme/theme';
import { useAuth } from '../../context/AuthContext';
import { patientService } from '../../services/patientService';
import { doctorService } from '../../services/doctorService';

function EditProfileScreen({ onBack, onSave }) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [form, setForm] = useState({
    fullName: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    bloodGroup: '',
    allergies: '',
    chronicDiseases: '',
    emergencyContactName: '',
    emergencyContactNumber: '',
    insuranceProvider: '',
    insuranceNumber: '',
    // Doctor Fields
    doctorName: '',
    specialization: '',
    department: '',
    qualification: '',
    experienceYears: '',
    hospitalName: '',
    licenseNumber: '',
    consultationFee: '',
    consultationMode: 'Physical',
    availableTime: '',
  });
  const [patientId, setPatientId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(false);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const formatDateInput = (value) => {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 10);
  };

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      fullName: user?.fullName || user?.name || '',
      phoneNumber: user?.phone || user?.phoneNumber || '',
    }));
  }, [user]);

  useEffect(() => {
    let mounted = true;
    const loadProfile = async () => {
      setLoadingProfile(true);
      try {
        if (user?.role === 'Patient') {
          const res = await patientService.getMine();
          const p = res?.patient || null;
          if (!mounted || !p) return;
          setPatientId(String(p._id || ''));
          setForm((prev) => ({
            ...prev,
            fullName: prev.fullName || p.patientName || p.name || '',
            phoneNumber: prev.phoneNumber || p.phone || '',
            dateOfBirth: formatDateInput(p.dateOfBirth),
            gender: p.gender || '',
            address: p.address || '',
            bloodGroup: p.bloodGroup || '',
            allergies: Array.isArray(p.allergies) ? p.allergies.join(', ') : (p.allergies || ''),
            chronicDiseases: Array.isArray(p.chronicDiseases) ? p.chronicDiseases.join(', ') : (p.chronicDiseases || ''),
            emergencyContactName: p.emergencyContactName || '',
            emergencyContactNumber: p.emergencyContactNumber || '',
            insuranceProvider: p.insuranceProvider || '',
            insuranceNumber: p.insuranceNumber || '',
          }));
        } else if (user?.role === 'Doctor') {
           const res = await doctorService.getAll('');
           const loggedEmail = String(user?.email || '').toLowerCase();
           const loggedName = String(user?.fullName || user?.name || '').toLowerCase();
           const d = (res.doctors || []).find(dr => {
              const de = String(dr.email || '').toLowerCase();
              const dn = String(dr.doctorName || dr.name || '').toLowerCase();
              return (loggedEmail && de === loggedEmail) || (loggedName && dn === loggedName);
           });
           if (!mounted || !d) return;
           setDoctorId(String(d._id || ''));
           setForm(prev => ({
              ...prev,
              doctorName: d.doctorName || d.name || '',
              specialization: d.specialization || '',
              department: d.department || '',
              qualification: d.qualification || '',
              experienceYears: String(d.experienceYears || d.experience || ''),
              hospitalName: d.hospitalName || d.hospital || '',
              licenseNumber: d.licenseNumber || d.license || '',
              consultationFee: String(d.consultationFee || d.fee || ''),
              consultationMode: d.consultationMode || d.mode || 'Physical',
              availableTime: d.availableTime || '',
              phoneNumber: prev.phoneNumber || d.phone || '',
           }));
        }
      } catch (err) {
        console.log('Error loading profile refs', err);
      } finally {
        if (mounted) setLoadingProfile(false);
      }
    };
    loadProfile();
    return () => { mounted = false; };
  }, [user]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Edit Profile" subtitle="Update your account information" onBack={onBack} />

      <View style={{ paddingHorizontal: 24 }}>
        <Card>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginBottom: 10 }}>Account Details</Text>
          {loadingProfile ? <ActivityIndicator color={colors.primary} style={{ marginBottom: 12 }} /> : null}
          <Input label="Full Name" value={form.fullName} onChangeText={(v) => setField('fullName', v)} placeholder="Enter full name" />
          <Input label="Phone Number" value={form.phoneNumber} onChangeText={(v) => setField('phoneNumber', v)} placeholder="Enter phone number" keyboardType="phone-pad" />

          <View style={{ marginTop: 8 }}>
            <Text style={{ color: colors.textSub, marginBottom: 6 }}>Email</Text>
            <Text style={{ color: colors.text, fontWeight: '600' }}>{user?.email || 'N/A'}</Text>
          </View>

          <View style={{ marginTop: 10 }}>
            <Text style={{ color: colors.textSub, marginBottom: 6 }}>Role</Text>
            <Text style={{ color: colors.text, fontWeight: '600' }}>{user?.role || 'N/A'}</Text>
          </View>
        </Card>

        {user?.role === 'Patient' ? (
          <Card>
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginBottom: 10 }}>Patient Details</Text>
            <Input label="Date of Birth (YYYY-MM-DD)" value={form.dateOfBirth} onChangeText={(v) => setField('dateOfBirth', v)} placeholder="1990-01-01" />
            <Input label="Gender" value={form.gender} onChangeText={(v) => setField('gender', v)} placeholder="Male / Female / Other" />
            <Input label="Address" value={form.address} onChangeText={(v) => setField('address', v)} placeholder="Enter address" />
            <Input label="Blood Group" value={form.bloodGroup} onChangeText={(v) => setField('bloodGroup', v)} placeholder="A+, B+, O+, AB+" />
            <Input label="Allergies (comma separated)" value={form.allergies} onChangeText={(v) => setField('allergies', v)} placeholder="Dust, Peanut" />
            <Input label="Chronic Diseases (comma separated)" value={form.chronicDiseases} onChangeText={(v) => setField('chronicDiseases', v)} placeholder="Diabetes, Hypertension" />
            <Input label="Emergency Contact Name" value={form.emergencyContactName} onChangeText={(v) => setField('emergencyContactName', v)} placeholder="Enter contact name" />
            <Input label="Emergency Contact Number" value={form.emergencyContactNumber} onChangeText={(v) => setField('emergencyContactNumber', v)} placeholder="Enter contact number" keyboardType="phone-pad" />
            <Input label="Insurance Provider" value={form.insuranceProvider} onChangeText={(v) => setField('insuranceProvider', v)} placeholder="Enter provider" />
            <Input label="Insurance Number" value={form.insuranceNumber} onChangeText={(v) => setField('insuranceNumber', v)} placeholder="Enter number" />
          </Card>
        ) : null}

        {user?.role === 'Doctor' ? (
          <Card>
             <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16, marginBottom: 10 }}>Doctor Professional Details</Text>
             <Input label="Display Name" value={form.doctorName} onChangeText={(v) => setField('doctorName', v)} placeholder="Dr. Amal Perera" />
             <Input label="Specialization" value={form.specialization} onChangeText={(v) => setField('specialization', v)} placeholder="Cardiologist" />
             <Input label="Department" value={form.department} onChangeText={(v) => setField('department', v)} placeholder="Cardiology" />
             <Input label="Qualification" value={form.qualification} onChangeText={(v) => setField('qualification', v)} placeholder="MBBS, MD" />
             <Input label="Experience (Years)" value={form.experienceYears} onChangeText={(v) => setField('experienceYears', v)} placeholder="10" keyboardType="numeric" />
             <Input label="Hospital Name" value={form.hospitalName} onChangeText={(v) => setField('hospitalName', v)} placeholder="General Hospital" />
             <Input label="License Number" value={form.licenseNumber} onChangeText={(v) => setField('licenseNumber', v)} placeholder="MC12345" />
             <Input label="Consultation Fee" value={form.consultationFee} onChangeText={(v) => setField('consultationFee', v)} placeholder="2000" keyboardType="numeric" />
             <Input label="Consultation Mode" value={form.consultationMode} onChangeText={(v) => setField('consultationMode', v)} placeholder="Physical / Online" />
             <Input label="Availability (e.g. 9:00 AM - 5:00 PM)" value={form.availableTime} onChangeText={(v) => setField('availableTime', v)} placeholder="9:00 AM - 5:00 PM" />
          </Card>
        ) : null}

        <View style={{ marginBottom: 20 }}>
          <Button
            title="Save Changes"
            onPress={() => {
              const account = { fullName: form.fullName.trim(), phoneNumber: form.phoneNumber.trim() };
              const payload = { account };
              if (user?.role === 'Patient' && patientId) {
                payload.patient = {
                  id: patientId,
                  patientName: form.fullName.trim(),
                  phone: form.phoneNumber.trim(),
                  email: user?.email || '',
                  dateOfBirth: form.dateOfBirth || null,
                  gender: form.gender.trim(),
                  address: form.address.trim(),
                  bloodGroup: form.bloodGroup.trim(),
                  allergies: form.allergies ? form.allergies.split(',').map((s) => s.trim()).filter(Boolean) : [],
                  chronicDiseases: form.chronicDiseases ? form.chronicDiseases.split(',').map((s) => s.trim()).filter(Boolean) : [],
                  emergencyContactName: form.emergencyContactName.trim(),
                  emergencyContactNumber: form.emergencyContactNumber.trim(),
                  insuranceProvider: form.insuranceProvider.trim(),
                  insuranceNumber: form.insuranceNumber.trim(),
                };
              } else if (user?.role === 'Doctor' && doctorId) {
                 payload.doctor = {
                    id: doctorId,
                    doctorName: form.doctorName.trim(),
                    specialization: form.specialization.trim(),
                    department: form.department.trim(),
                    qualification: form.qualification.trim(),
                    experienceYears: Number(form.experienceYears),
                    hospitalName: form.hospitalName.trim(),
                    licenseNumber: form.licenseNumber.trim(),
                    consultationFee: Number(form.consultationFee),
                    consultationMode: form.consultationMode.trim(),
                    availableTime: form.availableTime.trim(),
                    phone: form.phoneNumber.trim(),
                    email: user?.email || '',
                 };
              }
              onSave?.(payload);
            }}
          />
        </View>

        <View style={{ marginTop: 12, marginBottom: 20 }}>
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>
            Linked patient profile: {patientId || 'Not linked'}
          </Text>
        </View>

        <View style={{ marginTop: 0 }}>
            <Button
              title="Back"
              variant="outline"
              onPress={onBack}
            />
          </View>
      </View>
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

export default function EditProfileScreenWrapper(props) {
  return <ThemeProvider><EditProfileScreen {...props} /></ThemeProvider>;
}

export { EditProfileScreen };
