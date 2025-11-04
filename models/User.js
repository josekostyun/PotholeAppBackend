import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  // Readable user ID like DRV0001, TECH0002, etc.
  userId: {
    type: String,
    unique: true,
  },

  // Basic identity fields
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    minlength: [2, "Name must be at least 2 characters long"],
    maxlength: [50, "Name cannot exceed 50 characters"]
  },

  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/,
      "Please enter a valid email address"
    ]
  },

  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password must be at least 8 characters long"],
    maxlength: [100, "Password cannot exceed 100 characters"]
  },

  phone: {
    type: String,
    trim: true,
    match: [/^\d{10,15}$/,"Please enter a valid phone number"]
  },

  role: {
    type: String,
    enum: {
      values: ["driver", "technician", "admin"],
      message: "Role must be either driver, technician, or admin"
    },
    default: "driver"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
}, { versionKey: false });


// 🔢 Auto-generate userId based on role (DRV0001, TECH0001, ADM0001)
userSchema.pre("save", async function (next) {
  if (!this.userId) {
    const rolePrefixes = {
      driver: "DRV",
      technician: "TECH",
      admin: "ADM"
    };

    const prefix = rolePrefixes[this.role] || "USR";
    const count = await mongoose.model("User").countDocuments({ role: this.role });
    this.userId = `${prefix}${(count + 1).toString().padStart(4, "0")}`;
  }
  next();
});


// 🧹 Clean API output (hide password, internal fields)
userSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.password;  // never expose passwords
    delete ret.__v;       // version key (already disabled)
    return ret;
  }
});

const User = mongoose.model("User", userSchema);
export default User;
