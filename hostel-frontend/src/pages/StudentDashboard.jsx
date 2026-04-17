import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import axios from "axios";

export default function StudentDashboard({ user }) {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [profile, setProfile] = useState(null);
  const [room, setRoom] = useState(null);
  const [roommates, setRoommates] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  // Profile edit state
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editMsg, setEditMsg] = useState("");

  // Profile picture state
  const [uploadingPic, setUploadingPic] = useState(false);
  const [picMsg, setPicMsg] = useState("");
  const [pendingPicFile, setPendingPicFile] = useState(null);
  const [pendingPicPreview, setPendingPicPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Fee state
  const [feeStructure, setFeeStructure] = useState([]);
  const [feeSummary, setFeeSummary] = useState([]);

  // Onboarding state
  const [obGender, setObGender] = useState("");
  const [obYear, setObYear] = useState("");
  const [obCourse, setObCourse] = useState("");
  const [obPhone, setObPhone] = useState("");
  const [obMsg, setObMsg] = useState("");
  const [obSubmitting, setObSubmitting] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const profileRes = await api.get(`/student/${user.user_id}`);
        const student = profileRes.data;
        setProfile(student);

        const roomRes = await api.get(`/allocation/student/${student.student_id}`);
        setRoom(roomRes.data[0] || null);

        // Fetch roommates if room allocated
        if (roomRes.data[0]) {
          try {
            const rmRes = await api.get(`/roommates/${student.student_id}`);
            setRoommates(rmRes.data);
          } catch (e) { console.error(e); }
        }

        const complaintRes = await api.get(`/complaints/student/${student.student_id}`);
        setComplaints(complaintRes.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }

      // Fetch announcements independently
      try {
        const announcementRes = await api.get("/announcements");
        setAnnouncements(announcementRes.data);
      } catch (err) {
        console.error("Announcements fetch error:", err);
      }

      // Fetch fee data if profile is available
      try {
        const profileRes2 = await api.get(`/student/${user.user_id}`);
        const s = profileRes2.data;
        if (s.year && s.gender) {
          const feeRes = await api.get(`/fee-structure?year=${s.year}&gender=${s.gender}`);
          setFeeStructure(feeRes.data);
        }
        if (s.student_id) {
          const summaryRes = await api.get(`/student-fee-summary/${s.student_id}`);
          setFeeSummary(summaryRes.data);
        }
      } catch (err) {
        console.error("Announcements fetch error:", err);
      }
    };
    fetchAll();
  }, [user.user_id]);

  const submitComplaint = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!category || !description) {
      setMsg("Please fill all fields");
      return;
    }
    try {
      await api.post("/complaint", {
        student_id: profile.student_id,
        category,
        description,
      });
      setMsg("Complaint submitted successfully!");
      setCategory("");
      setDescription("");
      const res = await api.get(`/complaints/student/${profile.student_id}`);
      setComplaints(res.data);
    } catch (err) {
      console.error(err);
      setMsg("Failed to submit complaint");
    }
  };

  /* ================= PROFILE EDIT (NAME ONLY) ================= */
  const startEditing = () => {
    setEditName(profile?.name || "");
    setEditMsg("");
    setEditing(true);
  };

  const saveProfile = async () => {
    setEditMsg("");
    if (!editName.trim()) {
      setEditMsg("Name is required");
      return;
    }
    try {
      await api.put(`/student/${user.user_id}`, { name: editName });
      const profileRes = await api.get(`/student/${user.user_id}`);
      setProfile(profileRes.data);
      setEditing(false);
      setEditMsg("Name updated successfully!");
    } catch (err) {
      console.error(err);
      setEditMsg("Failed to update name");
    }
  };

  /* ================= PROFILE PICTURE UPLOAD ================= */
  const handlePicSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPicMsg("");
    setPendingPicFile(file);
    setPendingPicPreview(URL.createObjectURL(file));
  };

  const confirmPicUpload = async () => {
    if (!pendingPicFile) return;
    setUploadingPic(true);
    setPicMsg("");
    try {
      const formData = new FormData();
      formData.append("profile_pic", pendingPicFile);
      await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/student/profile-picture/${user.user_id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const profileRes = await api.get(`/student/${user.user_id}`);
      setProfile(profileRes.data);
      setPicMsg("Profile picture updated successfully!");
    } catch (err) {
      setPicMsg(err.response?.data?.message || "Failed to upload picture");
    } finally {
      setUploadingPic(false);
      setPendingPicFile(null);
      setPendingPicPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const cancelPicUpload = () => {
    setPendingPicFile(null);
    setPendingPicPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const profilePicUrl = profile?.profile_picture
    ? `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${profile.profile_picture}`
    : null;
  const canChangePic = profile && profile.profile_picture_changed !== 1;

  // Reusable avatar renderer
  const renderAvatar = (size = "w-10 h-10", textSize = "text-base") => (
    profilePicUrl ? (
      <img src={profilePicUrl} alt="Profile" className={`${size} rounded-full object-cover`} />
    ) : (
      <div className={`${size} rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold ${textSize}`}>
        {(profile?.name || user?.name || "S").charAt(0).toUpperCase()}
      </div>
    )
  );

  const firstName = (profile?.name || user?.name || "Student").split(" ")[0];
  const fullName = profile?.name || user?.name || "Student";
  const rollNo = profile?.roll_no || "Not Available";
  const course = profile?.course || "Not Available";
  const year = profile?.year || "—";
  const gender = profile?.gender || "Not Available";
  const phone = profile?.phone || "Not Available";
  const roomDisplay = room ? `${room.room_number}` : "Not Allocated";
  const hostelName = room?.hostel_name || "Not Allocated";

  // Check if onboarding is needed
  const needsOnboarding = profile && (!profile.gender || !profile.year);

  const submitOnboarding = async () => {
    setObMsg("");
    if (!obGender || !obYear || !obCourse || !obPhone.trim()) {
      setObMsg("All fields are required");
      return;
    }
    if (obGender === "Male" && Number(obYear) > 1) {
      setObMsg("Only 1st year boys have hostel facility. Please contact the administration.");
      return;
    }
    setObSubmitting(true);
    try {
      await api.put(`/student/onboard/${user.user_id}`, {
        gender: obGender,
        year: Number(obYear),
        course: obCourse,
        phone: obPhone || null,
      });
      // Reload the profile
      const profileRes = await api.get(`/student/${user.user_id}`);
      setProfile(profileRes.data);
    } catch (err) {
      setObMsg(err.response?.data?.message || "Failed to save profile");
    } finally {
      setObSubmitting(false);
    }
  };

  // Show onboarding modal if profile is incomplete
  if (needsOnboarding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full">
          <div className="text-center mb-6">
            <span className="material-symbols-outlined text-5xl text-blue-600 mb-2">school</span>
            <h2 className="text-2xl font-bold text-gray-900">Complete Your Profile</h2>
            <p className="text-gray-500 mt-1">Fill in your details to access the hostel system</p>
          </div>

          {obMsg && (
            <p className={`mb-4 text-sm font-medium text-center p-3 rounded-lg ${obMsg.includes("Only 1st year") ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-600"}`}>
              {obMsg}
            </p>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
              <select
                className="w-full border border-gray-200 p-3 rounded-lg"
                value={obGender}
                onChange={(e) => { setObGender(e.target.value); setObMsg(""); }}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male (Boy)</option>
                <option value="Female">Female (Girl)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
              <select
                className="w-full border border-gray-200 p-3 rounded-lg"
                value={obYear}
                onChange={(e) => { setObYear(e.target.value); setObMsg(""); }}
              >
                <option value="">Select Year</option>
                {obGender === "Male" ? (
                  <option value="1">1st Year</option>
                ) : (
                  <>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </>
                )}
              </select>
              {obGender === "Male" && (
                <p className="text-xs text-gray-400 mt-1">Only 1st year boys are eligible for hostel</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course *</label>
              <input
                type="text"
                className="w-full border border-gray-200 p-3 rounded-lg"
                placeholder="e.g. CSE, ECE, ME"
                value={obCourse}
                onChange={(e) => setObCourse(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <input
                type="tel"
                className="w-full border border-gray-200 p-3 rounded-lg"
                placeholder="Your phone number"
                value={obPhone}
                onChange={(e) => setObPhone(e.target.value)}
              />
            </div>

            <button
              onClick={submitOnboarding}
              disabled={obSubmitting}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
            >
              {obSubmitting ? "Saving..." : "Complete Profile & Continue"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { key: "dashboard", icon: "dashboard", label: "Dashboard", fill: true },
    { key: "profile", icon: "person", label: "Profile" },
    { key: "room", icon: "bed", label: "Room Allotment" },
    { key: "complaints", icon: "report_problem", label: "Complaints" },
    { key: "fees", icon: "payments", label: "Fees" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-text-sub font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col lg:flex-row overflow-x-hidden bg-background-light">

      {/* ===== MOBILE OVERLAY ===== */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ===== SIDEBAR ===== */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-[280px] bg-surface-light border-r border-slate-200 flex flex-col justify-between shrink-0 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 pb-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-white">
                <span className="material-symbols-outlined">school</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-text-main">HMS</h1>
            </div>
          </div>

          {/* Mobile profile */}
          <div className="px-6 py-4 lg:hidden border-b border-slate-100">
            <div className="flex gap-3 items-center">
              {renderAvatar("w-10 h-10", "text-base")}
              <div>
                <h2 className="text-sm font-semibold">{fullName}</h2>
                <p className="text-xs text-text-sub">Roll No: {rollNo}</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => { setActiveSection(item.key); setSidebarOpen(false); setMsg(""); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors text-left ${activeSection === item.key
                  ? "bg-primary-light text-primary"
                  : "text-text-main hover:bg-slate-50 group"
                  }`}
              >
                <span className={`material-symbols-outlined ${activeSection === item.key ? "fill" : "text-slate-400 group-hover:text-primary transition-colors"}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-slate-200">
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to logout?")) {
                  localStorage.removeItem("hostel_user");
                  window.location.href = "/";
                }
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-100 text-text-main font-medium hover:bg-slate-200 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* ===== MAIN ===== */}
      <main className="flex-1 flex flex-col min-h-screen lg:ml-[280px]">

        {/* Header */}
        <header className="bg-surface-light border-b border-slate-200 px-6 py-3 lg:px-10 lg:py-4 fixed top-0 right-0 left-0 lg:left-[280px] z-20 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              {/* Mobile hamburger */}
              <button className="lg:hidden p-1 text-text-sub" onClick={() => setSidebarOpen(true)}>
                <span className="material-symbols-outlined text-2xl">menu</span>
              </button>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-text-main">
                  Hello, {firstName}!
                </h1>
                <p className="text-text-sub mt-1 font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">apartment</span>
                  Room {roomDisplay} | {course !== "Not Available" ? course : "Branch N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden lg:flex items-center gap-3 pl-4 border-l border-slate-200">
                {renderAvatar("w-10 h-10", "text-base")}
                <div className="text-sm">
                  <p className="font-bold text-text-main leading-none">{fullName}</p>
                  <p className="text-text-sub text-xs mt-1">Student</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 lg:p-10 flex flex-col gap-8 mt-[76px]">

          {/* ==================== DASHBOARD VIEW ==================== */}
          {activeSection === "dashboard" && (
            <>
              {/* Top cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Complaint Tracker Card */}
                {(() => {
                  const openCount = complaints.filter(c => c.status === "Open").length;
                  const inProgressCount = complaints.filter(c => c.status === "In Progress").length;
                  const resolvedCount = complaints.filter(c => c.status === "Resolved").length;
                  const totalCount = complaints.length;
                  return (
                    <div className="bg-surface-light rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden">
                      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]"></div>
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="material-symbols-outlined text-amber-500">report_problem</span>
                          <span className="text-text-main font-bold text-lg">Complaint Tracker</span>
                        </div>
                        <p className="text-text-sub text-sm mb-3">
                          {totalCount === 0 ? "No complaints raised yet" : `${totalCount} total complaint${totalCount > 1 ? "s" : ""}`}
                        </p>
                        <div className="flex flex-wrap gap-3 mb-2">
                          <div className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 text-yellow-700 px-3 py-1.5 rounded-lg">
                            <span className="material-symbols-outlined text-base">schedule</span>
                            <span className="text-sm font-bold">{openCount}</span>
                            <span className="text-xs font-medium">Open</span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1.5 rounded-lg">
                            <span className="material-symbols-outlined text-base">autorenew</span>
                            <span className="text-sm font-bold">{inProgressCount}</span>
                            <span className="text-xs font-medium">In Progress</span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 px-3 py-1.5 rounded-lg">
                            <span className="material-symbols-outlined text-base">check_circle</span>
                            <span className="text-sm font-bold">{resolvedCount}</span>
                            <span className="text-xs font-medium">Resolved</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-6">
                        <button
                          onClick={() => setActiveSection("complaints")}
                          className="w-full font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20"
                        >
                          <span className="material-symbols-outlined text-sm">add_circle</span>
                          <span>Raise Complaint</span>
                          <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* Fee card */}
                {(() => {
                  const dashTotalDue = feeStructure.reduce((sum, f) => sum + Number(f.amount), 0);
                  const dashTotalPaid = feeSummary.reduce((sum, f) => sum + Number(f.paid_amount), 0);
                  const dashBalance = dashTotalDue - dashTotalPaid;
                  const isPaid = dashTotalDue > 0 && dashBalance <= 0;
                  const latestSemester = feeSummary.length > 0 ? feeSummary[0] : null;
                  return (
                    <div className="bg-surface-light rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden">
                      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#197fe6_1px,transparent_1px)] [background-size:16px_16px]"></div>
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <span className={`material-symbols-outlined ${isPaid ? "text-green-500" : "text-red-500"}`}>{isPaid ? "check_circle" : "pending_actions"}</span>
                          <span className="text-text-main font-bold text-lg">Fee Payment Status</span>
                        </div>
                        <p className="text-text-sub text-sm mb-1">
                          {latestSemester ? `Semester ${latestSemester.semester}` : `Year ${year || "—"}`}
                        </p>
                        {dashTotalDue > 0 ? (
                          <>
                            <p className="text-3xl font-black text-text-main tracking-tight">
                              ₹{(dashBalance > 0 ? dashBalance : 0).toLocaleString()}{" "}
                              <span className={`text-sm font-medium px-2 py-0.5 rounded ml-2 ${isPaid ? "text-green-600 bg-green-50" : "text-red-500 bg-red-50"}`}>
                                {isPaid ? "Paid" : "Pending"}
                              </span>
                            </p>
                            <p className="text-xs text-text-sub mt-2">
                              Total: ₹{dashTotalDue.toLocaleString()} | Paid: ₹{dashTotalPaid.toLocaleString()}
                            </p>
                          </>
                        ) : (
                          <p className="text-lg font-semibold text-text-sub mt-2">No fee structure available</p>
                        )}
                      </div>
                      <div className="mt-6">
                        <button
                          onClick={() => setActiveSection("fees")}
                          className={`w-full font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg ${isPaid ? "bg-green-600 hover:bg-green-700 text-white shadow-green-600/20" : "bg-primary hover:bg-blue-600 text-white shadow-primary/20"}`}
                        >
                          <span>{isPaid ? "View Details" : "Pay Dues Now"}</span>
                          <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Announcements + ID Card */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Announcements */}
                <div className="xl:col-span-2 bg-surface-light rounded-xl border border-slate-200 shadow-sm flex flex-col">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-text-main flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">campaign</span>
                      Recent Announcements
                    </h2>
                  </div>
                  <div className="p-0">
                    {announcements.length === 0 ? (
                      <div className="text-center py-10">
                        <span className="material-symbols-outlined text-5xl text-slate-300 mb-2">notifications_off</span>
                        <p className="text-text-sub font-medium">No announcements yet.</p>
                      </div>
                    ) : (
                      announcements.slice(0, 5).map((a, i) => {
                        const timeAgo = (() => {
                          const diff = Date.now() - new Date(a.created_at).getTime();
                          const mins = Math.floor(diff / 60000);
                          if (mins < 60) return `${mins}m ago`;
                          const hrs = Math.floor(mins / 60);
                          if (hrs < 24) return `${hrs}h ago`;
                          const days = Math.floor(hrs / 24);
                          return days === 1 ? "Yesterday" : `${days} days ago`;
                        })();
                        return (
                          <div key={a.announcement_id} className={`flex gap-4 p-5 hover:bg-slate-50 transition-colors ${i < announcements.slice(0, 5).length - 1 ? "border-b border-slate-100" : ""}`}>
                            <div className="flex-shrink-0 mt-1">
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                <span className="material-symbols-outlined">campaign</span>
                              </div>
                            </div>
                            <div>
                              <h3 className="font-bold text-text-main">{a.title}</h3>
                              <p className="text-sm text-text-sub mt-1">{a.description}</p>
                              <p className="text-xs text-slate-400 mt-2">Posted {timeAgo} • {a.posted_by_name} ({a.posted_by_role})</p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Student ID Card */}
                <div className="xl:col-span-1">
                  <div className="relative w-full aspect-[3/4.5] max-w-[340px] mx-auto xl:mx-0 rounded-2xl overflow-hidden shadow-2xl text-white transform transition-transform hover:scale-[1.02] duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary via-blue-700 to-indigo-900">
                      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>
                      <div className="absolute -top-20 -right-20 w-60 h-60 bg-white opacity-10 rounded-full blur-3xl"></div>
                      <div className="absolute bottom-10 -left-10 w-40 h-40 bg-blue-400 opacity-20 rounded-full blur-2xl"></div>
                    </div>
                    <div className="relative z-10 h-full flex flex-col p-6 items-center text-center">
                      <div className="w-full flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-white text-3xl">school</span>
                          <span className="font-black tracking-widest text-lg">MITS</span>
                        </div>
                        <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider backdrop-blur-sm">Student</span>
                      </div>
                      <div className="w-32 h-32 rounded-xl bg-white p-1 shadow-lg mb-4">
                        {profilePicUrl ? (
                          <img src={profilePicUrl} alt="Profile" className="w-full h-full rounded-lg object-cover" />
                        ) : (
                          <div className="w-full h-full rounded-lg bg-primary/20 flex items-center justify-center text-primary text-5xl font-black">
                            {firstName.charAt(0)}
                          </div>
                        )}
                      </div>
                      <h2 className="text-2xl font-bold mb-1">{fullName}</h2>
                      <p className="text-blue-100 font-medium mb-6">
                        {course !== "Not Available" ? `B.Tech - ${course}` : "Branch Not Available"}
                      </p>
                      <div className="w-full grid grid-cols-2 gap-4 text-left bg-black/10 p-4 rounded-xl backdrop-blur-sm border border-white/10 mb-6">
                        <div>
                          <p className="text-xs text-blue-200 uppercase tracking-wider mb-0.5">Roll No</p>
                          <p className="font-bold text-sm font-mono">{rollNo}</p>
                        </div>
                        <div>
                          <p className="text-xs text-blue-200 uppercase tracking-wider mb-0.5">Room</p>
                          <p className="font-bold text-sm">{roomDisplay}</p>
                        </div>
                      </div>
                      <div className="mt-auto bg-white p-2 rounded-lg">
                        <div
                          className="w-full h-12 bg-contain bg-no-repeat bg-center opacity-90"
                          style={{ backgroundImage: `url('https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=MITS-STUDENT-${rollNo}')` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Need Help */}
              <div className="bg-primary/5 rounded-xl p-6 border border-primary/10 flex flex-wrap gap-4 items-center justify-between">
                <div>
                  <h3 className="font-bold text-text-main">Need Help?</h3>
                  <p className="text-sm text-text-sub">Contact the hostel warden or administration office.</p>
                </div>
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">mail</span>
                    Email Warden
                  </button>
                  <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">mail</span>
                    Email Admin
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ==================== PROFILE VIEW ==================== */}
          {activeSection === "profile" && (
            <div className="bg-surface-light rounded-xl border border-slate-200 shadow-sm p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">person</span>
                  My Profile
                </h2>
                {!editing && (
                  <button
                    onClick={startEditing}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-600 transition-colors text-sm"
                  >
                    <span className="material-symbols-outlined text-lg">edit</span>
                    Edit Profile
                  </button>
                )}
              </div>

              {/* Profile Picture Section */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative group">
                  {profilePicUrl ? (
                    <img src={profilePicUrl} alt="Profile" className="w-28 h-28 rounded-full object-cover border-4 border-primary/20 shadow-lg" />
                  ) : (
                    <div className="w-28 h-28 rounded-full bg-primary/20 flex items-center justify-center text-primary text-4xl font-black border-4 border-primary/10 shadow-lg">
                      {firstName.charAt(0)}
                    </div>
                  )}
                  {canChangePic && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingPic}
                      className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                      title="Upload profile picture (one-time only)"
                    >
                      <span className="material-symbols-outlined text-white text-3xl">
                        {uploadingPic ? "hourglass_empty" : "photo_camera"}
                      </span>
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={handlePicSelect}
                  />
                </div>
                {canChangePic && (
                  <p className="text-xs text-text-sub mt-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">info</span>
                    Hover and click to upload photo (one-time only)
                  </p>
                )}
                {!canChangePic && profile?.profile_picture && (
                  <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    Profile picture has been set
                  </p>
                )}
                {picMsg && (
                  <div className={`mt-3 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${picMsg.includes("success") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                    <span className="material-symbols-outlined text-lg">{picMsg.includes("success") ? "check_circle" : "error"}</span>
                    {picMsg}
                  </div>
                )}
              </div>

              {/* ===== CONFIRMATION MODAL ===== */}
              {pendingPicPreview && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={cancelPicUpload}>
                  <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 flex flex-col items-center gap-5 animate-in" onClick={(e) => e.stopPropagation()}>
                    <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
                      <span className="material-symbols-outlined text-amber-600 text-3xl">warning</span>
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-bold text-text-main">Confirm Profile Picture</h3>
                      <p className="text-sm text-text-sub mt-1">This action <strong>cannot be undone</strong>. You can only set your profile picture <strong>once</strong>.</p>
                    </div>
                    <img src={pendingPicPreview} alt="Preview" className="w-32 h-32 rounded-full object-cover border-4 border-primary/20 shadow-lg" />
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 w-full">
                      <p className="text-xs text-amber-700 font-medium flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">info</span>
                        Once confirmed, you will not be able to change your profile picture again.
                      </p>
                    </div>
                    <div className="flex gap-3 w-full">
                      <button
                        onClick={cancelPicUpload}
                        className="flex-1 px-4 py-3 bg-slate-100 text-text-main rounded-lg font-medium hover:bg-slate-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={confirmPicUpload}
                        disabled={uploadingPic}
                        className="flex-1 px-4 py-3 bg-primary text-white rounded-lg font-bold hover:bg-blue-600 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {uploadingPic ? (
                          <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Uploading...</>
                        ) : (
                          <><span className="material-symbols-outlined text-lg">check</span> Confirm & Upload</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Success/Error msg (shown after saving) */}
              {editMsg && !editing && (
                <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 ${editMsg.includes("success") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                  <span className="material-symbols-outlined text-lg">{editMsg.includes("success") ? "check_circle" : "error"}</span>
                  {editMsg}
                </div>
              )}

              {/* --- VIEW MODE --- */}
              {!editing && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: "Full Name", value: fullName, icon: "badge" },
                    { label: "Email", value: user?.email || "Not Available", icon: "mail" },
                    { label: "Roll Number", value: rollNo, icon: "tag" },
                    { label: "Course/Branch", value: course, icon: "school" },
                    { label: "Year", value: year, icon: "calendar_today" },
                    { label: "Gender", value: gender, icon: "wc" },
                    { label: "Phone", value: phone, icon: "call" },
                    { label: "Hostel", value: hostelName, icon: "apartment" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="w-10 h-10 rounded-lg bg-primary-light text-primary flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined">{item.icon}</span>
                      </div>
                      <div>
                        <p className="text-xs text-text-sub font-semibold uppercase tracking-wider">{item.label}</p>
                        <p className="text-text-main font-bold mt-0.5">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* --- EDIT MODE (NAME ONLY) --- */}
              {editing && (
                <div className="space-y-5">
                  {editMsg && (
                    <div className="px-4 py-3 rounded-lg text-sm font-medium bg-red-50 text-red-700 border border-red-200 flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">error</span>
                      {editMsg}
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-light text-primary flex items-center justify-center shrink-0 mt-6">
                      <span className="material-symbols-outlined">badge</span>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-text-sub font-semibold uppercase tracking-wider mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        className="w-full border border-slate-200 p-3 rounded-lg bg-white text-text-main focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                        placeholder="Enter your full name"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                      <p className="text-xs text-text-sub mt-2">Other details like Roll No, Branch, Year etc. are fetched automatically from your college email.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={saveProfile}
                      className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-blue-600 transition-all shadow-lg shadow-primary/20"
                    >
                      <span className="material-symbols-outlined text-lg">save</span>
                      Save Name
                    </button>
                    <button
                      onClick={() => { setEditing(false); setEditMsg(""); }}
                      className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-text-main rounded-lg font-medium hover:bg-slate-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== ROOM VIEW ==================== */}
          {activeSection === "room" && (
            <div className="bg-surface-light rounded-xl border border-slate-200 shadow-sm p-6 lg:p-8">
              <h2 className="text-xl font-bold text-text-main mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">bed</span>
                Room Allotment
              </h2>
              {room ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { label: "Hostel Name", value: room.hostel_name, icon: "apartment" },
                      { label: "Room Number", value: room.room_number, icon: "meeting_room" },
                      { label: "Sharing", value: `${room.capacity} Sharing`, icon: "group" },
                      { label: "Allocated On", value: room.allocation_date, icon: "event" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="w-10 h-10 rounded-lg bg-primary-light text-primary flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined">{item.icon}</span>
                        </div>
                        <div>
                          <p className="text-xs text-text-sub font-semibold uppercase tracking-wider">{item.label}</p>
                          <p className="text-text-main font-bold mt-0.5">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Roommates Section */}
                  {roommates.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-lg font-bold text-text-main mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">group</span>
                        Your Roommates ({roommates.length})
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {roommates.map((rm, i) => (
                          <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:shadow-md transition-all">
                            {rm.profile_picture ? (
                              <img
                                src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${rm.profile_picture}`}
                                alt={rm.name}
                                className="w-14 h-14 rounded-full object-cover border-2 border-primary/20"
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shrink-0">
                                {rm.name?.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-bold text-text-main text-sm truncate">{rm.name}</p>
                              <p className="text-xs text-text-sub truncate">{rm.course || 'Branch N/A'}</p>
                              {rm.roll_no && (
                                <p className="text-xs text-slate-400 mt-0.5">{rm.roll_no}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">bed</span>
                  <p className="text-text-sub font-medium">Room not allocated yet.</p>
                  <p className="text-sm text-slate-400 mt-1">Please contact the hostel warden for room allocation.</p>
                </div>
              )}
            </div>
          )}

          {/* ==================== COMPLAINTS VIEW ==================== */}
          {activeSection === "complaints" && (
            <>
              {/* Complaint Form */}
              <div className="bg-surface-light rounded-xl border border-slate-200 shadow-sm p-6 lg:p-8">
                <h2 className="text-xl font-bold text-text-main mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">edit_note</span>
                  Raise a Complaint
                </h2>
                {msg && (
                  <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2 ${msg.includes("success") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                    <span className="material-symbols-outlined text-lg">{msg.includes("success") ? "check_circle" : "error"}</span>
                    {msg}
                  </div>
                )}
                <form onSubmit={submitComplaint} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-text-main mb-1.5">Category</label>
                    <select
                      className="w-full border border-slate-200 p-3 rounded-lg bg-white text-text-main focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="">Select Category</option>
                      <option value="Electricity">Electricity</option>
                      <option value="Water">Water</option>
                      <option value="Furniture">Furniture</option>
                      <option value="Cleanliness">Cleanliness</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text-main mb-1.5">Description</label>
                    <textarea
                      className="w-full border border-slate-200 p-3 rounded-lg bg-white text-text-main focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                      rows="3"
                      placeholder="Describe your issue in detail..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <button className="bg-primary hover:bg-blue-600 text-white font-bold px-6 py-3 rounded-lg transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">send</span>
                    Submit Complaint
                  </button>
                </form>
              </div>

              {/* Complaint List */}
              <div className="bg-surface-light rounded-xl border border-slate-200 shadow-sm p-6 lg:p-8">
                <h2 className="text-xl font-bold text-text-main mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">list_alt</span>
                  My Complaints
                </h2>
                {complaints.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">fact_check</span>
                    <p className="text-text-sub font-medium">No complaints raised yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {complaints.map((c) => {
                      const statusColors = {
                        Open: "bg-yellow-50 text-yellow-700 border-yellow-200",
                        "In Progress": "bg-blue-50 text-blue-700 border-blue-200",
                        Resolved: "bg-green-50 text-green-700 border-green-200",
                      };
                      return (
                        <div key={c.complaint_id} className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-text-main">{c.category}</span>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded border ${statusColors[c.status] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                                {c.status}
                              </span>
                            </div>
                            <p className="text-sm text-text-sub">{c.description}</p>
                          </div>
                          <p className="text-xs text-slate-400 shrink-0">{c.created_date}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ==================== FEES VIEW ==================== */}
          {activeSection === "fees" && (() => {
            const totalDue = feeStructure.reduce((sum, f) => sum + Number(f.amount), 0);
            const totalPaid = feeSummary.reduce((sum, f) => sum + Number(f.paid_amount), 0);
            const balanceDue = totalDue - totalPaid;
            return (
              <div className="flex flex-col gap-8">
                {/* Page Title */}
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-text-main tracking-tight">Fee Payment Portal</h1>
                  <p className="text-text-sub mt-1">Manage your hostel fees and view transaction history.</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-2 rounded-xl p-6 bg-surface-light border border-slate-200 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-2 text-slate-500">
                      <span className="material-symbols-outlined text-xl">receipt_long</span>
                      <p className="text-xs font-semibold uppercase tracking-wider">Total Due</p>
                    </div>
                    <p className="text-text-main tracking-tight text-3xl font-bold">₹{totalDue.toLocaleString()}</p>
                  </div>
                  <div className="flex flex-col gap-2 rounded-xl p-6 bg-surface-light border border-slate-200 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-2 text-green-600">
                      <span className="material-symbols-outlined text-xl">check_circle</span>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Paid Amount</p>
                    </div>
                    <p className="text-green-600 tracking-tight text-3xl font-bold">₹{totalPaid.toLocaleString()}</p>
                  </div>
                  <div className="flex flex-col gap-2 rounded-xl p-6 bg-primary text-white shadow-lg relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <span className="material-symbols-outlined text-8xl">account_balance_wallet</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-200 z-10">
                      <span className="material-symbols-outlined text-xl">warning</span>
                      <p className="text-xs font-semibold uppercase tracking-wider">Balance Due</p>
                    </div>
                    <p className="text-white tracking-tight text-3xl font-bold z-10">₹{balanceDue > 0 ? balanceDue.toLocaleString() : 0}</p>
                  </div>
                </div>

                {/* Fee Breakdown */}
                <section className="flex flex-col gap-4">
                  <h2 className="text-text-main text-xl font-bold px-1">Fee Breakdown</h2>
                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-surface-light shadow-sm">
                    {/* Semester period header — shown once */}
                    {feeStructure.length > 0 && feeStructure[0].period_from && feeStructure[0].period_to && (
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 flex items-center gap-2 text-white">
                        <span className="material-symbols-outlined text-base">date_range</span>
                        <span className="text-sm font-medium">
                          Semester: {new Date(feeStructure[0].period_from).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })} — {new Date(feeStructure[0].period_to).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    )}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Fee Component</th>
                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-right text-slate-500">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {feeStructure.length === 0 ? (
                            <tr><td colSpan="2" className="px-6 py-8 text-center text-slate-400">No fee structure defined for your year/gender yet.</td></tr>
                          ) : (
                            <>
                              {feeStructure.map((f) => (
                                <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                                  <td className="px-6 py-4 text-sm font-medium text-text-main">{f.component}</td>
                                  <td className="px-6 py-4 text-sm font-semibold text-right text-text-main">₹{Number(f.amount).toLocaleString()}</td>
                                </tr>
                              ))}
                              <tr className="bg-slate-50">
                                <td className="px-6 py-4 text-sm font-bold text-right text-text-main">Total</td>
                                <td className="px-6 py-4 text-lg font-bold text-right text-primary">₹{totalDue.toLocaleString()}</td>
                              </tr>
                            </>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>

                {/* Transaction History */}
                <section className="flex flex-col gap-4">
                  <h2 className="text-text-main text-xl font-bold px-1">Transaction History</h2>
                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-surface-light shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Semester</th>
                            <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                            <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-right text-slate-500">Total</th>
                            <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-right text-slate-500">Paid</th>
                            <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-right text-slate-500">Due</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {feeSummary.length === 0 ? (
                            <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-400">No payment records found.</td></tr>
                          ) : (
                            feeSummary.map((f) => (
                              <tr key={f.fee_id} className="hover:bg-slate-50">
                                <td className="px-6 py-3 text-sm text-text-main">Semester {f.semester}</td>
                                <td className="px-6 py-3 text-sm">
                                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${f.status === "Paid" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                                    }`}>
                                    {f.status}
                                  </span>
                                </td>
                                <td className="px-6 py-3 text-sm font-semibold text-right text-text-main">₹{Number(f.total_amount).toLocaleString()}</td>
                                <td className="px-6 py-3 text-sm font-semibold text-right text-green-600">₹{Number(f.paid_amount).toLocaleString()}</td>
                                <td className="px-6 py-3 text-sm font-semibold text-right text-red-500">₹{Number(f.due_amount).toLocaleString()}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>
              </div>
            );
          })()}

        </div >
      </main >
    </div >
  );
}
