
import React, { useState } from "react";
import axios from "axios";

export default function EmailManager() {
  const [activeTab, setActiveTab] = useState("single");

  // Single email state
  const [to, setTo] = useState("");
  const [userName, setUserName] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  // Bulk email state
  const [recipients, setRecipients] = useState([{ email: "", name: "" }]);
  const [bulkSubject, setBulkSubject] = useState("");
  const [bulkMessage, setBulkMessage] = useState("");

  const [loading, setLoading] = useState(false);

  // Single email handler
  const handleSendSingle = async () => {
    if (!to || !subject || !message) {
      alert("Please fill in email, subject, and message");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:5001/api/auth/send-email",
        { to, userName, subject, message },
        { withCredentials: true }
      );
      alert(res.data.message);
    } catch (err) {
      console.error(err);
      alert("Failed to send email");
    } finally {
      setLoading(false);
    }
  };

  // Bulk email handlers
  const handleRecipientChange = (index, field, value) => {
    const newRecipients = [...recipients];
    newRecipients[index][field] = value;
    setRecipients(newRecipients);
  };

  const addRecipient = () => setRecipients([...recipients, { email: "", name: "" }]);
  const removeRecipient = (index) => setRecipients(recipients.filter((_, i) => i !== index));

  const handleSendBulk = async () => {
    const validRecipients = recipients.filter(r => r.email);
    if (!validRecipients.length || !bulkSubject || !bulkMessage) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:5001/api/auth/send-bulk-email",
        { recipients: validRecipients, subject: bulkSubject, message: bulkMessage },
        { withCredentials: true }
      );
      alert(res.data.message);
    } catch (err) {
      console.error(err);
      alert("Failed to send bulk email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "20px auto" }}>
      {/* Tabs */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <button
          onClick={() => setActiveTab("single")}
          style={{ flex: 1, padding: 10, backgroundColor: activeTab === "single" ? "#007bff" : "#f0f0f0", color: activeTab === "single" ? "white" : "black" }}
        >
          Single Email
        </button>
        <button
          onClick={() => setActiveTab("bulk")}
          style={{ flex: 1, padding: 10, backgroundColor: activeTab === "bulk" ? "#007bff" : "#f0f0f0", color: activeTab === "bulk" ? "white" : "black" }}
        >
          Bulk Email
        </button>
      </div>

      {/* Single Email Form */}
      {activeTab === "single" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input type="email" placeholder="Email" value={to} onChange={e => setTo(e.target.value)} />
          <input placeholder="Name (optional)" value={userName} onChange={e => setUserName(e.target.value)} />
          <input placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)} />
          <textarea placeholder="Message" value={message} onChange={e => setMessage(e.target.value)} rows={5} />
          <button onClick={handleSendSingle} disabled={loading}>
            {loading ? "Sending..." : "Send Email"}
          </button>
        </div>
      )}

      {/* Bulk Email Form */}
      {activeTab === "bulk" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {recipients.map((r, i) => (
            <div key={i} style={{ display: "flex", gap: 5 }}>
              <input type="email" placeholder="Email" value={r.email} onChange={e => handleRecipientChange(i, "email", e.target.value)} />
              <input placeholder="Name (optional)" value={r.name} onChange={e => handleRecipientChange(i, "name", e.target.value)} />
              <button onClick={() => removeRecipient(i)}>Remove</button>
            </div>
          ))}
          <button onClick={addRecipient}>Add Recipient</button>
          <input placeholder="Subject" value={bulkSubject} onChange={e => setBulkSubject(e.target.value)} />
          <textarea placeholder="Message" value={bulkMessage} onChange={e => setBulkMessage(e.target.value)} rows={5} />
          <button onClick={handleSendBulk} disabled={loading}>
            {loading ? "Sending..." : "Send Bulk Email"}
          </button>
        </div>
      )}
    </div>
  );
}


/*import React, { useState } from "react";
import axios from "axios";

export default function SendEmails() {
  const [to, setTo] = useState("");
  const [userName, setUserName] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSend = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5001/api/auth/send-email",
        { to, userName, subject, message },
        { withCredentials: true }
      );
      alert(res.data.message);
    } catch (err) {
      console.error(err);
      alert("Failed to send email");
    }
  };

  return (
    <div>
      <input placeholder="Email" value={to} onChange={e => setTo(e.target.value)} />
      <input placeholder="Name (optional)" value={userName} onChange={e => setUserName(e.target.value)} />
      <input placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)} />
      <textarea placeholder="Message" value={message} onChange={e => setMessage(e.target.value)} />
      <button onClick={handleSend}>Send Email</button>
    </div>
  );
}*/
