import React, { useState } from "react";

export default function EditUsers() {
  const [activeTab, setActiveTab] = useState("general");
  const [showEmailVerification, setShowEmailVerification] = useState(true);

  const [generalSettings, setGeneralSettings] = useState({
    firstName: "Dananjaya",
    lastName: "",
    email: "dananjaya@example.com",
    username: "dananjaya_gems",
    phone: "",
    country: "Sri Lanka",
    city: "Negombo",
    address: "",
    bio: ""
  });

  const [passwordSettings, setPasswordSettings] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: false,
    loginAlerts: true
  });

  const [creditCards, setCreditCards] = useState([
    {
      id: 1,
      cardNumber: "**** **** **** 4532",
      cardType: "Visa",
      expiryDate: "12/25",
      holderName: "Dananjaya Silva",
      isDefault: true
    },
    {
      id: 2,
      cardNumber: "**** **** **** 8765",
      cardType: "Mastercard",
      expiryDate: "08/26",
      holderName: "Dananjaya Silva",
      isDefault: false
    }
  ]);

  const [newCard, setNewCard] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    holderName: "",
    cardType: "Visa"
  });
  const [showAddCard, setShowAddCard] = useState(false);

  const handleGeneralUpdate = () => {
    alert("General settings updated successfully!");
  };

  const handlePasswordUpdate = () => {
    if (passwordSettings.newPassword !== passwordSettings.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    alert("Password updated successfully!");
    setPasswordSettings({
      ...passwordSettings,
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
  };

  const handleAddCard = () => {
    if (!newCard.cardNumber || !newCard.expiryDate || !newCard.cvv || !newCard.holderName) {
      alert("Please fill in all card details");
      return;
    }
    const cardTypeFromNumber = newCard.cardNumber.startsWith("4")
      ? "Visa"
      : newCard.cardNumber.startsWith("5")
      ? "Mastercard"
      : "Other";

    const card = {
      id: Date.now(),
      cardNumber: `**** **** **** ${newCard.cardNumber.slice(-4)}`,
      cardType: cardTypeFromNumber,
      expiryDate: newCard.expiryDate,
      holderName: newCard.holderName,
      isDefault: creditCards.length === 0
    };

    setCreditCards([...creditCards, card]);
    setNewCard({ cardNumber: "", expiryDate: "", cvv: "", holderName: "", cardType: "Visa" });
    setShowAddCard(false);
    alert("Credit card added successfully!");
  };

  const handleRemoveCard = (cardId) => {
    if (window.confirm("Are you sure you want to remove this card?")) {
      setCreditCards(creditCards.filter((card) => card.id !== cardId));
    }
  };

  const handleSetDefaultCard = (cardId) => {
    setCreditCards(
      creditCards.map((card) => ({
        ...card,
        isDefault: card.id === cardId
      }))
    );
  };

  const tabs = [
    { id: "general", label: "General Settings", icon: "⚙️" },
    { id: "security", label: "Password & Security", icon: "🔒" },
    { id: "cards", label: "Credit Cards", icon: "💳" }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Email Verification Alert */}
          {showEmailVerification && activeTab === "general" && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-yellow-600 mr-2">⚠️</span>
                  <span className="text-yellow-800">Your email address needs to be verified.</span>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm">
                    Verify
                  </button>
                  <button
                    onClick={() => setShowEmailVerification(false)}
                    className="text-yellow-600 hover:text-yellow-800"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* General Settings Tab */}
          {activeTab === "general" && (
            <div className="space-y-6">
              {/* your general settings form here */}
              {/* ... use the code you had before (First name, Last name, etc.) */}
            </div>
          )}

          {/* Password & Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-6">
              {/* your password/security form here */}
            </div>
          )}

          {/* Credit Cards Tab */}
          {activeTab === "cards" && (
            <div className="space-y-6">
              {/* your credit cards UI here */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
