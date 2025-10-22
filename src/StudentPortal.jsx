import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const StudentPortal = () => {
    const location = useLocation();

    const [isValidToken, setIsValidToken] = useState(false);
    const [tokenChecked, setTokenChecked] = useState(false);
    const [studentId, setStudentId] = useState("");
    const [studentData, setStudentData] = useState(null);
    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [status, setStatus] = useState("Present");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [userCoords, setUserCoords] = useState(null);

    // 🆕 Store detailed location info
    const [locationDetails, setLocationDetails] = useState({
        displayName: "",
        street: "",
        suburb: ""
    });

    const allowedLat = -34.925711;
    const allowedLng = 138.600064;
    const maxDistanceMeters = 1000;

    const getDistanceFromLatLonInMeters = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) *
            Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    // 🧭 Reverse geocoding to get suburb, street, and display name
    const fetchLocationName = async (lat, lon) => {
        try {
            const res = await fetch(`http://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`);
            const data = await res.json();

            if (data && data.address) {
                const {
                    road,
                    suburb,
                    neighbourhood,
                    city,
                    town,
                    village
                } = data.address;

                const displayName = data.display_name || "";
                const resolvedSuburb = suburb || neighbourhood || city || town || village || "";

                setLocationDetails({
                    displayName,
                    street: road || "",
                    suburb: resolvedSuburb
                });
            } else {
                setLocationDetails({ displayName: "Unknown location", street: "", suburb: "" });
            }
        } catch (err) {
            setLocationDetails({ displayName: "Unknown location", street: "", suburb: "" });
        }
    };

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const token = queryParams.get("token");

        if (!token) {
            setIsValidToken(false);
            setTokenChecked(true);
            return;
        }

        try {
            const timestamp = parseInt(atob(token), 10);
            const now = Date.now();
            const thirteenHours = 13 * 60 * 60 * 1000; // 46,800,000 ms

            setIsValidToken(now - timestamp <= thirteenHours);
        } catch {
            setIsValidToken(false);
        } finally {
            setTokenChecked(true);
        }
    }, [location.search]);

    const resetForm = () => {
        setStudentData(null);
        setStudentId("");
        setSelectedCourseId("");
        setStatus("Present");
        setUserCoords(null);
        setLocationDetails({ displayName: "", street: "", suburb: "" });
    };

    useEffect(() => {
        if (message || error) {
            const timeout = setTimeout(() => {
                resetForm();
                setMessage("");
                setError("");
            }, 2500);
            return () => clearTimeout(timeout);
        }
    }, [message, error]);

    const handleValidate = async () => {
        setLoading(true);
        setError("");
        setMessage("");

        try {
            const res = await fetch(`http://localhost/abbey_app/Abbey_backend/student_portal.php?action=validate&student_id=${encodeURIComponent(studentId)}`);
            const data = await res.json();

            if (data.status === "success" && data.student) {
                setStudentData(data.student);
                if (data.student.courses.length === 1) {
                    setSelectedCourseId(data.student.courses[0].course_id);
                }
            } else {
                setError(data.message || "Student not found");
            }
        } catch {
            setError("Server error. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitAttendance = async () => {
        if (!selectedCourseId) {
            setError("Please select a course");
            return;
        }

        setLoading(true);
        setError("");
        setMessage("");

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;

                setUserCoords({ lat: userLat, lng: userLng });
                await fetchLocationName(userLat, userLng);

                const distance = getDistanceFromLatLonInMeters(userLat, userLng, allowedLat, allowedLng);

                if (distance > maxDistanceMeters) {
                    setError(`❌ You are not in the allowed location. Please check in from the designated area.`);
                    setLoading(false);
                    return;
                }

                try {
                    const res = await fetch("http://localhost/abbey_app/Abbey_backend/student_portal.php?action=add", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            student_id: studentData.student_id,
                            course_id: selectedCourseId,
                            status,
                            location: {
                                latitude: userLat,
                                longitude: userLng,
                            },
                        }),
                    });

                    const data = await res.json();

                    if (data.status === "success") {
                        setMessage(data.message || "Attendance submitted successfully");
                    } else {
                        setError(data.message || "Failed to submit attendance");
                    }
                } catch {
                    setError("Server error. Please try again later.");
                } finally {
                    setLoading(false);
                }
            },
            () => {
                setError("Location access denied. Please allow location permission.");
                setLoading(false);
            }
        );
    };

    if (!tokenChecked) return null;

    if (!isValidToken) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded shadow w-full max-w-sm text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
                    <p className="text-gray-700">This QR code has expired or is invalid.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 relative">
            {/* 🔵 Location Info Top Right */}
            {userCoords && locationDetails.displayName && (
                <div className="absolute top-4 right-4 bg-white shadow-md rounded p-3 text-sm text-gray-700 z-50">
                    <strong>📍 Your Location:</strong><br />
                    Street: {locationDetails.street || "N/A"}<br />
                    Suburb: {locationDetails.suburb || "N/A"}<br />
                    Full: {locationDetails.displayName}<br />
                    Coordinates: {userCoords.lat.toFixed(5)}, {userCoords.lng.toFixed(5)}
                </div>
            )}

            <div className="bg-white p-8 rounded shadow w-full max-w-sm">
                <div className="text-center mb-6">
                    <img src="/logo.png" alt="Abbey College Logo" className="mx-auto h-16 w-auto" />
                </div>

                {message && (
                    <p className="mb-4 text-center text-green-600 font-medium">{message}</p>
                )}
                {error && (
                    <p className="mb-4 text-center text-red-600 font-medium">{error}</p>
                )}

                {!studentData && !loading && (
                    <>
                        <input
                            type="text"
                            placeholder="Enter Student ID"
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value)}
                            disabled={loading}
                            className="w-full p-2 border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={handleValidate}
                            disabled={loading || !studentId.trim()}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white p-2 rounded font-semibold transition"
                        >
                            {loading ? "Validating..." : "Submit"}
                        </button>
                    </>
                )}

                {studentData && (
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSubmitAttendance();
                        }}
                        className="mt-6 space-y-4"
                    >
                        <p><strong>Student ID:</strong> {studentData.student_id}</p>
                        <p><strong>Name:</strong> {studentData.student_name}</p>

                        {studentData.courses.length > 1 ? (
                            <label className="block font-semibold">
                                Select Course:
                                <select
                                    value={selectedCourseId}
                                    onChange={(e) => setSelectedCourseId(e.target.value)}
                                    disabled={loading}
                                    className="w-full mt-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">-- Select Course --</option>
                                    {studentData.courses.map((course) => (
                                        <option key={course.course_id} value={course.course_id}>
                                            {course.course_name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        ) : (
                            <p><strong>Course:</strong> {studentData.courses[0]?.course_name || "N/A"}</p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white p-2 rounded font-semibold transition"
                        >
                            {loading ? "Submitting..." : "Check In"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default StudentPortal;
