import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function WardenDashboard({ user }) {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [wardenProfile, setWardenProfile] = useState(null);
  const [profileError, setProfileError] = useState("");

  const [complaints, setComplaints] = useState([]);
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  // Announcements
  const [announcements, setAnnouncements] = useState([]);
  const [annTitle, setAnnTitle] = useState("");
  const [annDesc, setAnnDesc] = useState("");
  const [annMsg, setAnnMsg] = useState("");

  /* ================= ALLOCATION (SEARCH) ================= */
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [allocMsg, setAllocMsg] = useState("");

  // Sidebar collapsed
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Student search
  const [studentSearchQ, setStudentSearchQ] = useState("");

  useEffect(() => {
    const loadWardenProfile = async () => {
      try {
        const res = await api.get(`/warden/profile/${user.user_id}`);
        setWardenProfile(res.data);
      } catch (err) {
        setProfileError("You are not assigned to any hostel. Please contact the admin.");
        setLoading(false);
      }
    };
    loadWardenProfile();
  }, [user.user_id]);

  useEffect(() => {
    if (!wardenProfile) return;
    fetchComplaints();
    fetchStudents();
    fetchRooms();
    fetchAnnouncements();
  }, [wardenProfile]);

  const fetchComplaints = async () => {
    try {
      const genderParam = wardenProfile.hostel_type === "Boys" ? "Male" : "Female";
      const res = await api.get(`/complaints?gender=${genderParam}&year=${wardenProfile.for_year}`);
      setComplaints(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchStudents = async () => {
    try {
      const genderParam = wardenProfile.hostel_type === "Boys" ? "Male" : "Female";
      const res = await api.get(`/warden/students?gender=${genderParam}&year=${wardenProfile.for_year}`);
      setStudents(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchRooms = async () => {
    try {
      const res = await api.get(`/warden/rooms?hostel_id=${wardenProfile.hostel_id}`);
      setRooms(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get("/announcements");
      setAnnouncements(res.data);
    } catch (err) { console.error(err); }
  };

  const deleteAnnouncement = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;
    try { await api.delete(`/announcement/${id}`); fetchAnnouncements(); }
    catch (err) { console.error(err); }
  };

  const updateStatus = async (complaint_id, status) => {
    try {
      await api.put(`/complaint/${complaint_id}`, { status });
      setMsg("Status updated successfully");
      fetchComplaints();
      setTimeout(() => setMsg(""), 3000);
    } catch {
      setMsg("Failed to update complaint");
      setTimeout(() => setMsg(""), 3000);
    }
  };

  const handleSearch = async (value) => {
    setSearchQuery(value);
    if (value.length < 2) { setSearchResults([]); return; }
    try {
      const genderParam = wardenProfile.hostel_type === "Boys" ? "Male" : "Female";
      const res = await api.get(`/warden/search-students?q=${value}&gender=${genderParam}&year=${wardenProfile.for_year}`);
      setSearchResults(res.data);
    } catch (err) { console.error(err); }
  };

  // Stats
  const totalStudents = students.length;
  const totalRooms = rooms.length;
  const openComplaints = complaints.filter(c => c.status === "Open").length;
  const inProgressComplaints = complaints.filter(c => c.status === "In Progress").length;
  const resolvedComplaints = complaints.filter(c => c.status === "Resolved").length;
  const totalCapacity = rooms.reduce((s, r) => s + r.capacity, 0);
  const totalOccupied = rooms.reduce((s, r) => s + r.occupied_count, 0);
  const occupancyPct = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;
  const emptyRooms = rooms.filter(r => r.occupied_count === 0).length;
  const fullRooms = rooms.filter(r => r.occupied_count >= r.capacity).length;
  const partialRooms = rooms.filter(r => r.occupied_count > 0 && r.occupied_count < r.capacity).length;

  const statusColor = (status) => {
    if (status === "Open") return "bg-red-100 text-red-700";
    if (status === "In Progress") return "bg-amber-100 text-amber-700";
    return "bg-green-100 text-green-700";
  };

  if (profileError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md border border-gray-100">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl text-red-600">error</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Not Assigned</h2>
          <p className="text-gray-500">{profileError}</p>
          <button onClick={() => navigate("/")} className="mt-6 px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const navItems = [
    { key: "dashboard", icon: "dashboard", label: "Dashboard" },
    { key: "students", icon: "group", label: "Students" },
    { key: "allocation", icon: "door_open", label: "Room Allocation" },
    { key: "complaints", icon: "report_problem", label: "Complaints" },
    { key: "announcements", icon: "campaign", label: "Announcements" },
  ];

  return (
    <div className="h-screen overflow-hidden bg-gray-50 flex">
      {/* ================= SIDEBAR ================= */}
      <aside className={`${sidebarCollapsed ? "w-[68px]" : "w-60"} bg-white border-r border-gray-200 flex flex-col fixed top-0 left-0 h-screen transition-all duration-200 z-30`}>
        {/* Logo / Brand */}
        <div className="px-4 py-5 border-b border-gray-100 flex items-center gap-3 min-h-[72px]">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${wardenProfile?.hostel_type === "Boys" ? "bg-blue-100 text-blue-600" : "bg-pink-100 text-pink-600"}`}>
            <span className="material-symbols-outlined text-xl">apartment</span>
          </div>
          {!sidebarCollapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-gray-900 truncate">{wardenProfile?.hostel_name || "Hostel"}</p>
              <p className="text-[10px] text-gray-500 font-medium">Year {wardenProfile?.for_year} · {wardenProfile?.hostel_type}</p>
            </div>
          )}
        </div>

        {/* Nav Links */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => { setActiveSection(item.key); setMsg(""); setAllocMsg(""); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeSection === item.key
                ? "bg-blue-50 text-blue-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              title={sidebarCollapsed ? item.label : ""}
            >
              <span className={`material-symbols-outlined text-xl ${activeSection === item.key ? "text-blue-600" : "text-gray-400"}`}>{item.icon}</span>
              {!sidebarCollapsed && item.label}
            </button>
          ))}
        </nav>

        {/* Warden Info */}
        <div className="border-t border-gray-100 p-3">
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                {(user?.name || "W").charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || "Warden"}</p>
                <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center mb-3">
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                {(user?.name || "W").charAt(0)}
              </div>
            </div>
          )}
          <button
            onClick={() => navigate("/")}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors`}
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            {!sidebarCollapsed && "Logout"}
          </button>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 shadow-sm hover:shadow transition-all z-10"
        >
          <span className="material-symbols-outlined text-sm">{sidebarCollapsed ? "chevron_right" : "chevron_left"}</span>
        </button>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className={`flex-1 h-screen overflow-y-auto ${sidebarCollapsed ? "ml-[68px]" : "ml-60"} transition-all duration-200`}>
        {/* Top Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {navItems.find(n => n.key === activeSection)?.label || "Dashboard"}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {activeSection === "dashboard" && "Overview of your hostel at a glance"}
              {activeSection === "students" && "All students allocated to your hostel"}
              {activeSection === "allocation" && "Search and assign rooms to students"}
              {activeSection === "complaints" && "Manage and resolve student complaints"}
              {activeSection === "announcements" && "Post and manage hostel announcements"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${wardenProfile?.hostel_type === "Boys" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"}`}>
              {wardenProfile?.hostel_name}
            </span>
            <div className="w-px h-6 bg-gray-200"></div>
            <span className="text-sm text-gray-500 font-medium">{new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</span>
          </div>
        </div>

        <div className="p-8">

          {/* ================= DASHBOARD HOME ================= */}
          {activeSection === "dashboard" && (
            <>
              {/* Stat Cards Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {[
                  { label: "Total Students", value: totalStudents, icon: "group", color: "blue", bg: "bg-blue-50", text: "text-blue-600" },
                  { label: "Room Occupancy", value: `${occupancyPct}%`, icon: "bed", color: "emerald", bg: "bg-emerald-50", text: "text-emerald-600" },
                  { label: "Open Complaints", value: openComplaints, icon: "warning", color: "orange", bg: "bg-orange-50", text: "text-orange-600" },
                  { label: "Announcements", value: announcements.length, icon: "campaign", color: "purple", bg: "bg-purple-50", text: "text-purple-600" },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${s.bg} ${s.text} flex items-center justify-center shrink-0`}>
                      <span className="material-symbols-outlined text-2xl">{s.icon}</span>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-gray-900">{s.value}</p>
                      <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Hostel Info Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-blue-600">info</span>
                    Hostel Information
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: "Hostel Name", value: wardenProfile?.hostel_name, icon: "apartment" },
                      { label: "Type", value: wardenProfile?.hostel_type === "Boys" ? "Boys Hostel" : "Girls Hostel", icon: "wc" },
                      { label: "Year", value: `Year ${wardenProfile?.for_year}`, icon: "school" },
                      { label: "Warden", value: user?.name, icon: "badge" },
                      { label: "Total Rooms", value: totalRooms, icon: "meeting_room" },
                      { label: "Total Capacity", value: `${totalCapacity} beds`, icon: "bed" },
                    ].map(item => (
                      <div key={item.label} className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-base text-gray-400">{item.icon}</span>
                        <div className="flex-1 flex items-center justify-between">
                          <span className="text-xs text-gray-500">{item.label}</span>
                          <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Room Occupancy Breakdown */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-emerald-600">bar_chart</span>
                    Room Occupancy
                  </h3>
                  {/* Occupancy Bar */}
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-gray-500">Occupied</span>
                      <span className="text-sm font-bold text-gray-900">{totalOccupied} / {totalCapacity}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${occupancyPct >= 90 ? "bg-red-500" : occupancyPct >= 60 ? "bg-amber-500" : "bg-emerald-500"}`}
                        style={{ width: `${occupancyPct}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <p className="text-xl font-black text-green-700">{emptyRooms}</p>
                      <p className="text-[10px] text-gray-500 font-semibold uppercase">Empty</p>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-3 text-center">
                      <p className="text-xl font-black text-amber-700">{partialRooms}</p>
                      <p className="text-[10px] text-gray-500 font-semibold uppercase">Partial</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3 text-center">
                      <p className="text-xl font-black text-red-700">{fullRooms}</p>
                      <p className="text-[10px] text-gray-500 font-semibold uppercase">Full</p>
                    </div>
                  </div>
                </div>

                {/* Complaint Summary */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-orange-600">report_problem</span>
                    Complaint Summary
                  </h3>
                  <div className="space-y-3 mb-4">
                    {[
                      { label: "Open", count: openComplaints, color: "bg-red-500" },
                      { label: "In Progress", count: inProgressComplaints, color: "bg-amber-500" },
                      { label: "Resolved", count: resolvedComplaints, color: "bg-green-500" },
                    ].map(s => {
                      const total = complaints.length || 1;
                      return (
                        <div key={s.label}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-500">{s.label}</span>
                            <span className="text-sm font-bold text-gray-900">{s.count}</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className={`h-2 rounded-full ${s.color} transition-all`} style={{ width: `${(s.count / total) * 100}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setActiveSection("complaints")}
                    className="w-full text-center py-2 bg-orange-50 text-orange-700 text-xs font-semibold rounded-lg hover:bg-orange-100 transition-colors"
                  >
                    View All Complaints →
                  </button>
                </div>
              </div>

              {/* Bottom Row: Recent Complaints + Recent Announcements */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Complaints */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg text-red-500">pending_actions</span>
                      Recent Complaints
                    </h3>
                    <button
                      onClick={() => setActiveSection("complaints")}
                      className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      View all
                    </button>
                  </div>
                  {complaints.length === 0 ? (
                    <div className="text-center py-6">
                      <span className="material-symbols-outlined text-4xl text-gray-300">thumb_up</span>
                      <p className="text-sm text-gray-400 mt-1">No complaints</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {complaints.slice(0, 5).map((c) => (
                        <div key={c.complaint_id} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${c.status === "Open" ? "bg-red-500" : c.status === "In Progress" ? "bg-amber-500" : "bg-green-500"}`}></span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{c.name} — {c.category}</p>
                            <p className="text-xs text-gray-500 truncate">{c.description}</p>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${statusColor(c.status)}`}>{c.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Announcements */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg text-purple-500">campaign</span>
                      Recent Announcements
                    </h3>
                    <button
                      onClick={() => setActiveSection("announcements")}
                      className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      View all
                    </button>
                  </div>
                  {announcements.length === 0 ? (
                    <div className="text-center py-6">
                      <span className="material-symbols-outlined text-4xl text-gray-300">notifications_off</span>
                      <p className="text-sm text-gray-400 mt-1">No announcements yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {announcements.slice(0, 5).map((a) => (
                        <div key={a.announcement_id} className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{a.title}</p>
                              <p className="text-xs text-gray-500 truncate mt-0.5">{a.description}</p>
                            </div>
                            {a.hostel_name && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full shrink-0">{a.hostel_name}</span>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-400 mt-1.5">
                            {a.posted_by_name} · {new Date(a.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ================= COMPLAINTS ================= */}
          {activeSection === "complaints" && (
            <>
              {msg && (
                <div className={`mb-4 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 ${msg.includes("success") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                  <span className="material-symbols-outlined text-lg">{msg.includes("success") ? "check_circle" : "error"}</span>
                  {msg}
                </div>
              )}

              {/* Complaint Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Total", count: complaints.length, color: "text-gray-900", border: "border-gray-100" },
                  { label: "Open", count: openComplaints, color: "text-red-600", border: "border-red-100" },
                  { label: "In Progress", count: inProgressComplaints, color: "text-amber-600", border: "border-amber-100" },
                  { label: "Resolved", count: resolvedComplaints, color: "text-green-600", border: "border-green-100" },
                ].map(s => (
                  <div key={s.label} className={`bg-white rounded-xl shadow-sm border ${s.border} p-4 text-center`}>
                    <p className={`text-2xl font-black ${s.color}`}>{s.count}</p>
                    <p className="text-xs text-gray-500 font-semibold uppercase mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : complaints.length === 0 ? (
                  <div className="text-center py-16">
                    <span className="material-symbols-outlined text-5xl text-gray-300 mb-2">thumb_up</span>
                    <p className="text-gray-400 font-medium">No complaints found.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="p-3 text-left text-sm font-semibold text-gray-600">Student</th>
                          <th className="p-3 text-left text-sm font-semibold text-gray-600">Roll No</th>
                          <th className="p-3 text-left text-sm font-semibold text-gray-600">Category</th>
                          <th className="p-3 text-left text-sm font-semibold text-gray-600">Description</th>
                          <th className="p-3 text-center text-sm font-semibold text-gray-600">Status</th>
                          <th className="p-3 text-center text-sm font-semibold text-gray-600">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {complaints.map((c) => (
                          <tr key={c.complaint_id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-3 font-medium text-gray-900">{c.name || "—"}</td>
                            <td className="p-3 text-gray-600 font-mono text-sm">{c.roll_no || "—"}</td>
                            <td className="p-3">
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full capitalize">{c.category}</span>
                            </td>
                            <td className="p-3 text-gray-600 text-sm max-w-[220px] truncate" title={c.description}>{c.description || "—"}</td>
                            <td className="p-3 text-center">
                              <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${statusColor(c.status)}`}>{c.status}</span>
                            </td>
                            <td className="p-3 text-center">
                              <select
                                className="border border-gray-200 px-3 py-1.5 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer"
                                value={c.status}
                                onChange={(e) => updateStatus(c.complaint_id, e.target.value)}
                              >
                                <option>Open</option>
                                <option>In Progress</option>
                                <option>Resolved</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ================= STUDENTS ================= */}
          {activeSection === "students" && (
            <>
              {/* Search & Filter Bar */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-5">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="flex-1 relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                    <input
                      type="text"
                      className="w-full border border-gray-200 pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                      placeholder="Search by name, roll number, or branch..."
                      value={studentSearchQ}
                      onChange={(e) => setStudentSearchQ(e.target.value)}
                    />
                  </div>
                  {studentSearchQ && (
                    <button
                      onClick={() => setStudentSearchQ("")}
                      className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {(() => {
                const q = studentSearchQ.toLowerCase().trim();
                const filtered = q
                  ? students.filter(s =>
                    (s.name || "").toLowerCase().includes(q) ||
                    (s.roll_no || "").toLowerCase().includes(q) ||
                    (s.course || "").toLowerCase().includes(q)
                  )
                  : students;

                return (
                  <>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
                        {filtered.length} student{filtered.length !== 1 ? "s" : ""}{q ? " found" : ""}
                      </span>
                      {q && filtered.length !== students.length && (
                        <span className="text-xs text-gray-400">out of {students.length} total</span>
                      )}
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                      {filtered.length === 0 ? (
                        <div className="text-center py-16">
                          <span className="material-symbols-outlined text-5xl text-gray-300 mb-2">{q ? "search_off" : "group_off"}</span>
                          <p className="text-gray-400 font-medium">{q ? "No students match your search." : "No students found."}</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="p-3 text-left text-sm font-semibold text-gray-600">Name</th>
                                <th className="p-3 text-left text-sm font-semibold text-gray-600">Roll No</th>
                                <th className="p-3 text-left text-sm font-semibold text-gray-600">Course</th>
                                <th className="p-3 text-left text-sm font-semibold text-gray-600">Year</th>
                                <th className="p-3 text-left text-sm font-semibold text-gray-600">Gender</th>
                                <th className="p-3 text-left text-sm font-semibold text-gray-600">Phone</th>
                                <th className="p-3 text-left text-sm font-semibold text-gray-600">Guardian Phone</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {filtered.map((s) => (
                                <tr key={s.student_id} className="hover:bg-gray-50 transition-colors">
                                  <td className="p-3 font-medium text-gray-900">{s.name || "—"}</td>
                                  <td className="p-3 text-gray-600 font-mono text-sm">{s.roll_no || "—"}</td>
                                  <td className="p-3 text-gray-600">{s.course || "—"}</td>
                                  <td className="p-3 text-gray-600">{s.year || "—"}</td>
                                  <td className="p-3">
                                    {s.gender ? (
                                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${s.gender === "Male" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"}`}>
                                        {s.gender === "Male" ? "Boy" : "Girl"}
                                      </span>
                                    ) : "—"}
                                  </td>
                                  <td className="p-3 text-gray-600">
                                    {s.phone ? <a href={`tel:${s.phone}`} className="text-blue-600 hover:underline">{s.phone}</a> : "—"}
                                  </td>
                                  <td className="p-3 text-gray-600">
                                    {s.guardian_phone ? <a href={`tel:${s.guardian_phone}`} className="text-blue-600 hover:underline">{s.guardian_phone}</a> : "—"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </>
          )}

          {/* ================= ROOM ALLOCATION ================= */}
          {activeSection === "allocation" && (
            <>
              {allocMsg && (
                <div className={`mb-5 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 ${allocMsg.includes("success") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                  <span className="material-symbols-outlined text-lg">{allocMsg.includes("success") ? "check_circle" : "error"}</span>
                  {allocMsg}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Search & Select Student */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-600">person_search</span>
                    Find Student
                  </h3>
                  <div className="relative mb-3">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                    <input
                      type="text"
                      className="w-full border border-gray-200 pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                      placeholder="Search by Roll Number..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                  </div>
                  {searchResults.length > 0 && (
                    <div className="border border-gray-200 rounded-lg mb-4 max-h-44 overflow-y-auto divide-y divide-gray-100">
                      {searchResults.map((s) => (
                        <div
                          key={s.student_id}
                          className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors flex items-center gap-3"
                          onClick={() => { setSelectedStudent(s); setSearchQuery(`${s.name} | ${s.roll_no}`); setSearchResults([]); }}
                        >
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-bold shrink-0">
                            {(s.name || "S").charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{s.name}</p>
                            <p className="text-xs text-gray-500">{s.roll_no} · Year {s.year} · {s.course || "—"}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedStudent && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold">
                          {(selectedStudent.name || "S").charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{selectedStudent.name}</p>
                          <p className="text-xs text-gray-600">{selectedStudent.roll_no} · Year {selectedStudent.year}</p>
                        </div>
                      </div>
                      <button onClick={() => { setSelectedStudent(null); setSearchQuery(""); }} className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-blue-100 transition-colors">
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Select Room & Allocate */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600">meeting_room</span>
                    Select Room
                  </h3>
                  <select
                    className="w-full border border-gray-200 px-4 py-3 rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none mb-4 cursor-pointer"
                    value={selectedRoom}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                  >
                    <option value="">— Select a Room —</option>
                    {rooms.map((r) => {
                      const full = r.occupied_count >= r.capacity;
                      return (
                        <option key={r.room_id} value={r.room_id} disabled={full}>
                          Room {r.room_number} — {r.occupied_count}/{r.capacity} {full ? "(Full)" : `(${r.capacity - r.occupied_count} available)`}
                        </option>
                      );
                    })}
                  </select>
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <p className="text-lg font-black text-green-700">{emptyRooms}</p>
                      <p className="text-[10px] text-gray-500 font-semibold uppercase">Empty</p>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-3 text-center">
                      <p className="text-lg font-black text-amber-700">{partialRooms}</p>
                      <p className="text-[10px] text-gray-500 font-semibold uppercase">Partial</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3 text-center">
                      <p className="text-lg font-black text-red-700">{fullRooms}</p>
                      <p className="text-[10px] text-gray-500 font-semibold uppercase">Full</p>
                    </div>
                  </div>
                  <button
                    disabled={!selectedStudent || !selectedRoom}
                    className={`w-full py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${!selectedStudent || !selectedRoom
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
                      }`}
                    onClick={async () => {
                      setAllocMsg("");
                      try {
                        await api.post("/allocate", { student_id: selectedStudent.student_id, room_id: selectedRoom });
                        setAllocMsg("Room allocated successfully!");
                        setSelectedStudent(null);
                        setSelectedRoom("");
                        setSearchQuery("");
                        fetchStudents();
                        fetchRooms();
                        setTimeout(() => setAllocMsg(""), 4000);
                      } catch (err) {
                        setAllocMsg(err.response?.data?.message || "Allocation failed");
                        setTimeout(() => setAllocMsg(""), 4000);
                      }
                    }}
                  >
                    <span className="material-symbols-outlined text-lg">check_circle</span>
                    Allocate Room
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ================= ANNOUNCEMENTS ================= */}
          {activeSection === "announcements" && (
            <>
              {/* Post Announcement Form */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-purple-600">edit_note</span>
                  Post New Announcement
                </h3>
                {annMsg && (
                  <div className={`mb-4 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 ${annMsg.includes("success") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                    <span className="material-symbols-outlined text-lg">{annMsg.includes("success") ? "check_circle" : "error"}</span>
                    {annMsg}
                  </div>
                )}
                <div className="space-y-3">
                  <input
                    type="text"
                    className="w-full border border-gray-200 p-3 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    placeholder="Announcement title"
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                  />
                  <textarea
                    className="w-full border border-gray-200 p-3 rounded-lg text-sm resize-y focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    rows="3"
                    placeholder="Write your announcement here..."
                    value={annDesc}
                    onChange={(e) => setAnnDesc(e.target.value)}
                  />
                  <button
                    onClick={async () => {
                      setAnnMsg("");
                      if (!annTitle.trim() || !annDesc.trim()) { setAnnMsg("Title and description are required"); return; }
                      try {
                        await api.post("/announcement", { title: annTitle, description: annDesc, posted_by: user.user_id, hostel_id: wardenProfile?.hostel_id });
                        setAnnMsg("Announcement posted successfully!");
                        setAnnTitle("");
                        setAnnDesc("");
                        fetchAnnouncements();
                        setTimeout(() => setAnnMsg(""), 3000);
                      } catch (err) {
                        setAnnMsg("Failed to post announcement");
                        setTimeout(() => setAnnMsg(""), 3000);
                      }
                    }}
                    className="bg-purple-600 text-white px-6 py-2.5 rounded-lg hover:bg-purple-700 transition font-bold text-sm flex items-center gap-2 shadow-lg shadow-purple-600/20"
                  >
                    <span className="material-symbols-outlined text-lg">send</span>
                    Post Announcement
                  </button>
                </div>
              </div>

              {/* Announcements List */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600">campaign</span>
                  All Announcements
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 text-xs font-bold rounded-full ml-1">{announcements.length}</span>
                </h3>
                {announcements.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="material-symbols-outlined text-5xl text-gray-300 mb-2">notifications_off</span>
                    <p className="text-gray-400 font-medium">No announcements yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {announcements.map((a) => (
                      <div key={a.announcement_id} className="p-4 border border-gray-100 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h4 className="font-bold text-gray-900">{a.title}</h4>
                              {a.hostel_name && (
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full">{a.hostel_name}</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{a.description}</p>
                            <p className="text-xs text-gray-400 flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">person</span>
                              {a.posted_by_name} ({a.posted_by_role}) ·{" "}
                              <span className="material-symbols-outlined text-xs">schedule</span>
                              {new Date(a.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                          <button
                            onClick={() => deleteAnnouncement(a.announcement_id)}
                            className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors shrink-0"
                            title="Delete announcement"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
}
