import mongoose from 'mongoose';

const medicationSchema = new mongoose.Schema({
  name: String,
  dosage: String,
  doctor: String
}, { _id: false });

const userSchema = new mongoose.Schema({
  fingerprintId: { type: String, required: true, unique: true },
  name: String,
  age: Number,
  gender: String,
  phone: String,
  email: String,
  username: String,
  password: String,
  bloodGroup: String,
  medicalProblem: String,
  allergies: String,
  medications: [medicationSchema]
});

export default mongoose.model('User', userSchema);
