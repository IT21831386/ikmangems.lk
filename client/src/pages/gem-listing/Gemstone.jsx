import { useState } from "react";
import {
  Upload,
  X,
  Camera,
  Gem,
  MapPin,
  Award,
  DollarSign,
  FileText,
  Palette,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { gemstoneAPI, createFormData } from "../../services/api";

const CreateGemstoneForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    weight: "",
    weightUnit: "carats",
    color: "",
    clarity: "",
    cut: "",
    origin: {
      country: "",
      region: "",
      mine: "",
      yearMined: "",
    },
    dimensions: {
      length: "",
      width: "",
      height: "",
      unit: "mm",
    },
    certificateDetails: {
      hasCertificate: false,
      certificateNumber: "",
      certifyingBody: "None",
      issueDate: "",
      expiryDate: "",
    },
    minimumBid: "",
    reservePrice: "",
    currency: "LKR",
  });

  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', null
  const [submitMessage, setSubmitMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  const categories = [
    "Diamond",
    "Ruby",
    "Sapphire",
    "Emerald",
    "Topaz",
    "Garnet",
    "Amethyst",
    "Citrine",
    "Aquamarine",
    "Tourmaline",
    "Moonstone",
    "Peridot",
    "Opal",
    "Pearl",
    "Other",
  ];

  const clarityGrades = [
    "FL",
    "IF",
    "VVS1",
    "VVS2",
    "VS1",
    "VS2",
    "SI1",
    "SI2",
    "I1",
    "I2",
    "I3",
    "Not Graded",
  ];

  const cutTypes = [
    "Round",
    "Princess",
    "Cushion",
    "Emerald",
    "Oval",
    "Radiant",
    "Asscher",
    "Marquise",
    "Heart",
    "Pear",
    "Cabochon",
    "Raw/Rough",
    "Other",
  ];

  const certifyingBodies = [
    "None",
    "GIA",
    "AIGS",
    "Gübelin",
    "SSEF",
    "GRS",
    "Lotus",
    "EGL",
    "AGS",
    "Other",
  ];

  const colorOptions = [
    { name: "Blue", value: "blue", color: "bg-blue-500" },
    { name: "Black", value: "black", color: "bg-gray-800" },
    { name: "Green", value: "green", color: "bg-emerald-500" },
    { name: "Red", value: "red", color: "bg-red-500" },
    { name: "Yellow", value: "yellow", color: "bg-yellow-400" },
    { name: "Purple", value: "purple", color: "bg-purple-500" },
    { name: "Pink", value: "pink", color: "bg-pink-500" },
    { name: "Orange", value: "orange", color: "bg-orange-500" },
    {
      name: "White",
      value: "white",
      color: "bg-gray-100 border-2 border-gray-300",
    },
    {
      name: "Clear",
      value: "clear",
      color:
        "bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300",
    },
  ];

  const steps = [
    { id: 1, name: "Basic Info", icon: FileText },
    { id: 2, name: "Properties", icon: Gem },
    { id: 3, name: "Origin", icon: MapPin },
    { id: 4, name: "Images", icon: Camera },
    { id: 5, name: "Certificate", icon: Award },
    { id: 6, name: "Pricing", icon: DollarSign },
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleColorSelect = (colorValue) => {
    setFormData((prev) => ({
      ...prev,
      color: colorValue,
    }));
  };

  // Step-level validation with messages for toasts
  const validateStepWithMessages = (step) => {
    const messages = [];

    if (step === 1) {
      if (!formData.name || formData.name.trim().length < 2)
        messages.push("Name must be at least 2 characters");
      if (formData.name && formData.name.trim().length > 100)
        messages.push("Name cannot exceed 100 characters");
      if (formData.name && !/^[a-zA-Z\s\-.']+$/.test(formData.name.trim()))
        messages.push(
          "Name allows letters, spaces, hyphens, periods and apostrophes only"
        );
      if (!formData.category) messages.push("Category is required");
      if (!formData.description || formData.description.trim().length < 10)
        messages.push("Description must be at least 10 characters");
      if (formData.description && formData.description.trim().length > 1000)
        messages.push("Description cannot exceed 1000 characters");
    }

    if (step === 2) {
      // Weight required for step 2 per your earlier logic
      if (!formData.weight) messages.push("Weight is required");
      if (formData.weight) {
        const w = parseFloat(formData.weight);
        if (isNaN(w) || w < 0.01 || w > 10000)
          messages.push("Weight must be between 0.01 and 10000");
      }
      if (!formData.color) messages.push("Color is required");
      if (formData.color && !/^[a-zA-Z\s\\-]+$/.test(formData.color))
        messages.push("Color should only contain letters, spaces, and hyphens");
    }

    if (step === 3) {
      if (!formData.origin?.country)
        messages.push("Country of Origin is required");
      // eslint-disable-next-line no-useless-escape
      if (
        formData.origin?.country &&
        !/^[a-zA-Z\s-]+$/.test(formData.origin.country)
      )
        messages.push(
          "Country should only contain letters, spaces, and hyphens"
        );
    }

    if (step === 4) {
      const fileCount = images.filter(Boolean).length;
      if (fileCount === 0)
        messages.push("Please upload at least one image of the gem");
      if (fileCount > 10) messages.push("Maximum 10 images allowed");
    }

    if (step === 6) {
      if (!formData.minimumBid) messages.push("Minimum bid is required");
      const mb = parseFloat(formData.minimumBid);
      if (isNaN(mb) || mb < 1)
        messages.push("Minimum bid must be at least 1 LKR");
    }

    return { valid: messages.length === 0, messages };
  };

  const handleNextStep = () => {
    const v = validateStepWithMessages(currentStep);
    if (!v.valid) {
      toast.error(v.messages[0] || "Please check your inputs.");
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  // Client-side validation aligned with backend
  const validateClient = (data, imageFiles) => {
    const errs = {};

    // Name
    if (
      !data.name ||
      data.name.trim().length < 2 ||
      data.name.trim().length > 100
    ) {
      errs.name = "Name must be 2-100 characters";
    } else if (!/^[a-zA-Z\s\-\\.']+$/.test(data.name.trim())) {
      errs.name =
        "Name allows letters, spaces, hyphens, periods and apostrophes only";
    }

    // Description
    if (
      !data.description ||
      data.description.trim().length < 10 ||
      data.description.trim().length > 1000
    ) {
      errs.description = "Description must be 10-1000 characters";
    }

    // Category
    if (!data.category) {
      errs.category = "Category is required";
    }

    // Minimum Bid
    const mb = parseFloat(data.minimumBid);
    if (isNaN(mb) || mb < 1) {
      errs.minimumBid = "Minimum bid must be at least 1 LKR";
    }

    // Weight (optional but if provided must be valid)
    if (data.weight !== "" && data.weight !== undefined) {
      const w = parseFloat(data.weight);
      if (isNaN(w) || w < 0.01 || w > 10000) {
        errs.weight = "Weight must be between 0.01 and 10000";
      }
    }

    // Color (optional letters, spaces, hyphens)
    if (data.color && !/^[a-zA-Z\s\\-]+$/.test(data.color)) {
      errs.color = "Color should only contain letters, spaces, and hyphens";
    }

    // Origin country (optional letters, spaces, hyphens)
    if (data.origin?.country && !/^[a-zA-Z\s-]+$/.test(data.origin.country)) {
      errs["origin.country"] =
        "Country should only contain letters, spaces, and hyphens";
    }

    // Images (at least one, max 5)
    const fileCount = imageFiles.filter(Boolean).length;
    if (fileCount === 0) {
      errs.images = "At least one image is required";
    } else if (fileCount > 10) {
      errs.images = "Maximum 10 images allowed";
    }

    return { valid: Object.keys(errs).length === 0, errors: errs };
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newImages = [];

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        newImages.push({
          id: crypto.randomUUID(), // more robust than Date.now()
          url: event.target.result,
          file,
          isPrimary: false,
        });

        // Wait until all files are read
        if (newImages.length === files.length) {
          setImages((prev) => {
            const combined = [...prev, ...newImages].slice(0, 10); // cap to 10

            // Ensure only one is marked primary
            if (!combined.some((img) => img.isPrimary)) {
              combined[0].isPrimary = true;
            }

            return combined;
          });
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  const removeImage = (id) => {
    setImages((prev) => {
      const filtered = prev.filter((img) => img.id !== id);
      if (!filtered.some((img) => img.isPrimary) && filtered.length > 0) {
        filtered[0].isPrimary = true; // Reassign primary if needed
      }
      return filtered;
    });
  };

  const setPrimaryImage = (id) => {
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        isPrimary: img.id === id,
      }))
    );
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.name && formData.description && formData.category;
      case 2:
        return formData.weight && formData.color;
      case 3:
        return formData.origin.country;
      case 4:
        return true; // Images are optional
      case 5:
        return true; // Certificate is optional
      case 6:
        return formData.minimumBid;
      default:
        return false;
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "",
      weight: "",
      weightUnit: "carats",
      color: "",
      clarity: "",
      cut: "",
      origin: {
        country: "",
        region: "",
        mine: "",
        yearMined: "",
      },
      dimensions: {
        length: "",
        width: "",
        height: "",
        unit: "mm",
      },
      certificateDetails: {
        hasCertificate: false,
        certificateNumber: "",
        certifyingBody: "None",
        issueDate: "",
        expiryDate: "",
      },
      minimumBid: "",
      reservePrice: "",
      currency: "LKR",
    });
    setImages([]);
    setCurrentStep(1);
    setSubmitStatus(null);
    setSubmitMessage("");
    setValidationErrors({});
  };

  const handleSubmit = async (isDraft = false) => {
    setIsSubmitting(true);
    setSubmitStatus(null);
    setSubmitMessage("");
    setValidationErrors({});

    try {
      // Prepare form data for API
      const submitData = {
        ...formData,
        minimumBid: parseFloat(formData.minimumBid),
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        reservePrice: formData.reservePrice
          ? parseFloat(formData.reservePrice)
          : undefined,
        verificationStatus: isDraft ? "draft" : "submitted",
      };

      // Client validation
      const filesToSend = images.map((img) => img.file);
      const v = validateClient(submitData, filesToSend);
      if (!v.valid) {
        setValidationErrors(v.errors);
        setSubmitStatus("error");
        setSubmitMessage("Please fix the validation errors below.");
        toast.error("Validation errors. Please check your inputs.");
        return;
      }

      // Create FormData with files
      const formDataToSend = createFormData(
        submitData,
        images.map((img) => img.file).filter(Boolean)
      );

      console.log("Submitting gemstone data:", submitData);

      // Call API
      const response = await gemstoneAPI.createGemstone(formDataToSend);

      if (response.success) {
        setSubmitStatus("success");
        setSubmitMessage(
          isDraft
            ? "Gemstone saved as draft successfully!"
            : "Gemstone submitted for review successfully!"
        );

        // Toast success and navigate
        toast.success("Gemstone added successfully!");
        window.location.href = "/gemsdetails";
      } else {
        throw new Error(response.message || "Failed to create gemstone");
      }
    } catch (error) {
      console.error("Error submitting gemstone:", error);
      setSubmitStatus("error");

      if (error.errors && Array.isArray(error.errors)) {
        // Handle validation errors from backend
        const errors = {};
        error.errors.forEach((err) => {
          errors[err.field] = err.message;
        });
        setValidationErrors(errors);
        setSubmitMessage("Please fix the validation errors below.");

        // Show specific validation errors in alert
        toast.error("Validation errors. Please check your inputs.");
      } else {
        setSubmitMessage(
          error.message || "Error submitting gemstone. Please try again."
        );
        toast.error(
          error.message || "Failed to submit gemstone. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Gemstone Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 font-medium ${
                    validationErrors.name
                      ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                      : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
                  }`}
                  placeholder="eg: Stunning Blue Sapphire"
                  maxLength={100}
                />
                {validationErrors.name && (
                  <p className="text-red-600 text-sm mt-1">
                    {validationErrors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 font-medium appearance-none bg-white"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={5}
                  maxLength={1000}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 resize-none font-medium"
                  placeholder="Describe your gemstone in detail... Include its beauty, unique characteristics, and any special features."
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-gray-500">
                    {formData.description.length}/1000 characters
                  </p>
                  <div
                    className={`w-full max-w-xs bg-gray-200 rounded-full h-2 ml-4 ${
                      formData.description.length > 800 ? "bg-red-200" : ""
                    }`}
                  >
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        formData.description.length > 800
                          ? "bg-red-500"
                          : "bg-blue-500"
                      }`}
                      style={{
                        width: `${(formData.description.length / 1000) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            {/* Weight Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Gem className="h-5 w-5 mr-2 text-blue-600" />
                Weight & Measurements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Weight <span className="text-red-500">*</span>
                  </label>
                  <div className="flex rounded-xl overflow-hidden border-2 border-gray-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 transition-all duration-200">
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0.01"
                      className="flex-1 px-4 py-3 border-0 focus:outline-none font-medium"
                      placeholder="0.00"
                    />
                    <select
                      name="weightUnit"
                      value={formData.weightUnit}
                      onChange={handleInputChange}
                      className="px-4 py-3 bg-gray-50 border-0 focus:outline-none font-medium"
                    >
                      <option value="carats">Carats</option>
                      <option value="grams">Grams</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-700">
                    Dimensions (Optional)
                  </h4>
                  <div className="grid grid-cols-4 gap-3">
                    <input
                      type="number"
                      name="dimensions.length"
                      value={formData.dimensions.length}
                      onChange={handleInputChange}
                      step="0.1"
                      min="0"
                      placeholder="L"
                      className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-center font-medium"
                    />
                    <input
                      type="number"
                      name="dimensions.width"
                      value={formData.dimensions.width}
                      onChange={handleInputChange}
                      step="0.1"
                      min="0"
                      placeholder="W"
                      className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-center font-medium"
                    />
                    <input
                      type="number"
                      name="dimensions.height"
                      value={formData.dimensions.height}
                      onChange={handleInputChange}
                      step="0.1"
                      min="0"
                      placeholder="H"
                      className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-center font-medium"
                    />
                    <select
                      name="dimensions.unit"
                      value={formData.dimensions.unit}
                      onChange={handleInputChange}
                      className="px-2 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-center font-medium"
                    >
                      <option value="mm">mm</option>
                      <option value="cm">cm</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Color Section */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Palette className="h-5 w-5 mr-2 text-purple-600" />
                Color Selection <span className="text-red-500 ml-1">*</span>
              </h3>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-3 mb-4">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => handleColorSelect(color.value)}
                    className={`w-12 h-12 rounded-full ${
                      color.color
                    } border-4 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-200 ${
                      formData.color === color.value
                        ? "border-blue-600 ring-4 ring-blue-200"
                        : "border-gray-300"
                    }`}
                    title={color.name}
                  />
                ))}
              </div>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 font-medium"
                placeholder="Or describe the color in detail (eg: Deep Ocean Blue)"
              />
            </div>

            {/* Quality Attributes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Clarity
                </label>
                <select
                  name="clarity"
                  value={formData.clarity}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 font-medium"
                >
                  <option value="">Select Clarity</option>
                  {clarityGrades.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Cut
                </label>
                <select
                  name="cut"
                  value={formData.cut}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 font-medium"
                >
                  <option value="">Select Cut</option>
                  {cutTypes.map((cut) => (
                    <option key={cut} value={cut}>
                      {cut}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-6 border border-green-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-green-600" />
                Origin Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Country of Origin <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="origin.country"
                    value={formData.origin.country}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 font-medium"
                    placeholder="eg: Sri Lanka"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Region
                  </label>
                  <input
                    type="text"
                    name="origin.region"
                    value={formData.origin.region}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 font-medium"
                    placeholder="eg: Ratnapura"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Mine
                  </label>
                  <input
                    type="text"
                    name="origin.mine"
                    value={formData.origin.mine}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 font-medium"
                    placeholder="Mine name (if known)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Year Mined
                  </label>
                  <input
                    type="number"
                    name="origin.yearMined"
                    value={formData.origin.yearMined}
                    onChange={handleInputChange}
                    min="1800"
                    max={new Date().getFullYear()}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 font-medium"
                    placeholder="eg: 2023"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Camera className="h-5 w-5 mr-2 text-yellow-600" />
                Gemstone Images
              </h3>

              <div className="mb-6">
                <div className="border-3 border-dashed border-yellow-300 rounded-2xl p-8 text-center hover:border-yellow-400 hover:bg-yellow-25 transition-all duration-300 cursor-pointer group">
                  <Upload className="mx-auto h-16 w-16 text-yellow-400 mb-4 group-hover:scale-110 transition-transform duration-200" />
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />

                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer text-yellow-700 hover:text-yellow-800 font-semibold text-lg"
                  >
                    Click to upload gemstone images
                  </label>
                  <p className="text-yellow-600 text-sm mt-2">
                    PNG, JPG, GIF up to 10MB each • Upload multiple angles for
                    best results
                  </p>
                </div>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {images.map((image) => (
                    <div key={image.id} className="relative group">
                      <div
                        className={`relative overflow-hidden rounded-xl ${
                          image.isPrimary ? "ring-4 ring-yellow-500" : ""
                        }`}
                      >
                        <img
                          src={image.url}
                          alt="Gemstone preview"
                          className="w-full h-32 object-cover transition-transform duration-200 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(image.id)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      {!image.isPrimary && (
                        <button
                          type="button"
                          onClick={() => setPrimaryImage(image.id)}
                          className="absolute bottom-2 left-2 bg-yellow-500 text-white text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-yellow-600 font-medium"
                        >
                          Set Primary
                        </button>
                      )}
                      {image.isPrimary && (
                        <span className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                          Primary
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Award className="h-5 w-5 mr-2 text-indigo-600" />
                Certificate Details
              </h3>

              <div className="mb-6">
                <label className="flex items-center space-x-3 cursor-pointer p-4 rounded-xl bg-white border-2 border-gray-200 hover:border-indigo-300 transition-colors">
                  <input
                    type="checkbox"
                    name="certificateDetails.hasCertificate"
                    checked={formData.certificateDetails.hasCertificate}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-semibold text-gray-700">
                    This gemstone has an official certificate
                  </span>
                </label>
              </div>

              {formData.certificateDetails.hasCertificate && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white rounded-xl border border-gray-200">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Certificate Number
                    </label>
                    <input
                      type="text"
                      name="certificateDetails.certificateNumber"
                      value={formData.certificateDetails.certificateNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 font-medium"
                      placeholder="Certificate number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Certifying Body
                    </label>
                    <select
                      name="certificateDetails.certifyingBody"
                      value={formData.certificateDetails.certifyingBody}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 font-medium"
                    >
                      {certifyingBodies.map((body) => (
                        <option key={body} value={body}>
                          {body}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Issue Date
                    </label>
                    <input
                      type="date"
                      name="certificateDetails.issueDate"
                      value={formData.certificateDetails.issueDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      name="certificateDetails.expiryDate"
                      value={formData.certificateDetails.expiryDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 font-medium"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-2xl p-6 border border-emerald-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-emerald-600" />
                Pricing Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Minimum Bid <span className="text-red-500">*</span>
                  </label>
                  <div className="flex rounded-xl overflow-hidden border-2 border-gray-200 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-100 transition-all duration-200">
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                      className="px-4 py-3 bg-gray-50 border-0 focus:outline-none font-semibold text-gray-700"
                    >
                      <option value="LKR">LKR</option>
                      <option value="USD">USD</option>
                    </select>
                    <input
                      type="number"
                      name="minimumBid"
                      value={formData.minimumBid}
                      onChange={handleInputChange}
                      min="1"
                      className="flex-1 px-4 py-3 border-0 focus:outline-none font-medium"
                      placeholder="Enter minimum bid amount"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Reserve Price (Optional)
                  </label>
                  <input
                    type="number"
                    name="reservePrice"
                    value={formData.reservePrice}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all duration-200 font-medium"
                    placeholder="Reserve price (if any)"
                  />
                </div>
              </div>

              <div className="mt-6 p-4 bg-white rounded-xl border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Pricing Guidelines
                </h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    • <span className="font-medium">Minimum Bid:</span> Starting
                    price for the auction
                  </p>
                  <p>
                    • <span className="font-medium">Reserve Price:</span>{" "}
                    Minimum price you'll accept (hidden from bidders)
                  </p>
                  <p>
                    • <span className="font-medium">Tip:</span> Research similar
                    gemstones to set competitive prices
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
            <Gem className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Create Gemstone Listing
          </h1>
          <p className="text-xl text-gray-600">
            Showcase your precious gemstone to the world
          </p>
        </div>

        {/* Status Messages */}
        {submitStatus && (
          <div
            className={`mb-6 p-6 rounded-2xl border-2 shadow-lg ${
              submitStatus === "success"
                ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 text-green-800"
                : "bg-gradient-to-r from-red-50 to-pink-50 border-red-300 text-red-800"
            }`}
          >
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                {submitStatus === "success" ? (
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                    <AlertCircle className="h-8 w-8 text-white" />
                  </div>
                )}
              </div>

              <h3
                className={`text-2xl font-bold mb-2 ${
                  submitStatus === "success" ? "text-green-700" : "text-red-700"
                }`}
              >
                {submitStatus === "success"
                  ? "🎉 Gemstone Added Successfully!"
                  : "❌ Error Occurred"}
              </h3>

              <p className="text-lg mb-6">{submitMessage}</p>

              {submitStatus === "success" && (
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={resetForm}
                    className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                  >
                    ➕ Create Another Gemstone
                  </button>
                  <button
                    onClick={() => (window.location.href = "/gemsdetails")}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                  >
                    👀 View All Listings
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center space-x-4 overflow-x-auto pb-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              const isValid = validateStep(step.id);

              return (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => setCurrentStep(step.id)}
                    className={`flex flex-col items-center p-4 rounded-xl transition-all duration-200 min-w-fit ${
                      isActive
                        ? "bg-blue-600 text-white shadow-lg scale-105"
                        : isCompleted
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200"
                    }`}
                  >
                    <Icon
                      className={`h-6 w-6 mb-2 ${
                        isActive
                          ? "text-white"
                          : isCompleted
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    />
                    <span
                      className={`text-sm font-semibold ${
                        isActive
                          ? "text-white"
                          : isCompleted
                          ? "text-green-700"
                          : "text-gray-600"
                      }`}
                    >
                      {step.name}
                    </span>
                    {(isCompleted || (currentStep === step.id && isValid)) && (
                      <div
                        className={`w-2 h-2 rounded-full mt-1 ${
                          isActive ? "bg-white" : "bg-green-500"
                        }`}
                      />
                    )}
                  </button>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-8 h-1 mx-2 rounded-full ${
                        isCompleted ? "bg-green-400" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="p-8">{renderStepContent()}</div>

          {/* Navigation Footer */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <div className="flex space-x-4">
                {currentStep > 1 && (
                  <button
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-white hover:border-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all duration-200 font-semibold"
                  >
                    Previous
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500 font-medium">
                  Step {currentStep} of {steps.length}
                </span>

                {currentStep < steps.length ? (
                  <button
                    onClick={handleNextStep}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                  >
                    Next Step
                  </button>
                ) : (
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleSubmit(true)}
                      disabled={isSubmitting}
                      className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-white hover:border-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Saving..." : "Save Draft"}
                    </button>
                    <button
                      onClick={() => handleSubmit(false)}
                      disabled={isSubmitting || !validateStep(currentStep)}
                      className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-xl hover:from-emerald-700 hover:to-cyan-700 focus:outline-none focus:ring-4 focus:ring-emerald-200 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Listing"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-12 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            💡 Tips for a Great Listing
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Camera className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">
                High-Quality Photos
              </h4>
              <p className="text-sm text-gray-600">
                Upload clear, well-lit images from multiple angles
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">
                Detailed Description
              </h4>
              <p className="text-sm text-gray-600">
                Include all relevant details about your gemstone
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">
                Certificates Matter
              </h4>
              <p className="text-sm text-gray-600">
                Professional certificates increase buyer confidence
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGemstoneForm;
