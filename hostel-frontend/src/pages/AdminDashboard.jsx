import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function AdminDashboard({ user }) {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState("dashboard");
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Announcements
    const [announcements, setAnnouncements] = useState([]);
    const [annTitle, setAnnTitle] = useState("");
    const [annDesc, setAnnDesc] = useState("");
    const [annMsg, setAnnMsg] = useState("");

    // Fee structure
    const [feeData, setFeeData] = useState([]);
    const [feeYear, setFeeYear] = useState("1");
    const [feeGender, setFeeGender] = useState("Male");
    const [feeComponent, setFeeComponent] = useState("");
    const [feeAmount, setFeeAmount] = useState("");
    const [feePeriodFrom, setFeePeriodFrom] = useState("");
    const [feePeriodTo, setFeePeriodTo] = useState("");
    const [feeMsg, setFeeMsg] = useState("");
    const [editingFee, setEditingFee] = useState(null);
    // Local staging for new components
    const [stagedFees, setStagedFees] = useState([]);
    // Confirmation modals
    const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
    const [deleteFeeTarget, setDeleteFeeTarget] = useState(null);
    const [submittingFees, setSubmittingFees] = useState(false);

    // Warden management
    const [wardens, setWardens] = useState([]);
    const [hostels, setHostels] = useState([]);
    const [wardenEmail, setWardenEmail] = useState("");
    const [wardenName, setWardenName] = useState("");
    const [wardenHostelId, setWardenHostelId] = useState("");
    const [wardenMsg, setWardenMsg] = useState("");

    // Student management
    const [students, setStudents] = useState([]);
    const [studentSearch, setStudentSearch] = useState("");
    const [studentYear, setStudentYear] = useState("");
    const [studentGender, setStudentGender] = useState("");
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [studentDetail, setStudentDetail] = useState(null);
    const [deallocateTarget, setDeallocateTarget] = useState(null);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [studentFetchTrigger, setStudentFetchTrigger] = useState(0);

    // Room Allocation (Admin)
    const [allocHostelId, setAllocHostelId] = useState("");
    const [allocSearchQuery, setAllocSearchQuery] = useState("");
    const [allocSearchResults, setAllocSearchResults] = useState([]);
    const [allocSelectedStudent, setAllocSelectedStudent] = useState(null);
    const [allocSelectedRoom, setAllocSelectedRoom] = useState("");
    const [allocRooms, setAllocRooms] = useState([]);
    const [allocMsg, setAllocMsg] = useState("");

    // Complaints Management (Admin)
    const [adminComplaints, setAdminComplaints] = useState([]);
    const [complaintMsg, setComplaintMsg] = useState("");
    const [complaintStatusFilter, setComplaintStatusFilter] = useState("all");
    const [complaintsLoading, setComplaintsLoading] = useState(false);

    // Hostel management
    const [adminHostels, setAdminHostels] = useState([]);
    const [selectedHostel, setSelectedHostel] = useState(null);
    const [hostelRooms, setHostelRooms] = useState([]);
    const [showAddHostel, setShowAddHostel] = useState(false);
    const [newHostelName, setNewHostelName] = useState("");
    const [newHostelType, setNewHostelType] = useState("Boys");
    const [newHostelYear, setNewHostelYear] = useState("1");
    const [hostelMsg, setHostelMsg] = useState("");
    const [addRoomStart, setAddRoomStart] = useState("");
    const [addRoomEnd, setAddRoomEnd] = useState("");
    const [addRoomCapacity, setAddRoomCapacity] = useState("4");
    const [deleteRoomTarget, setDeleteRoomTarget] = useState(null);

    // Reports
    const [reportType, setReportType] = useState("occupancy");
    const [occupancyReport, setOccupancyReport] = useState([]);
    const [feeReport, setFeeReport] = useState([]);
    const [complaintReport, setComplaintReport] = useState([]);

    // System Settings
    const [settings, setSettings] = useState({});
    const [settingsForm, setSettingsForm] = useState({});
    const [settingsMsg, setSettingsMsg] = useState("");
    const [settingsSaving, setSettingsSaving] = useState(false);

    // Gallery Management
    const [galleryImages, setGalleryImages] = useState([]);
    const [galleryMsg, setGalleryMsg] = useState("");
    const [galleryCategory, setGalleryCategory] = useState("main");
    const [galleryCaption, setGalleryCaption] = useState("");
    const [galleryFile, setGalleryFile] = useState(null);
    const [galleryUploading, setGalleryUploading] = useState(false);

    useEffect(() => {
        fetchAnnouncements();
        fetchWardens();
        fetchHostels();
    }, []);

    useEffect(() => {
        if (activeSection === "fees") fetchFeeStructure();
        if (activeSection === "wardens") { fetchWardens(); fetchHostels(); }
        if (activeSection === "hostels") fetchAdminHostels();
        if (activeSection === "allocation") fetchHostels();
        if (activeSection === "complaints") fetchAdminComplaints();
        if (activeSection === "reports") { fetchOccupancyReport(); fetchFeeReport(); fetchComplaintReport(); }
        if (activeSection === "settings") fetchSettings();
        if (activeSection === "gallery") fetchAdminGallery();
    }, [activeSection, feeYear, feeGender]);

    useEffect(() => {
        if (activeSection === "students") fetchStudents();
    }, [activeSection, studentFetchTrigger]);

    const fetchAnnouncements = async () => {
        try {
            const res = await api.get("/announcements");
            setAnnouncements(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const deleteAnnouncement = async (id) => {
        if (!window.confirm("Are you sure you want to delete this announcement?")) return;
        try {
            await api.delete(`/announcement/${id}`);
            fetchAnnouncements();
        } catch (err) {
            console.error(err);
        }
    };

    const fetchFeeStructure = async () => {
        try {
            const res = await api.get(`/fee-structure?year=${feeYear}&gender=${feeGender}`);
            setFeeData(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchWardens = async () => {
        try {
            const res = await api.get("/admin/wardens");
            setWardens(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchHostels = async () => {
        try {
            const res = await api.get("/hostels");
            setHostels(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    // Student management
    const fetchStudents = async () => {
        setStudentsLoading(true);
        try {
            const params = new URLSearchParams();
            if (studentYear) params.append("year", studentYear);
            if (studentGender) params.append("gender", studentGender);
            if (studentSearch.trim()) params.append("search", studentSearch.trim());
            const res = await api.get(`/admin/students?${params.toString()}`);
            setStudents(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setStudentsLoading(false);
        }
    };

    const fetchStudentDetail = async (studentId) => {
        try {
            const res = await api.get(`/admin/student/${studentId}`);
            setStudentDetail(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    // Hostel management
    const fetchAdminHostels = async () => {
        try {
            const res = await api.get("/admin/hostels");
            setAdminHostels(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchHostelRooms = async (hostelId) => {
        try {
            const res = await api.get(`/admin/hostel/${hostelId}/rooms`);
            setHostelRooms(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const addHostel = async () => {
        setHostelMsg("");
        if (!newHostelName.trim()) { setHostelMsg("Hostel name is required"); return; }
        try {
            await api.post("/admin/hostel", {
                hostel_name: newHostelName.trim(),
                hostel_type: newHostelType,
                for_year: Number(newHostelYear),
            });
            setHostelMsg("Hostel created successfully!");
            setNewHostelName(""); setShowAddHostel(false);
            fetchAdminHostels();
        } catch (err) {
            setHostelMsg(err.response?.data?.message || "Failed to create hostel");
        }
    };

    const addRoomsToHostel = async () => {
        setHostelMsg("");
        if (!addRoomStart || !addRoomEnd || !addRoomCapacity) {
            setHostelMsg("Room number range and capacity are required");
            return;
        }
        const start = parseInt(addRoomStart);
        const end = parseInt(addRoomEnd);
        if (isNaN(start) || isNaN(end) || start > end) {
            setHostelMsg("Invalid room number range");
            return;
        }
        const rooms = [];
        for (let i = start; i <= end; i++) {
            rooms.push({ room_number: String(i), capacity: Number(addRoomCapacity) });
        }
        try {
            await api.post(`/admin/hostel/${selectedHostel.hostel_id}/rooms`, { rooms });
            setHostelMsg(`${rooms.length} room(s) added successfully!`);
            setAddRoomStart(""); setAddRoomEnd("");
            fetchHostelRooms(selectedHostel.hostel_id);
            fetchAdminHostels();
        } catch (err) {
            setHostelMsg(err.response?.data?.message || "Failed to add rooms");
        }
    };

    const deleteRoom = async () => {
        if (!deleteRoomTarget) return;
        try {
            await api.delete(`/admin/room/${deleteRoomTarget.room_id}`);
            setDeleteRoomTarget(null);
            fetchHostelRooms(selectedHostel.hostel_id);
            fetchAdminHostels();
        } catch (err) {
            setHostelMsg(err.response?.data?.message || "Failed to delete room");
            setDeleteRoomTarget(null);
        }
    };

    // Room Allocation (Admin)
    const fetchAllocRooms = async (hostelId) => {
        try {
            const res = await api.get(`/warden/rooms?hostel_id=${hostelId}`);
            setAllocRooms(res.data);
        } catch (err) { console.error(err); }
    };

    const handleAllocSearch = async (value) => {
        setAllocSearchQuery(value);
        if (value.length < 2 || !allocHostelId) { setAllocSearchResults([]); return; }
        try {
            const res = await api.get(`/admin/search-students-for-allocation?q=${value}&hostel_id=${allocHostelId}`);
            setAllocSearchResults(res.data);
        } catch (err) { console.error(err); }
    };

    // Complaints Management (Admin)
    const fetchAdminComplaints = async () => {
        setComplaintsLoading(true);
        try {
            const res = await api.get("/complaints");
            setAdminComplaints(res.data);
        } catch (err) { console.error(err); }
        finally { setComplaintsLoading(false); }
    };

    const updateComplaintStatus = async (complaint_id, status) => {
        try {
            await api.put(`/complaint/${complaint_id}`, { status });
            setComplaintMsg("Status updated successfully");
            fetchAdminComplaints();
            setTimeout(() => setComplaintMsg(""), 3000);
        } catch {
            setComplaintMsg("Failed to update complaint");
            setTimeout(() => setComplaintMsg(""), 3000);
        }
    };

    // Reports
    const fetchOccupancyReport = async () => {
        try { const res = await api.get("/admin/reports/occupancy"); setOccupancyReport(res.data); } catch (err) { console.error(err); }
    };
    const fetchFeeReport = async () => {
        try { const res = await api.get("/admin/reports/fees"); setFeeReport(res.data); } catch (err) { console.error(err); }
    };
    const fetchComplaintReport = async () => {
        try { const res = await api.get("/admin/reports/complaints"); setComplaintReport(res.data); } catch (err) { console.error(err); }
    };

    // System Settings
    const fetchSettings = async () => {
        try {
            const res = await api.get("/admin/settings");
            setSettings(res.data);
            setSettingsForm(res.data);
        } catch (err) { console.error(err); }
    };
    const saveSettings = async () => {
        setSettingsMsg(""); setSettingsSaving(true);
        try {
            await api.put("/admin/settings", settingsForm);
            setSettings({ ...settingsForm });
            setSettingsMsg("Settings saved successfully!");
        } catch (err) {
            setSettingsMsg(err.response?.data?.message || "Failed to save settings");
        } finally { setSettingsSaving(false); }
    };

    // Gallery
    const fetchAdminGallery = async () => {
        try {
            const res = await api.get("/public/gallery");
            setGalleryImages(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const uploadGalleryImage = async (e) => {
        e.preventDefault();
        setGalleryMsg("");
        if (!galleryFile) {
            setGalleryMsg("Please select an image to upload");
            return;
        }

        const formData = new FormData();
        formData.append("image", galleryFile);
        formData.append("category", galleryCategory);
        if (galleryCaption) formData.append("caption", galleryCaption);

        setGalleryUploading(true);
        try {
            await api.post("/admin/gallery", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setGalleryMsg("Image uploaded successfully!");
            setGalleryFile(null);
            setGalleryCaption("");
            // Reset file input if needed - easy way is to clear it via ref but here we just reset state
            fetchAdminGallery();
        } catch (err) {
            setGalleryMsg(err.response?.data?.message || "Upload failed");
        } finally {
            setGalleryUploading(false);
        }
    };

    const deleteGalleryImage = async (id) => {
        if (!window.confirm("Are you sure you want to delete this image?")) return;
        try {
            await api.delete(`/admin/gallery/${id}`);
            fetchAdminGallery();
        } catch (err) {
            console.error("Failed to delete", err);
        }
    };

    const deallocateStudent = async () => {
        if (!deallocateTarget) return;
        try {
            await api.delete(`/admin/student/${deallocateTarget.student_id}/deallocate`);
            setDeallocateTarget(null);
            setStudentDetail(null);
            setSelectedStudent(null);
            fetchStudents();
        } catch (err) {
            console.error(err);
        }
    };

    const addWarden = async () => {
        setWardenMsg("");
        if (!wardenEmail.trim() || !wardenHostelId) {
            setWardenMsg("Email and hostel are required");
            return;
        }
        try {
            await api.post("/admin/warden", {
                email: wardenEmail,
                name: wardenName || undefined,
                hostel_id: Number(wardenHostelId),
            });
            setWardenMsg("Warden assigned successfully!");
            setWardenEmail(""); setWardenName(""); setWardenHostelId("");
            fetchWardens();
        } catch (err) {
            setWardenMsg(err.response?.data?.message || "Failed to add warden");
        }
    };

    const deleteWarden = async (wardenId) => {
        if (!window.confirm("Remove this warden?")) return;
        try {
            await api.delete(`/admin/warden/${wardenId}`);
            fetchWardens();
        } catch (err) {
            console.error(err);
        }
    };

    const addFeeComponent = () => {
        setFeeMsg("");
        if (!feeComponent.trim() || !feeAmount) {
            setFeeMsg("Component name and amount are required");
            return;
        }
        if (!feePeriodFrom || !feePeriodTo) {
            setFeeMsg("Please select the semester period at the top first");
            return;
        }
        setStagedFees([...stagedFees, {
            id: Date.now(),
            component: feeComponent.trim(),
            amount: Number(feeAmount),
        }]);
        setFeeComponent("");
        setFeeAmount("");
    };

    const removeStagedFee = (id) => {
        setStagedFees(stagedFees.filter(f => f.id !== id));
    };

    const submitStagedFees = async () => {
        setSubmittingFees(true);
        setFeeMsg("");
        try {
            for (const item of stagedFees) {
                await api.post("/fee-structure", {
                    year: feeYear,
                    gender: feeGender,
                    component: item.component,
                    fee_type: "Semester",
                    amount: item.amount,
                    period_from: feePeriodFrom,
                    period_to: feePeriodTo,
                });
            }
            setFeeMsg(`${stagedFees.length} fee component${stagedFees.length !== 1 ? 's' : ''} added successfully!`);
            setStagedFees([]);
            fetchFeeStructure();
        } catch (err) {
            setFeeMsg(err.response?.data?.message || "Failed to submit fee components");
        } finally {
            setSubmittingFees(false);
            setShowSubmitConfirm(false);
        }
    };

    const confirmDeleteFee = async () => {
        if (!deleteFeeTarget) return;
        try {
            await api.delete(`/fee-structure/${deleteFeeTarget.id}`);
            fetchFeeStructure();
        } catch (err) {
            console.error(err);
        } finally {
            setDeleteFeeTarget(null);
        }
    };

    const saveEditFee = async () => {
        if (!editingFee) return;
        try {
            await api.put(`/fee-structure/${editingFee.id}`, {
                component: editingFee.component,
                fee_type: "Semester",
                amount: Number(editingFee.amount),
                period_from: editingFee.period_from || null,
                period_to: editingFee.period_to || null,
            });
            setEditingFee(null);
            fetchFeeStructure();
        } catch (err) {
            console.error(err);
        }
    };

    const navItems = [
        { key: "dashboard", icon: "dashboard", label: "Dashboard" },
        { key: "students", icon: "group", label: "Students" },
        { key: "allocation", icon: "door_open", label: "Room Allocation" },
        { key: "complaints", icon: "report_problem", label: "Complaints" },
        { key: "wardens", icon: "supervisor_account", label: "Wardens" },
        { key: "hostels", icon: "apartment", label: "Hostels" },
        { key: "fees", icon: "payments", label: "Fee Structure" },
        { key: "reports", icon: "bar_chart", label: "Reports" },
        { key: "announcements", icon: "campaign", label: "Announcements" },
        { key: "gallery", icon: "collections", label: "Gallery" },
        { key: "settings", icon: "settings", label: "Settings" },
    ];

    // Allocation stats
    const allocEmptyRooms = allocRooms.filter(r => r.occupied_count === 0).length;
    const allocPartialRooms = allocRooms.filter(r => r.occupied_count > 0 && r.occupied_count < r.capacity).length;
    const allocFullRooms = allocRooms.filter(r => r.occupied_count >= r.capacity).length;

    // Complaint stats
    const openComplaints = adminComplaints.filter(c => c.status === "Open").length;
    const inProgressComplaints = adminComplaints.filter(c => c.status === "In Progress").length;
    const resolvedComplaints = adminComplaints.filter(c => c.status === "Resolved").length;

    const statusColor = (status) => {
        if (status === "Open") return "bg-red-100 text-red-700";
        if (status === "In Progress") return "bg-amber-100 text-amber-700";
        return "bg-green-100 text-green-700";
    };

    // Valid year-gender combinations
    const validCombos = [
        { year: 1, gender: "Male", label: "Year 1 — Boys (4 Sharing)" },
        { year: 1, gender: "Female", label: "Year 1 — Girls (4 Sharing)" },
        { year: 2, gender: "Female", label: "Year 2 — Girls (2 Sharing)" },
        { year: 3, gender: "Female", label: "Year 3 — Girls (2 Sharing)" },
        { year: 4, gender: "Female", label: "Year 4 — Girls (2 Sharing)" },
    ];

    const totalFee = feeData.reduce((sum, f) => sum + Number(f.amount), 0);

    return (
        <div className="h-screen overflow-hidden bg-gray-50 flex">
            {/* ================= SIDEBAR ================= */}
            <aside className={`${sidebarCollapsed ? "w-[68px]" : "w-60"} bg-white border-r border-gray-200 flex flex-col fixed top-0 left-0 h-screen transition-all duration-200 z-30`}>
                {/* Logo / Brand */}
                <div className="px-4 py-5 border-b border-gray-100 flex items-center gap-3 min-h-[72px]">
                    <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
                    </div>
                    {!sidebarCollapsed && (
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-gray-900 truncate">Admin Panel</p>
                            <p className="text-[10px] text-gray-500 font-medium">Hostel Management</p>
                        </div>
                    )}
                </div>

                {/* Nav Links */}
                <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
                    {navItems.map((item) => (
                        <button
                            key={item.key}
                            onClick={() => setActiveSection(item.key)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeSection === item.key
                                ? "bg-indigo-50 text-indigo-700"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                            title={sidebarCollapsed ? item.label : ""}
                        >
                            <span className={`material-symbols-outlined text-xl ${activeSection === item.key ? "text-indigo-600" : "text-gray-400"}`}>{item.icon}</span>
                            {!sidebarCollapsed && item.label}
                        </button>
                    ))}
                </nav>

                {/* Admin Info */}
                <div className="border-t border-gray-100 p-3">
                    {!sidebarCollapsed ? (
                        <div className="flex items-center gap-2.5 mb-3">
                            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                                {(user?.name || "A").charAt(0)}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || "Admin"}</p>
                                <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-center mb-3">
                            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                                {(user?.name || "A").charAt(0)}
                            </div>
                        </div>
                    )}
                    <button
                        onClick={() => {
                            if (window.confirm("Are you sure you want to logout?")) {
                                localStorage.removeItem("hostel_user");
                                window.location.href = "/";
                            }
                        }}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
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
                            {activeSection === "dashboard" && "Overview of your hostel system at a glance"}
                            {activeSection === "students" && "View, search, and manage all hostel students"}
                            {activeSection === "allocation" && "Search and assign rooms to students across all hostels"}
                            {activeSection === "complaints" && "View and manage all student complaints"}
                            {activeSection === "wardens" && "Assign wardens to hostels and manage their access"}
                            {activeSection === "hostels" && "Add or edit hostel blocks, rooms, and capacity"}
                            {activeSection === "fees" && "Configure hostel fee structures year & gender wise"}
                            {activeSection === "reports" && "Generate occupancy, fee, and complaint reports"}
                            {activeSection === "announcements" && "Post and manage hostel announcements"}
                            {activeSection === "gallery" && "Manage website gallery images and slideshow"}
                            {activeSection === "settings" && "Global configuration, academic year, and policies"}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700">Admin</span>
                        <div className="w-px h-6 bg-gray-200"></div>
                        <span className="text-sm text-gray-500 font-medium">{new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>
                </div>

                <div className="p-8">

                    {/* ================= DASHBOARD HOME ================= */}
                    {activeSection === "dashboard" && (
                        <>
                            {/* Quick Stats Row */}
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                                {[
                                    { label: "Total Announcements", value: announcements.length, icon: "campaign", bg: "bg-purple-50", text: "text-purple-600" },
                                    { label: "Active Wardens", value: wardens.length || "—", icon: "supervisor_account", bg: "bg-indigo-50", text: "text-indigo-600" },
                                    { label: "System Status", value: "Active", icon: "check_circle", bg: "bg-emerald-50", text: "text-emerald-600" },
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

                            {/* Quick Access Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                {[
                                    { icon: "group", label: "Students", key: "students", bg: "bg-blue-50", text: "text-blue-600", hover: "hover:bg-blue-100" },
                                    { icon: "apartment", label: "Hostels", key: "hostels", bg: "bg-emerald-50", text: "text-emerald-600", hover: "hover:bg-emerald-100" },
                                    { icon: "collections", label: "Gallery", key: "gallery", bg: "bg-pink-50", text: "text-pink-600", hover: "hover:bg-pink-100" },
                                    { icon: "payments", label: "Fees", key: "fees", bg: "bg-amber-50", text: "text-amber-600", hover: "hover:bg-amber-100" },
                                    { icon: "bar_chart", label: "Reports", key: "reports", bg: "bg-purple-50", text: "text-purple-600", hover: "hover:bg-purple-100" },
                                ].map((item) => (
                                    <button
                                        key={item.key}
                                        onClick={() => setActiveSection(item.key)}
                                        className={`${item.bg} ${item.hover} rounded-xl p-5 flex flex-col items-center gap-2 transition-all group`}
                                    >
                                        <span className={`material-symbols-outlined text-3xl ${item.text} group-hover:scale-110 transition-transform`}>{item.icon}</span>
                                        <span className="text-sm font-bold text-gray-700">{item.label}</span>
                                    </button>
                                ))}
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
                        </>
                    )}

                    {/* ================= ROOM ALLOCATION (ADMIN) ================= */}
                    {activeSection === "allocation" && (
                        <>
                            {allocMsg && (
                                <div className={`mb-5 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 ${allocMsg.includes("success") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                                    <span className="material-symbols-outlined text-lg">{allocMsg.includes("success") ? "check_circle" : "error"}</span>
                                    {allocMsg}
                                </div>
                            )}

                            {/* Hostel Selector */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-indigo-600 text-lg">apartment</span>
                                    Select Hostel
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {hostels.map((h) => (
                                        <button
                                            key={h.hostel_id}
                                            onClick={() => {
                                                setAllocHostelId(String(h.hostel_id));
                                                fetchAllocRooms(h.hostel_id);
                                                setAllocSelectedStudent(null);
                                                setAllocSelectedRoom("");
                                                setAllocSearchQuery("");
                                                setAllocSearchResults([]);
                                                setAllocMsg("");
                                            }}
                                            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                                allocHostelId === String(h.hostel_id)
                                                    ? "bg-indigo-600 text-white shadow-md"
                                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            }`}
                                        >
                                            {h.hostel_name} (Year {h.for_year})
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {allocHostelId ? (
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
                                                value={allocSearchQuery}
                                                onChange={(e) => handleAllocSearch(e.target.value)}
                                            />
                                        </div>
                                        {allocSearchResults.length > 0 && (
                                            <div className="border border-gray-200 rounded-lg mb-4 max-h-44 overflow-y-auto divide-y divide-gray-100">
                                                {allocSearchResults.map((s) => (
                                                    <div
                                                        key={s.student_id}
                                                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors flex items-center gap-3"
                                                        onClick={() => { setAllocSelectedStudent(s); setAllocSearchQuery(`${s.name} | ${s.roll_no}`); setAllocSearchResults([]); }}
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
                                        {allocSelectedStudent && (
                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 font-bold">
                                                        {(allocSelectedStudent.name || "S").charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{allocSelectedStudent.name}</p>
                                                        <p className="text-xs text-gray-600">{allocSelectedStudent.roll_no} · Year {allocSelectedStudent.year}</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => { setAllocSelectedStudent(null); setAllocSearchQuery(""); }} className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-blue-100 transition-colors">
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
                                            value={allocSelectedRoom}
                                            onChange={(e) => setAllocSelectedRoom(e.target.value)}
                                        >
                                            <option value="">— Select a Room —</option>
                                            {allocRooms.map((r) => {
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
                                                <p className="text-lg font-black text-green-700">{allocEmptyRooms}</p>
                                                <p className="text-[10px] text-gray-500 font-semibold uppercase">Empty</p>
                                            </div>
                                            <div className="bg-amber-50 rounded-lg p-3 text-center">
                                                <p className="text-lg font-black text-amber-700">{allocPartialRooms}</p>
                                                <p className="text-[10px] text-gray-500 font-semibold uppercase">Partial</p>
                                            </div>
                                            <div className="bg-red-50 rounded-lg p-3 text-center">
                                                <p className="text-lg font-black text-red-700">{allocFullRooms}</p>
                                                <p className="text-[10px] text-gray-500 font-semibold uppercase">Full</p>
                                            </div>
                                        </div>
                                        <button
                                            disabled={!allocSelectedStudent || !allocSelectedRoom}
                                            className={`w-full py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${!allocSelectedStudent || !allocSelectedRoom
                                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
                                            }`}
                                            onClick={async () => {
                                                setAllocMsg("");
                                                try {
                                                    await api.post("/allocate", { student_id: allocSelectedStudent.student_id, room_id: allocSelectedRoom });
                                                    setAllocMsg("Room allocated successfully!");
                                                    setAllocSelectedStudent(null);
                                                    setAllocSelectedRoom("");
                                                    setAllocSearchQuery("");
                                                    fetchAllocRooms(allocHostelId);
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
                            ) : (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                                    <span className="material-symbols-outlined text-5xl text-gray-300 mb-2">apartment</span>
                                    <p className="text-gray-400 font-medium">Select a hostel above to start allocating rooms.</p>
                                </div>
                            )}
                        </>
                    )}

                    {/* ================= COMPLAINTS MANAGEMENT (ADMIN) ================= */}
                    {activeSection === "complaints" && (
                        <>
                            {complaintMsg && (
                                <div className={`mb-4 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 ${complaintMsg.includes("success") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                                    <span className="material-symbols-outlined text-lg">{complaintMsg.includes("success") ? "check_circle" : "error"}</span>
                                    {complaintMsg}
                                </div>
                            )}

                            {/* Complaint Stats */}
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                                {[
                                    { label: "Total", count: adminComplaints.length, color: "text-gray-900", border: "border-gray-100" },
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

                            {/* Status Filter Tabs */}
                            <div className="flex gap-2 mb-5">
                                {[
                                    { key: "all", label: "All" },
                                    { key: "Open", label: "Open" },
                                    { key: "In Progress", label: "In Progress" },
                                    { key: "Resolved", label: "Resolved" },
                                ].map(t => (
                                    <button
                                        key={t.key}
                                        onClick={() => setComplaintStatusFilter(t.key)}
                                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                                            complaintStatusFilter === t.key
                                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                                                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                                        }`}
                                    >
                                        {t.label}
                                    </button>
                                ))}
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                {complaintsLoading ? (
                                    <div className="flex items-center justify-center py-16">
                                        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : (() => {
                                    const filtered = complaintStatusFilter === "all"
                                        ? adminComplaints
                                        : adminComplaints.filter(c => c.status === complaintStatusFilter);
                                    return filtered.length === 0 ? (
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
                                                        <th className="p-3 text-left text-sm font-semibold text-gray-600">Year</th>
                                                        <th className="p-3 text-left text-sm font-semibold text-gray-600">Category</th>
                                                        <th className="p-3 text-left text-sm font-semibold text-gray-600">Description</th>
                                                        <th className="p-3 text-center text-sm font-semibold text-gray-600">Status</th>
                                                        <th className="p-3 text-center text-sm font-semibold text-gray-600">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {filtered.map((c) => (
                                                        <tr key={c.complaint_id} className="hover:bg-gray-50 transition-colors">
                                                            <td className="p-3 font-medium text-gray-900">{c.name || "—"}</td>
                                                            <td className="p-3 text-gray-600 font-mono text-sm">{c.roll_no || "—"}</td>
                                                            <td className="p-3 text-gray-600">{c.year || "—"}</td>
                                                            <td className="p-3">
                                                                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full capitalize">{c.category}</span>
                                                            </td>
                                                            <td className="p-3 text-gray-600 text-sm max-w-[220px] truncate" title={c.description}>{c.description || "—"}</td>
                                                            <td className="p-3 text-center">
                                                                <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${statusColor(c.status)}`}>{c.status}</span>
                                                            </td>
                                                            <td className="p-3 text-center">
                                                                <select
                                                                    className="border border-gray-200 px-3 py-1.5 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none cursor-pointer"
                                                                    value={c.status}
                                                                    onChange={(e) => updateComplaintStatus(c.complaint_id, e.target.value)}
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
                                    );
                                })()}
                            </div>
                        </>
                    )}

                    {/* ================= MANAGE WARDENS ================= */}
                    {activeSection === "wardens" && (
                        <>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-indigo-600">person_add</span>
                                    Assign New Warden
                                </h2>
                                {wardenMsg && (
                                    <p className={`mb-3 text-sm font-medium ${wardenMsg.includes("success") ? "text-green-600" : "text-red-600"}`}>
                                        {wardenMsg}
                                    </p>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                    <input
                                        type="text"
                                        className="border border-gray-200 p-3 rounded-lg"
                                        placeholder="Warden name"
                                        value={wardenName}
                                        onChange={(e) => setWardenName(e.target.value)}
                                    />
                                    <input
                                        type="email"
                                        className="border border-gray-200 p-3 rounded-lg"
                                        placeholder="Warden email (Google)"
                                        value={wardenEmail}
                                        onChange={(e) => setWardenEmail(e.target.value)}
                                    />
                                    <select
                                        className="border border-gray-200 p-3 rounded-lg"
                                        value={wardenHostelId}
                                        onChange={(e) => setWardenHostelId(e.target.value)}
                                    >
                                        <option value="">Select Hostel</option>
                                        {hostels.map((h) => (
                                            <option key={h.hostel_id} value={h.hostel_id}>
                                                {h.hostel_name} (Year {h.for_year})
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={addWarden}
                                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition font-medium"
                                    >
                                        Assign Warden
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-indigo-600">supervisor_account</span>
                                    Current Wardens
                                </h2>
                                {wardens.length === 0 ? (
                                    <p className="text-gray-500">No wardens assigned yet.</p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="p-3 text-left text-sm font-semibold text-gray-600">Name</th>
                                                    <th className="p-3 text-left text-sm font-semibold text-gray-600">Email</th>
                                                    <th className="p-3 text-left text-sm font-semibold text-gray-600">Hostel</th>
                                                    <th className="p-3 text-left text-sm font-semibold text-gray-600">Type</th>
                                                    <th className="p-3 text-left text-sm font-semibold text-gray-600">Year</th>
                                                    <th className="p-3 text-center text-sm font-semibold text-gray-600">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {wardens.map((w) => (
                                                    <tr key={w.warden_id} className="hover:bg-gray-50">
                                                        <td className="p-3 text-gray-900 font-medium">{w.name}</td>
                                                        <td className="p-3 text-gray-600">{w.email}</td>
                                                        <td className="p-3 text-gray-600">{w.hostel_name}</td>
                                                        <td className="p-3">
                                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${w.hostel_type === "Boys" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"}`}>
                                                                {w.hostel_type}
                                                            </span>
                                                        </td>
                                                        <td className="p-3 text-gray-600">Year {w.for_year}</td>
                                                        <td className="p-3 text-center">
                                                            <button
                                                                onClick={() => deleteWarden(w.warden_id)}
                                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                                                title="Remove warden"
                                                            >
                                                                <span className="material-symbols-outlined text-lg">delete</span>
                                                            </button>
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

                    {/* ================= FEE STRUCTURE MANAGEMENT ================= */}
                    {activeSection === "fees" && (
                        <>
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Fee Structure Management</h2>
                                <p className="text-gray-500 mt-1">Set the semester period, add components, review, and submit.</p>
                            </div>

                            {/* Year-Gender Selector — at the top */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-3">Select Year & Gender</label>
                                <div className="flex flex-wrap gap-2">
                                    {validCombos.map((c) => (
                                        <button
                                            key={`${c.year}-${c.gender}`}
                                            onClick={() => { setFeeYear(String(c.year)); setFeeGender(c.gender); }}
                                            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${feeYear === String(c.year) && feeGender === c.gender
                                                ? "bg-blue-600 text-white shadow-md"
                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                }`}
                                        >
                                            {c.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Semester Period + Add Components — single card */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
                                {/* Semester Period */}
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-5">
                                    <label className="block text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-blue-600">date_range</span>
                                        Semester Period
                                    </label>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <div className="flex-1 min-w-[160px]">
                                            <p className="text-xs text-blue-600 font-semibold mb-1">FROM</p>
                                            <input
                                                type="date"
                                                className="w-full border border-blue-200 bg-white p-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                value={feePeriodFrom}
                                                onChange={(e) => setFeePeriodFrom(e.target.value)}
                                            />
                                        </div>
                                        <span className="text-blue-400 font-bold mt-4">→</span>
                                        <div className="flex-1 min-w-[160px]">
                                            <p className="text-xs text-blue-600 font-semibold mb-1">TO</p>
                                            <input
                                                type="date"
                                                className="w-full border border-blue-200 bg-white p-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                value={feePeriodTo}
                                                onChange={(e) => setFeePeriodTo(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    {feePeriodFrom && feePeriodTo && (
                                        <p className="text-xs text-blue-700 mt-2 font-medium flex items-center gap-1">
                                            <span className="material-symbols-outlined text-xs">check_circle</span>
                                            Period set: {new Date(feePeriodFrom + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} — {new Date(feePeriodTo + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                    )}
                                </div>

                                {/* Add Component */}
                                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-green-600 text-lg">add_circle</span>
                                    Add Fee Components
                                </label>
                                {feeMsg && (
                                    <div className={`mb-3 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 ${feeMsg.includes("success") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                                        <span className="material-symbols-outlined text-lg">{feeMsg.includes("success") ? "check_circle" : "error"}</span>
                                        {feeMsg}
                                    </div>
                                )}
                                <div className="flex gap-3 items-end">
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            className="w-full border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                                            placeholder="Component name (e.g. Hostel Rent)"
                                            value={feeComponent}
                                            onChange={(e) => setFeeComponent(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && addFeeComponent()}
                                        />
                                    </div>
                                    <div className="w-[140px]">
                                        <input
                                            type="number"
                                            className="w-full border border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                                            placeholder="₹ Amount"
                                            value={feeAmount}
                                            onChange={(e) => setFeeAmount(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && addFeeComponent()}
                                        />
                                    </div>
                                    <button
                                        onClick={addFeeComponent}
                                        className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition font-medium text-sm flex items-center gap-1.5 shadow-sm shrink-0"
                                    >
                                        <span className="material-symbols-outlined text-lg">add</span>
                                        Add
                                    </button>
                                </div>
                            </div>

                            {/* Staged Components Preview */}
                            {stagedFees.length > 0 && (
                                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-5 mb-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-amber-600">pending</span>
                                            Pending Components ({stagedFees.length})
                                        </h3>
                                        <span className="text-xs text-amber-600 font-medium">Not submitted yet</span>
                                    </div>
                                    <div className="space-y-2 mb-4">
                                        {stagedFees.map((f) => (
                                            <div key={f.id} className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border border-amber-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                                                    <span className="text-sm font-medium text-gray-900">{f.component}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-bold text-gray-900">₹{f.amount.toLocaleString()}</span>
                                                    <button
                                                        onClick={() => removeStagedFee(f.id)}
                                                        className="text-red-400 hover:text-red-600 p-0.5 hover:bg-red-50 rounded transition-colors"
                                                        title="Remove"
                                                    >
                                                        <span className="material-symbols-outlined text-base">close</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between pt-3 border-t border-amber-200">
                                        <div>
                                            <span className="text-sm font-bold text-amber-900">Staged Total: </span>
                                            <span className="text-lg font-black text-amber-700">₹{stagedFees.reduce((s, f) => s + f.amount, 0).toLocaleString()}</span>
                                        </div>
                                        <button
                                            onClick={() => setShowSubmitConfirm(true)}
                                            className="bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 transition font-bold text-sm flex items-center gap-2 shadow-sm"
                                        >
                                            <span className="material-symbols-outlined text-lg">check_circle</span>
                                            Confirm & Submit All
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Existing Saved Fee Structure */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 text-white">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="font-bold">Saved Fee Structure</h3>
                                            <p className="text-blue-100 text-sm mt-0.5">
                                                Year {feeYear} — {feeGender === "Male" ? "Boys" : "Girls"}
                                            </p>
                                        </div>
                                        {feeData.length > 0 && feeData[0].period_from && feeData[0].period_to && (
                                            <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1">
                                                <span className="material-symbols-outlined text-base">date_range</span>
                                                {new Date(feeData[0].period_from).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })} — {new Date(feeData[0].period_to).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="p-6">
                                    {feeData.length === 0 ? (
                                        <div className="text-center py-8">
                                            <span className="material-symbols-outlined text-5xl text-gray-300 mb-2">receipt_long</span>
                                            <p className="text-gray-400 font-medium">No fee components saved yet.</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="divide-y divide-gray-100">
                                                {feeData.map((f) => (
                                                    <div key={f.id} className="flex items-center justify-between py-3 group">
                                                        {editingFee?.id === f.id ? (
                                                            <div className="flex flex-1 items-center gap-2">
                                                                <input className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1" value={editingFee.component} onChange={(e) => setEditingFee({ ...editingFee, component: e.target.value })} />
                                                                <input type="number" className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-28 text-right" value={editingFee.amount} onChange={(e) => setEditingFee({ ...editingFee, amount: e.target.value })} />
                                                                <button onClick={saveEditFee} className="text-green-600 hover:text-green-800 p-1"><span className="material-symbols-outlined text-lg">check</span></button>
                                                                <button onClick={() => setEditingFee(null)} className="text-gray-400 hover:text-gray-600 p-1"><span className="material-symbols-outlined text-lg">close</span></button>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                                                                    <span className="text-sm font-medium text-gray-900">{f.component}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm font-bold text-gray-900">₹{Number(f.amount).toLocaleString()}</span>
                                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                                                        <button onClick={() => setEditingFee({ id: f.id, component: f.component, fee_type: f.fee_type, amount: f.amount, period_from: f.period_from ? f.period_from.split('T')[0] : '', period_to: f.period_to ? f.period_to.split('T')[0] : '' })} className="text-blue-500 hover:text-blue-700 p-0.5">
                                                                            <span className="material-symbols-outlined text-base">edit</span>
                                                                        </button>
                                                                        <button onClick={() => setDeleteFeeTarget(f)} className="text-red-400 hover:text-red-600 p-0.5">
                                                                            <span className="material-symbols-outlined text-base">delete</span>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-4 pt-4 border-t-2 border-gray-200 flex items-center justify-between">
                                                <span className="text-sm font-bold text-gray-600 uppercase tracking-wider">Total Semester Fee</span>
                                                <span className="text-2xl font-black text-blue-600">₹{totalFee.toLocaleString()}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {/* ================= MANAGE HOSTELS ================= */}
                    {activeSection === "hostels" && (
                        <>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Manage Hostels</h2>
                                    <p className="text-gray-500 mt-1">Add or edit hostel blocks, rooms, and capacity.</p>
                                </div>
                                <button
                                    onClick={() => setShowAddHostel(true)}
                                    className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg hover:bg-emerald-700 transition font-medium text-sm flex items-center gap-1.5"
                                >
                                    <span className="material-symbols-outlined text-lg">add</span>
                                    Add Hostel
                                </button>
                            </div>

                            {hostelMsg && (
                                <div className={`mb-4 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 ${hostelMsg.includes("success") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                                    <span className="material-symbols-outlined text-lg">{hostelMsg.includes("success") ? "check_circle" : "error"}</span>
                                    {hostelMsg}
                                </div>
                            )}

                            {/* Hostel detail view */}
                            {selectedHostel ? (
                                <>
                                    <button
                                        onClick={() => { setSelectedHostel(null); setHostelRooms([]); setHostelMsg(""); }}
                                        className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1 mb-4"
                                    >
                                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                                        Back to all hostels
                                    </button>

                                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900">{selectedHostel.hostel_name}</h3>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${selectedHostel.hostel_type === "Boys" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"}`}>
                                                        {selectedHostel.hostel_type}
                                                    </span>
                                                    <span className="text-sm text-gray-500">Year {selectedHostel.for_year}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500">Rooms: <strong className="text-gray-900">{selectedHostel.total_rooms}</strong></p>
                                                <p className="text-sm text-gray-500">Occupied: <strong className="text-gray-900">{selectedHostel.total_occupied}</strong> / {selectedHostel.total_capacity}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Add Rooms Form */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
                                        <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-emerald-600 text-lg">add_circle</span>
                                            Add Rooms
                                        </label>
                                        <div className="flex flex-wrap gap-3 items-end">
                                            <div>
                                                <p className="text-xs text-gray-500 font-semibold mb-1">From Room #</p>
                                                <input type="number" className="border border-gray-200 p-3 rounded-lg w-28 text-sm" placeholder="e.g. 101" value={addRoomStart} onChange={(e) => setAddRoomStart(e.target.value)} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-semibold mb-1">To Room #</p>
                                                <input type="number" className="border border-gray-200 p-3 rounded-lg w-28 text-sm" placeholder="e.g. 120" value={addRoomEnd} onChange={(e) => setAddRoomEnd(e.target.value)} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-semibold mb-1">Capacity</p>
                                                <select className="border border-gray-200 p-3 rounded-lg text-sm" value={addRoomCapacity} onChange={(e) => setAddRoomCapacity(e.target.value)}>
                                                    <option value="1">1 (Single)</option>
                                                    <option value="2">2 (Double)</option>
                                                    <option value="3">3 (Triple)</option>
                                                    <option value="4">4 (Quad)</option>
                                                </select>
                                            </div>
                                            <button
                                                onClick={addRoomsToHostel}
                                                className="bg-emerald-600 text-white px-5 py-3 rounded-lg hover:bg-emerald-700 transition font-medium text-sm flex items-center gap-1.5"
                                            >
                                                <span className="material-symbols-outlined text-lg">add</span>
                                                Add Rooms
                                            </button>
                                        </div>
                                    </div>

                                    {/* Rooms Grid */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-emerald-600">meeting_room</span>
                                            Rooms ({hostelRooms.length})
                                        </h3>
                                        {hostelRooms.length === 0 ? (
                                            <div className="text-center py-8">
                                                <span className="material-symbols-outlined text-5xl text-gray-300 mb-2">door_front</span>
                                                <p className="text-gray-400 font-medium">No rooms added yet.</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                                {hostelRooms.map((rm) => {
                                                    const isFull = rm.occupied_count >= rm.capacity;
                                                    const isEmpty = rm.occupied_count === 0;
                                                    return (
                                                        <div key={rm.room_id} className={`group relative rounded-lg border-2 p-3 transition-all ${isFull ? "border-red-200 bg-red-50" : isEmpty ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"
                                                            }`}>
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="text-sm font-bold text-gray-900">#{rm.room_number}</span>
                                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isFull ? "bg-red-200 text-red-700" : isEmpty ? "bg-green-200 text-green-700" : "bg-amber-200 text-amber-700"
                                                                    }`}>
                                                                    {isFull ? "Full" : isEmpty ? "Empty" : "Partial"}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-gray-600">
                                                                {rm.occupied_count}/{rm.capacity} beds
                                                            </p>
                                                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1.5">
                                                                <div
                                                                    className={`h-1.5 rounded-full ${isFull ? "bg-red-500" : isEmpty ? "bg-green-500" : "bg-amber-500"}`}
                                                                    style={{ width: `${(rm.occupied_count / rm.capacity) * 100}%` }}
                                                                ></div>
                                                            </div>
                                                            <button
                                                                onClick={() => setDeleteRoomTarget(rm)}
                                                                className="absolute top-1 right-1 text-red-400 hover:text-red-600 p-0.5 rounded hover:bg-red-100 transition-colors opacity-0 group-hover:opacity-100"
                                                                title="Delete room"
                                                            >
                                                                <span className="material-symbols-outlined text-sm">close</span>
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                /* Hostel Cards Grid */
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {adminHostels.length === 0 ? (
                                        <div className="col-span-full text-center py-12">
                                            <span className="material-symbols-outlined text-5xl text-gray-300 mb-2">apartment</span>
                                            <p className="text-gray-400 font-medium">No hostels found.</p>
                                        </div>
                                    ) : (
                                        adminHostels.map((h) => {
                                            const vacant = h.total_capacity - h.total_occupied;
                                            const occupancyPct = h.total_capacity > 0 ? Math.round((h.total_occupied / h.total_capacity) * 100) : 0;
                                            return (
                                                <div
                                                    key={h.hostel_id}
                                                    onClick={() => { setSelectedHostel(h); fetchHostelRooms(h.hostel_id); setHostelMsg(""); }}
                                                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all cursor-pointer group"
                                                >
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${h.hostel_type === "Boys" ? "bg-blue-50 text-blue-600" : "bg-pink-50 text-pink-600"}`}>
                                                            <span className="material-symbols-outlined">apartment</span>
                                                        </div>
                                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${h.hostel_type === "Boys" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"}`}>
                                                            {h.hostel_type} — Year {h.for_year}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-lg font-bold text-gray-900 mb-3">{h.hostel_name}</h3>
                                                    <div className="grid grid-cols-3 gap-2 mb-3">
                                                        <div className="text-center">
                                                            <p className="text-lg font-black text-gray-900">{h.total_rooms}</p>
                                                            <p className="text-[10px] text-gray-500 font-semibold uppercase">Rooms</p>
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-lg font-black text-emerald-600">{vacant}</p>
                                                            <p className="text-[10px] text-gray-500 font-semibold uppercase">Vacant</p>
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-lg font-black text-blue-600">{h.total_occupied}</p>
                                                            <p className="text-[10px] text-gray-500 font-semibold uppercase">Occupied</p>
                                                        </div>
                                                    </div>
                                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full transition-all ${occupancyPct >= 90 ? "bg-red-500" : occupancyPct >= 60 ? "bg-amber-500" : "bg-emerald-500"}`}
                                                            style={{ width: `${occupancyPct}%` }}
                                                        ></div>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1.5 text-right">{occupancyPct}% occupied</p>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    {/* ================= REPORTS ================= */}
                    {activeSection === "reports" && (
                        <>
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
                                <p className="text-gray-500 mt-1">View summary reports for occupancy, fees, and complaints.</p>
                            </div>

                            {/* Report Tabs */}
                            <div className="flex gap-2 mb-6">
                                {[{ key: "occupancy", label: "Occupancy", icon: "apartment" }, { key: "fees", label: "Fees", icon: "payments" }, { key: "complaints", label: "Complaints", icon: "report_problem" }].map(t => (
                                    <button
                                        key={t.key}
                                        onClick={() => setReportType(t.key)}
                                        className={`px-4 py-2.5 rounded-lg font-medium text-sm flex items-center gap-1.5 transition-all ${reportType === t.key
                                            ? "bg-orange-600 text-white shadow-md shadow-orange-600/20"
                                            : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-lg">{t.icon}</span>
                                        {t.label}
                                    </button>
                                ))}
                            </div>

                            {/* Occupancy Report */}
                            {reportType === "occupancy" && (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
                                            <p className="text-3xl font-black text-blue-600">{occupancyReport.reduce((s, h) => s + Number(h.total_capacity), 0)}</p>
                                            <p className="text-xs text-gray-500 font-semibold uppercase mt-1">Total Beds</p>
                                        </div>
                                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
                                            <p className="text-3xl font-black text-emerald-600">{occupancyReport.reduce((s, h) => s + Number(h.total_occupied), 0)}</p>
                                            <p className="text-xs text-gray-500 font-semibold uppercase mt-1">Occupied</p>
                                        </div>
                                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
                                            <p className="text-3xl font-black text-amber-600">{occupancyReport.reduce((s, h) => s + Number(h.vacant), 0)}</p>
                                            <p className="text-xs text-gray-500 font-semibold uppercase mt-1">Vacant</p>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                        <table className="w-full">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="p-3 text-left text-sm font-semibold text-gray-600">Hostel</th>
                                                    <th className="p-3 text-left text-sm font-semibold text-gray-600">Type</th>
                                                    <th className="p-3 text-left text-sm font-semibold text-gray-600">Year</th>
                                                    <th className="p-3 text-center text-sm font-semibold text-gray-600">Rooms</th>
                                                    <th className="p-3 text-center text-sm font-semibold text-gray-600">Capacity</th>
                                                    <th className="p-3 text-center text-sm font-semibold text-gray-600">Occupied</th>
                                                    <th className="p-3 text-center text-sm font-semibold text-gray-600">Vacant</th>
                                                    <th className="p-3 text-center text-sm font-semibold text-gray-600">Occupancy %</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {occupancyReport.map(h => {
                                                    const pct = h.total_capacity > 0 ? Math.round((h.total_occupied / h.total_capacity) * 100) : 0;
                                                    return (
                                                        <tr key={h.hostel_id} className="hover:bg-gray-50">
                                                            <td className="p-3 font-medium text-gray-900">{h.hostel_name}</td>
                                                            <td className="p-3">
                                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${h.hostel_type === "Boys" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"}`}>
                                                                    {h.hostel_type}
                                                                </span>
                                                            </td>
                                                            <td className="p-3 text-gray-600">{h.for_year}</td>
                                                            <td className="p-3 text-center text-gray-600">{h.total_rooms}</td>
                                                            <td className="p-3 text-center text-gray-600">{h.total_capacity}</td>
                                                            <td className="p-3 text-center font-bold text-gray-900">{h.total_occupied}</td>
                                                            <td className="p-3 text-center text-emerald-600 font-bold">{h.vacant}</td>
                                                            <td className="p-3 text-center">
                                                                <span className={`px-2 py-1 text-xs font-bold rounded-full ${pct >= 90 ? "bg-red-100 text-red-700" : pct >= 60 ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                                                                    {pct}%
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}

                            {/* Fee Report */}
                            {reportType === "fees" && (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
                                            <p className="text-3xl font-black text-blue-600">₹{feeReport.reduce((s, r) => s + r.total_expected, 0).toLocaleString()}</p>
                                            <p className="text-xs text-gray-500 font-semibold uppercase mt-1">Total Expected Revenue</p>
                                        </div>
                                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
                                            <p className="text-3xl font-black text-emerald-600">{feeReport.reduce((s, r) => s + r.student_count, 0)}</p>
                                            <p className="text-xs text-gray-500 font-semibold uppercase mt-1">Total Students</p>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                        <table className="w-full">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="p-3 text-left text-sm font-semibold text-gray-600">Year</th>
                                                    <th className="p-3 text-left text-sm font-semibold text-gray-600">Gender</th>
                                                    <th className="p-3 text-center text-sm font-semibold text-gray-600">Students</th>
                                                    <th className="p-3 text-right text-sm font-semibold text-gray-600">Fee / Student</th>
                                                    <th className="p-3 text-right text-sm font-semibold text-gray-600">Total Expected</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {feeReport.map((r, i) => (
                                                    <tr key={i} className="hover:bg-gray-50">
                                                        <td className="p-3 font-medium text-gray-900">Year {r.year}</td>
                                                        <td className="p-3">
                                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${r.gender === "Male" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"}`}>
                                                                {r.gender === "Male" ? "Boys" : "Girls"}
                                                            </span>
                                                        </td>
                                                        <td className="p-3 text-center text-gray-600">{r.student_count}</td>
                                                        <td className="p-3 text-right font-bold text-gray-900">₹{r.fee_per_student.toLocaleString()}</td>
                                                        <td className="p-3 text-right font-black text-blue-600">₹{r.total_expected.toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}

                            {/* Complaint Report */}
                            {reportType === "complaints" && (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
                                            <p className="text-3xl font-black text-gray-900">{complaintReport.reduce((s, c) => s + Number(c.total), 0)}</p>
                                            <p className="text-xs text-gray-500 font-semibold uppercase mt-1">Total</p>
                                        </div>
                                        <div className="bg-white rounded-xl shadow-sm border border-red-100 p-5 text-center">
                                            <p className="text-3xl font-black text-red-600">{complaintReport.reduce((s, c) => s + Number(c.open_count), 0)}</p>
                                            <p className="text-xs text-gray-500 font-semibold uppercase mt-1">Open</p>
                                        </div>
                                        <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-5 text-center">
                                            <p className="text-3xl font-black text-amber-600">{complaintReport.reduce((s, c) => s + Number(c.in_progress), 0)}</p>
                                            <p className="text-xs text-gray-500 font-semibold uppercase mt-1">In Progress</p>
                                        </div>
                                        <div className="bg-white rounded-xl shadow-sm border border-green-100 p-5 text-center">
                                            <p className="text-3xl font-black text-green-600">{complaintReport.reduce((s, c) => s + Number(c.resolved), 0)}</p>
                                            <p className="text-xs text-gray-500 font-semibold uppercase mt-1">Resolved</p>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                        {complaintReport.length === 0 ? (
                                            <div className="text-center py-12">
                                                <span className="material-symbols-outlined text-5xl text-gray-300 mb-2">thumb_up</span>
                                                <p className="text-gray-400 font-medium">No complaints recorded.</p>
                                            </div>
                                        ) : (
                                            <table className="w-full">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="p-3 text-left text-sm font-semibold text-gray-600">Category</th>
                                                        <th className="p-3 text-center text-sm font-semibold text-gray-600">Total</th>
                                                        <th className="p-3 text-center text-sm font-semibold text-gray-600">Open</th>
                                                        <th className="p-3 text-center text-sm font-semibold text-gray-600">In Progress</th>
                                                        <th className="p-3 text-center text-sm font-semibold text-gray-600">Resolved</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {complaintReport.map((c, i) => (
                                                        <tr key={i} className="hover:bg-gray-50">
                                                            <td className="p-3 font-medium text-gray-900 capitalize">{c.category}</td>
                                                            <td className="p-3 text-center font-bold text-gray-900">{c.total}</td>
                                                            <td className="p-3 text-center"><span className="bg-red-100 text-red-700 px-2 py-1 text-xs font-bold rounded-full">{c.open_count}</span></td>
                                                            <td className="p-3 text-center"><span className="bg-amber-100 text-amber-700 px-2 py-1 text-xs font-bold rounded-full">{c.in_progress}</span></td>
                                                            <td className="p-3 text-center"><span className="bg-green-100 text-green-700 px-2 py-1 text-xs font-bold rounded-full">{c.resolved}</span></td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                </>
                            )}
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
                                                await api.post("/announcement", { title: annTitle, description: annDesc, posted_by: user.user_id });
                                                setAnnMsg("Announcement posted successfully!");
                                                setAnnTitle(""); setAnnDesc("");
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

                    {/* ================= SYSTEM SETTINGS ================= */}
                    {activeSection === "settings" && (
                        <>
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
                                <p className="text-gray-500 mt-1">Configure academic year and contact info.</p>
                            </div>

                            {settingsMsg && (
                                <div className={`mb-4 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 ${settingsMsg.includes("success") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                                    <span className="material-symbols-outlined text-lg">{settingsMsg.includes("success") ? "check_circle" : "error"}</span>
                                    {settingsMsg}
                                </div>
                            )}

                            <div className="space-y-6">
                                {/* Academic Year */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-purple-600">school</span>
                                        Academic Year
                                    </h3>
                                    <input
                                        type="text"
                                        className="w-full sm:w-64 border border-gray-200 p-3 rounded-lg text-sm"
                                        placeholder="e.g. 2025-26"
                                        value={settingsForm.academic_year || ""}
                                        onChange={(e) => setSettingsForm({ ...settingsForm, academic_year: e.target.value })}
                                    />
                                </div>

                                {/* Contact Info */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-blue-600">contact_mail</span>
                                        Contact Information
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                            <input
                                                type="email"
                                                className="w-full border border-gray-200 p-3 rounded-lg text-sm"
                                                placeholder="admin@example.com"
                                                value={settingsForm.contact_email || ""}
                                                onChange={(e) => setSettingsForm({ ...settingsForm, contact_email: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                            <input
                                                type="tel"
                                                className="w-full border border-gray-200 p-3 rounded-lg text-sm"
                                                placeholder="+91-XXXXXXXXXX"
                                                value={settingsForm.contact_phone || ""}
                                                onChange={(e) => setSettingsForm({ ...settingsForm, contact_phone: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>


                                {/* Landing Page Content */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-emerald-600">language</span>
                                        Landing Page Content
                                    </h3>
                                    <p className="text-xs text-gray-500 mb-4">Changes here update the live homepage instantly.</p>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">College Name</label>
                                                <input type="text" className="w-full border border-gray-200 p-3 rounded-lg text-sm" value={settingsForm.college_name || ""} onChange={(e) => setSettingsForm({ ...settingsForm, college_name: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                                                <input type="text" className="w-full border border-gray-200 p-3 rounded-lg text-sm" placeholder="e.g. Deemed University" value={settingsForm.college_subtitle || ""} onChange={(e) => setSettingsForm({ ...settingsForm, college_subtitle: e.target.value })} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Hero Subtitle</label>
                                            <textarea className="w-full border border-gray-200 p-3 rounded-lg text-sm resize-y" rows={2} placeholder="Main tagline shown on the hero banner" value={settingsForm.hero_subtitle || ""} onChange={(e) => setSettingsForm({ ...settingsForm, hero_subtitle: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Marquee Text <span className="text-gray-400">(separate items with |)</span></label>
                                            <input type="text" className="w-full border border-gray-200 p-3 rounded-lg text-sm" placeholder="Message 1 | Message 2 | Message 3" value={settingsForm.marquee_text || ""} onChange={(e) => setSettingsForm({ ...settingsForm, marquee_text: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Copyright Text</label>
                                            <input type="text" className="w-full border border-gray-200 p-3 rounded-lg text-sm" placeholder="© 2026 MITS Hostel..." value={settingsForm.copyright_text || ""} onChange={(e) => setSettingsForm({ ...settingsForm, copyright_text: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Footer Brand Text</label>
                                            <input type="text" className="w-full border border-gray-200 p-3 rounded-lg text-sm" value={settingsForm.footer_brand_text || ""} onChange={(e) => setSettingsForm({ ...settingsForm, footer_brand_text: e.target.value })} />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Footer Phone</label>
                                                <input type="tel" className="w-full border border-gray-200 p-3 rounded-lg text-sm" value={settingsForm.contact_phone_footer || ""} onChange={(e) => setSettingsForm({ ...settingsForm, contact_phone_footer: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Footer Email</label>
                                                <input type="email" className="w-full border border-gray-200 p-3 rounded-lg text-sm" value={settingsForm.contact_email_footer || ""} onChange={(e) => setSettingsForm({ ...settingsForm, contact_email_footer: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                                <input type="text" className="w-full border border-gray-200 p-3 rounded-lg text-sm" value={settingsForm.college_address || ""} onChange={(e) => setSettingsForm({ ...settingsForm, college_address: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={saveSettings}
                                        disabled={settingsSaving}
                                        className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition font-bold text-sm flex items-center gap-2 shadow-lg shadow-purple-600/20 disabled:opacity-50"
                                    >
                                        <span className="material-symbols-outlined text-lg">{settingsSaving ? "hourglass_top" : "save"}</span>
                                        {settingsSaving ? "Saving..." : "Save Settings"}
                                    </button>
                                    <button
                                        onClick={() => { setSettingsForm({ ...settings }); setSettingsMsg(""); }}
                                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-lg">undo</span>
                                        Reset
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ===== ADD HOSTEL MODAL ===== */}
                    {showAddHostel && (
                        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAddHostel(false)}>
                            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-emerald-600">add_home</span>
                                        Add New Hostel
                                    </h3>
                                    <button onClick={() => setShowAddHostel(false)} className="text-gray-400 hover:text-gray-600 p-1">
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Hostel Name</label>
                                        <input type="text" className="w-full border border-gray-200 p-3 rounded-lg" placeholder="e.g. Block A" value={newHostelName} onChange={(e) => setNewHostelName(e.target.value)} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                            <select className="w-full border border-gray-200 p-3 rounded-lg" value={newHostelType} onChange={(e) => setNewHostelType(e.target.value)}>
                                                <option value="Boys">Boys</option>
                                                <option value="Girls">Girls</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                                            <select className="w-full border border-gray-200 p-3 rounded-lg" value={newHostelYear} onChange={(e) => setNewHostelYear(e.target.value)}>
                                                <option value="1">Year 1</option>
                                                <option value="2">Year 2</option>
                                                <option value="3">Year 3</option>
                                                <option value="4">Year 4</option>
                                            </select>
                                        </div>
                                    </div>
                                    <button
                                        onClick={addHostel}
                                        className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition font-bold flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-lg">check</span>
                                        Create Hostel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ===== DELETE ROOM CONFIRMATION MODAL ===== */}
                    {deleteRoomTarget && (
                        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={() => setDeleteRoomTarget(null)}>
                            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-red-600 text-3xl">delete_forever</span>
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-lg font-bold text-gray-900">Delete Room?</h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Delete room <strong>#{deleteRoomTarget.room_number}</strong> (capacity: {deleteRoomTarget.capacity})? This action cannot be undone.
                                        </p>
                                    </div>
                                    <div className="flex gap-3 w-full mt-2">
                                        <button
                                            onClick={() => setDeleteRoomTarget(null)}
                                            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={deleteRoom}
                                            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                            Yes, Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ================= MANAGE STUDENTS ================= */}
                    {activeSection === "students" && (
                        <>
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Manage Students</h2>
                                <p className="text-gray-500 mt-1">View, search, and manage all hostel students.</p>
                            </div>

                            {/* Search & Filters */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1">
                                        <div className="relative">
                                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                                            <input
                                                type="text"
                                                className="w-full border border-gray-200 pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                                                placeholder="Search by name, roll number, or branch..."
                                                value={studentSearch}
                                                onChange={(e) => setStudentSearch(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && setStudentFetchTrigger(t => t + 1)}
                                            />
                                        </div>
                                    </div>
                                    <select
                                        className="border border-gray-200 px-4 py-3 rounded-lg text-sm"
                                        value={studentYear}
                                        onChange={(e) => { setStudentYear(e.target.value); setStudentFetchTrigger(t => t + 1); }}
                                    >
                                        <option value="">All Years</option>
                                        <option value="1">Year 1</option>
                                        <option value="2">Year 2</option>
                                        <option value="3">Year 3</option>
                                        <option value="4">Year 4</option>
                                    </select>
                                    <select
                                        className="border border-gray-200 px-4 py-3 rounded-lg text-sm"
                                        value={studentGender}
                                        onChange={(e) => { setStudentGender(e.target.value); setStudentFetchTrigger(t => t + 1); }}
                                    >
                                        <option value="">All Genders</option>
                                        <option value="Male">Boys</option>
                                        <option value="Female">Girls</option>
                                    </select>

                                    <button
                                        onClick={() => setStudentFetchTrigger(t => t + 1)}
                                        className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition font-medium text-sm flex items-center gap-1.5 shrink-0"
                                    >
                                        <span className="material-symbols-outlined text-lg">search</span>
                                        Search
                                    </button>
                                </div>
                            </div>

                            {/* Student Count Badge */}
                            <div className="flex items-center gap-2 mb-4">
                                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
                                    {students.length} student{students.length !== 1 ? 's' : ''}
                                </span>
                                {(studentYear || studentGender || studentSearch) && (
                                    <button
                                        onClick={() => { setStudentYear(""); setStudentGender(""); setStudentSearch(""); setTimeout(() => setStudentFetchTrigger(t => t + 1), 0); }}
                                        className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                                    >
                                        <span className="material-symbols-outlined text-sm">close</span>
                                        Clear filters
                                    </button>
                                )}
                            </div>

                            {/* Student Table */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                {studentsLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : students.length === 0 ? (
                                    <div className="text-center py-12">
                                        <span className="material-symbols-outlined text-5xl text-gray-300 mb-2">group_off</span>
                                        <p className="text-gray-400 font-medium">No students found.</p>
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
                                                    <th className="p-3 text-left text-sm font-semibold text-gray-600">Room</th>
                                                    <th className="p-3 text-left text-sm font-semibold text-gray-600">Hostel</th>
                                                    <th className="p-3 text-center text-sm font-semibold text-gray-600">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {students.map((st) => (
                                                    <tr key={st.student_id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="p-3 text-gray-900 font-medium">{st.name}</td>
                                                        <td className="p-3 text-gray-600 font-mono text-sm">{st.roll_no || "—"}</td>
                                                        <td className="p-3 text-gray-600">{st.course || "—"}</td>
                                                        <td className="p-3 text-gray-600">{st.year || "—"}</td>
                                                        <td className="p-3">
                                                            {st.gender ? (
                                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${st.gender === "Male" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"}`}>
                                                                    {st.gender === "Male" ? "Boy" : "Girl"}
                                                                </span>
                                                            ) : "—"}
                                                        </td>
                                                        <td className="p-3 text-gray-600">{st.room_number || <span className="text-gray-400 italic">Not Allocated</span>}</td>
                                                        <td className="p-3 text-gray-600">{st.hostel_name || "—"}</td>
                                                        <td className="p-3 text-center">
                                                            <button
                                                                onClick={() => { setSelectedStudent(st); fetchStudentDetail(st.student_id); }}
                                                                className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-1.5 rounded-lg transition-colors"
                                                                title="View details"
                                                            >
                                                                <span className="material-symbols-outlined text-lg">visibility</span>
                                                            </button>
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

                    {/* ===== STUDENT DETAIL MODAL ===== */}
                    {selectedStudent && studentDetail && (
                        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => { setSelectedStudent(null); setStudentDetail(null); }}>
                            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-blue-600">person</span>
                                        Student Details
                                    </h3>
                                    <button
                                        onClick={() => { setSelectedStudent(null); setStudentDetail(null); }}
                                        className="text-gray-400 hover:text-gray-600 p-1"
                                    >
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                </div>

                                <div className="flex items-center gap-4 mb-6">
                                    {studentDetail.profile_picture ? (
                                        <img src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${studentDetail.profile_picture}`} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-gray-200" />
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
                                            {(studentDetail.name || "S").charAt(0)}
                                        </div>
                                    )}
                                    <div>
                                        <h4 className="text-xl font-bold text-gray-900">{studentDetail.name}</h4>
                                        <p className="text-sm text-gray-500">{studentDetail.email}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    {[
                                        { label: "Roll No", value: studentDetail.roll_no, icon: "tag" },
                                        { label: "Course", value: studentDetail.course, icon: "school" },
                                        { label: "Year", value: studentDetail.year, icon: "calendar_today" },
                                        { label: "Gender", value: studentDetail.gender, icon: "wc" },
                                        { label: "Phone", value: studentDetail.phone, icon: "call" },
                                        { label: "Room", value: studentDetail.room_number || "Not Allocated", icon: "bed" },
                                        { label: "Hostel", value: studentDetail.hostel_name || "None", icon: "apartment" },
                                        { label: "Allocated On", value: studentDetail.allocation_date ? new Date(studentDetail.allocation_date).toLocaleDateString('en-IN') : "—", icon: "event" },
                                    ].map((item) => (
                                        <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                                            <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                                                <span className="material-symbols-outlined text-sm">{item.icon}</span>
                                                <span className="text-xs font-semibold uppercase tracking-wider">{item.label}</span>
                                            </div>
                                            <p className="text-sm font-bold text-gray-900">{item.value || "—"}</p>
                                        </div>
                                    ))}
                                </div>

                                {studentDetail.room_number && (
                                    <button
                                        onClick={() => setDeallocateTarget(studentDetail)}
                                        className="w-full bg-red-50 border border-red-200 text-red-700 py-3 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-lg">person_remove</span>
                                        Deallocate from Room {studentDetail.room_number}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ===== DEALLOCATE CONFIRMATION MODAL ===== */}
                    {deallocateTarget && (
                        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={() => setDeallocateTarget(null)}>
                            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-red-600 text-3xl">person_remove</span>
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-lg font-bold text-gray-900">Deallocate Student?</h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Remove <strong>{deallocateTarget.name}</strong> from Room <strong>{deallocateTarget.room_number}</strong> ({deallocateTarget.hostel_name})?
                                        </p>
                                    </div>
                                    <div className="flex gap-3 w-full mt-2">
                                        <button
                                            onClick={() => setDeallocateTarget(null)}
                                            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={deallocateStudent}
                                            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-lg">check</span>
                                            Yes, Deallocate
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ================= GALLERY ================= */}
                    {activeSection === "gallery" && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Upload New Image */}
                            <div className="lg:col-span-1 border border-gray-100 bg-white shadow-sm rounded-xl p-6 h-fit">
                                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-pink-600">add_photo_alternate</span>
                                    Upload Image
                                </h3>

                                {galleryMsg && (
                                    <div className={`mb-4 px-3 py-2 rounded-lg text-sm font-medium ${galleryMsg.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                        {galleryMsg}
                                    </div>
                                )}

                                <form onSubmit={uploadGalleryImage} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Image category</label>
                                        <select
                                            className="w-full border border-gray-200 px-4 py-2.5 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 outline-none"
                                            value={galleryCategory}
                                            onChange={(e) => setGalleryCategory(e.target.value)}
                                        >
                                            <option value="main">Main Slideshow</option>
                                            <option value="boys">Boys Hostel</option>
                                            <option value="girls">Girls Hostel</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Caption (Optional)</label>
                                        <input
                                            type="text"
                                            className="w-full border border-gray-200 px-4 py-2.5 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 outline-none"
                                            placeholder="Enter image caption..."
                                            value={galleryCaption}
                                            onChange={(e) => setGalleryCaption(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Select File</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
                                            onChange={(e) => setGalleryFile(e.target.files[0])}
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={galleryUploading}
                                        className="w-full bg-pink-600 text-white font-bold py-2.5 rounded-lg shadow-md hover:bg-pink-700 transition flex justify-center items-center gap-2 mt-4"
                                    >
                                        {galleryUploading ? "Uploading..." : <><span className="material-symbols-outlined">upload</span> Upload to {galleryCategory === 'main' ? 'Slideshow' : galleryCategory === 'boys' ? 'Boys' : 'Girls'}</>}
                                    </button>
                                </form>
                            </div>

                            {/* Existing Images */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Categories Filter */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex gap-2">
                                    <h3 className="text-sm font-bold text-gray-700 w-full mb-3 flex items-center gap-2 hidden">
                                        <span className="material-symbols-outlined text-gray-500">filter_list</span>
                                        Manage Images
                                    </h3>
                                </div>

                                {["main", "boys", "girls"].map(cat => {
                                    const catImages = galleryImages.filter(img => img.category === cat);
                                    if (catImages.length === 0) return null;
                                    return (
                                        <div key={cat} className="bg-white border border-gray-100 shadow-sm rounded-xl p-5">
                                            <h3 className="text-base font-bold text-gray-900 mb-4 capitalize border-b border-gray-100 pb-2">
                                                {cat === 'main' ? 'Main Slideshow' : `${cat} Hostel`} Images
                                            </h3>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                                {catImages.map(img => (
                                                    <div key={img.id} className="group relative rounded-lg overflow-hidden border border-gray-200 aspect-square">
                                                        <img 
                                                            src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${img.image_path}`} 
                                                            alt={img.caption || ""} 
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                                                            <div className="flex justify-end">
                                                                <button 
                                                                    onClick={() => deleteGalleryImage(img.id)}
                                                                    className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition"
                                                                    title="Delete image"
                                                                >
                                                                    <span className="material-symbols-outlined text-sm">delete</span>
                                                                </button>
                                                            </div>
                                                            {img.caption && (
                                                                <p className="text-white text-xs font-medium truncate bg-black/40 px-2 py-1 rounded">
                                                                    {img.caption}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                                {galleryImages.length === 0 && (
                                    <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-10 text-center text-gray-500">
                                        <span className="material-symbols-outlined text-4xl mb-2 text-gray-300">image_not_supported</span>
                                        <p>No images in gallery yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ===== SUBMIT CONFIRMATION MODAL ===== */}
                    {showSubmitConfirm && (
                        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowSubmitConfirm(false)}>
                            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-green-600 text-3xl">task_alt</span>
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-lg font-bold text-gray-900">Submit Fee Structure?</h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            You are about to add <strong>{stagedFees.length} component{stagedFees.length !== 1 ? 's' : ''}</strong> for
                                            <strong> Year {feeYear} — {feeGender === "Male" ? "Boys" : "Girls"}</strong>.
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-3 w-full space-y-1.5">
                                        {stagedFees.map((f) => (
                                            <div key={f.id} className="flex justify-between text-sm">
                                                <span className="text-gray-700">{f.component}</span>
                                                <span className="font-bold text-gray-900">₹{f.amount.toLocaleString()}</span>
                                            </div>
                                        ))}
                                        <div className="border-t border-gray-200 pt-1.5 flex justify-between text-sm font-bold">
                                            <span className="text-gray-700">Total</span>
                                            <span className="text-blue-600">₹{stagedFees.reduce((s, f) => s + f.amount, 0).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    {feePeriodFrom && feePeriodTo && (
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-xs">date_range</span>
                                            Period: {new Date(feePeriodFrom + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} — {new Date(feePeriodTo + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                    )}
                                    <div className="flex gap-3 w-full mt-2">
                                        <button
                                            onClick={() => setShowSubmitConfirm(false)}
                                            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={submitStagedFees}
                                            disabled={submittingFees}
                                            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {submittingFees ? (
                                                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Submitting...</>
                                            ) : (
                                                <><span className="material-symbols-outlined text-lg">check</span> Yes, Submit</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ===== DELETE CONFIRMATION MODAL ===== */}
                    {deleteFeeTarget && (
                        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDeleteFeeTarget(null)}>
                            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-red-600 text-3xl">delete_forever</span>
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-lg font-bold text-gray-900">Delete Component?</h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Are you sure you want to delete <strong>"{deleteFeeTarget.component}"</strong> (₹{Number(deleteFeeTarget.amount).toLocaleString()})?
                                        </p>
                                    </div>
                                    <div className="flex gap-3 w-full mt-2">
                                        <button
                                            onClick={() => setDeleteFeeTarget(null)}
                                            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={confirmDeleteFee}
                                            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                            Yes, Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}
