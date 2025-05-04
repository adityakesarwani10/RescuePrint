import mongoose from 'mongoose';

const medicationSchema = new mongoose.Schema({
  name: String,
  dosage: String,
  doctor: String
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String },
  age: { type: Number },
  gender: { type: String },
  phone: { type: String },
  email: { type: String },
  username: { type: String },
  password: { type: String },

  // Fingerprint details
  fingerprintId: { type: String, unique: true, sparse: true },

  // Medical details
  bloodGroup: { type: String },
  medicalProblem: { type: String },
  allergies: { type: String },
  medications: [medicationSchema],

  // Aadhaar details
  aadhaar: { type: String, unique: true, sparse: true }
});

export default mongoose.model('User', userSchema);
