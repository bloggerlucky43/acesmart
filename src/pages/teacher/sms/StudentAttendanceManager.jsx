import { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  Icon,
  Badge,
  Input,
} from "@chakra-ui/react";
import {
  FaUsers,
  FaCheck,
  FaTimes,
  FaClock,
  FaSave,
  FaCalendarAlt,
  FaCheckCircle,
} from "react-icons/fa";
import {
  getClassArmsApi,
  getClassAttendanceByDateApi,
  markStudentAttendanceBatchApi,
} from "../../../api-endpoint/sms/smsEndpoints";
import { toaster } from "../../../components/ui/toaster";
import DashboardLayout from "../../../constants/dashboardlayout";

export default function StudentAttendanceManager() {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch Class Arms
  useEffect(() => {
    const loadClasses = async () => {
      try {
        const res = await getClassArmsApi();
        if (res.success && res.data.length > 0) {
          setClasses(res.data);
          setSelectedClassId(res.data[0].id);
        }
      } catch (err) {
        console.error("Load classes error:", err);
      }
    };
    loadClasses();
  }, []);

  // Fetch Attendance Roster when Class or Date changes
  useEffect(() => {
    if (!selectedClassId) return;

    const loadRoster = async () => {
      setLoading(true);
      try {
        const res = await getClassAttendanceByDateApi(selectedClassId, selectedDate);
        if (res.success) {
          setRoster(res.data.roster);
        }
      } catch (err) {
        console.error("Load roster error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadRoster();
  }, [selectedClassId, selectedDate]);

  const handleStatusChange = (studentId, status) => {
    setRoster((prev) =>
      prev.map((item) =>
        item.studentId === studentId ? { ...item, status } : item
      )
    );
  };

  const handleMarkAll = (status) => {
    setRoster((prev) => prev.map((item) => ({ ...item, status })));
    toaster.create({
      title: `All marked as ${status.toUpperCase()}`,
      type: "info",
    });
  };

  const handleSaveAttendance = async () => {
    if (!selectedClassId) return;
    setSaving(true);
    try {
      const attendanceList = roster.map((item) => ({
        studentId: item.studentId,
        status: item.status,
        remark: item.remark || "",
      }));

      const res = await markStudentAttendanceBatchApi({
        classArmId: selectedClassId,
        date: selectedDate,
        attendanceList,
      });

      if (res.success) {
        toaster.create({
          title: "Attendance Saved Successfully!",
          description: `Class attendance recorded for ${selectedDate}`,
          type: "success",
        });
      }
    } catch (error) {
      toaster.create({
        title: error.response?.data?.message || "Failed to save attendance",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const presentCount = roster.filter((r) => r.status === "present").length;
  const absentCount = roster.filter((r) => r.status === "absent").length;
  const lateCount = roster.filter((r) => r.status === "late").length;
  const attendanceRate = roster.length > 0 ? ((presentCount / roster.length) * 100).toFixed(0) : 0;

  return (
    <DashboardLayout>
      <Box
        p={{ base: 4, md: 8 }}
        pt={{ base: "84px", md: "88px" }}
        pl={{ base: 4, lg: "260px" }}
        maxW="1300px"
        mx="auto"
      >
        {/* Header */}
        <Flex
          direction={{ base: "column", sm: "row" }}
          justify="space-between"
          align={{ base: "flex-start", sm: "center" }}
          gap={4}
          mb={8}
        >
          <Box>
            <Text fontSize="24px" fontWeight="900" color="#0F172A" letterSpacing="-0.5px">
              Student Classroom Attendance
            </Text>
            <Text fontSize="13px" color="#64748B">
              Daily roll call and attendance tracking by class arm
            </Text>
          </Box>

          <Button
            bg="linear-gradient(135deg, #10B981 0%, #059669 100%)"
            color="white"
            borderRadius="xl"
            px={5}
            h="42px"
            fontWeight="700"
            boxShadow="0 4px 14px rgba(16, 185, 129, 0.3)"
            _hover={{ opacity: 0.95 }}
            onClick={handleSaveAttendance}
            loading={saving}
          >
            <Icon as={FaSave} mr={2} boxSize={3.5} />
            Save Attendance
          </Button>
        </Flex>

        {/* Filter Controls Bar */}
        <Flex
          bg="white"
          p={5}
          borderRadius="2xl"
          border="1px solid #E2E8F0"
          gap={4}
          flexWrap="wrap"
          align="center"
          justify="space-between"
          mb={6}
          boxShadow="0 2px 10px rgba(0,0,0,0.02)"
        >
          <Flex gap={4} flexWrap="wrap" align="center">
            {/* Class Selector */}
            <Box>
              <Text fontSize="11px" fontWeight="700" color="#64748B" mb={1}>
                SELECT CLASS ARM
              </Text>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                style={{
                  height: "40px",
                  padding: "0 12px",
                  borderRadius: "10px",
                  border: "1px solid #CBD5E1",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#0F172A",
                  background: "#F8FAFC",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.level || "Class"})
                  </option>
                ))}
              </select>
            </Box>

            {/* Date Selector */}
            <Box>
              <Text fontSize="11px" fontWeight="700" color="#64748B" mb={1}>
                DATE
              </Text>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                h="40px"
                borderRadius="10px"
                border="1px solid #CBD5E1"
                bg="#F8FAFC"
                fontSize="13px"
                fontWeight="600"
              />
            </Box>
          </Flex>

          {/* Quick Mark All Buttons */}
          <Flex gap={2} align="center">
            <Text fontSize="12px" color="#64748B" fontWeight="600" mr={1}>
              Quick Action:
            </Text>
            <Button
              size="xs"
              bg="#ECFDF5"
              color="#065F46"
              border="1px solid #A7F3D0"
              fontWeight="700"
              borderRadius="lg"
              onClick={() => handleMarkAll("present")}
            >
              Mark All Present
            </Button>
            <Button
              size="xs"
              bg="#FEF2F2"
              color="#991B1B"
              border="1px solid #FECACA"
              fontWeight="700"
              borderRadius="lg"
              onClick={() => handleMarkAll("absent")}
            >
              Mark All Absent
            </Button>
          </Flex>
        </Flex>

        {/* Attendance Statistics Strip */}
        <Flex gap={4} mb={6} flexWrap="wrap">
          <Box flex="1" minW="140px" bg="white" p={4} borderRadius="xl" border="1px solid #E2E8F0">
            <Text fontSize="12px" color="#64748B">Class Enrolled</Text>
            <Text fontSize="22px" fontWeight="900" color="#0F172A">{roster.length}</Text>
          </Box>
          <Box flex="1" minW="140px" bg="white" p={4} borderRadius="xl" border="1px solid #E2E8F0">
            <Text fontSize="12px" color="#10B981">Present</Text>
            <Text fontSize="22px" fontWeight="900" color="#10B981">{presentCount}</Text>
          </Box>
          <Box flex="1" minW="140px" bg="white" p={4} borderRadius="xl" border="1px solid #E2E8F0">
            <Text fontSize="12px" color="#EF4444">Absent</Text>
            <Text fontSize="22px" fontWeight="900" color="#EF4444">{absentCount}</Text>
          </Box>
          <Box flex="1" minW="140px" bg="white" p={4} borderRadius="xl" border="1px solid #E2E8F0">
            <Text fontSize="12px" color="#F59E0B">Late</Text>
            <Text fontSize="22px" fontWeight="900" color="#F59E0B">{lateCount}</Text>
          </Box>
          <Box flex="1" minW="140px" bg="white" p={4} borderRadius="xl" border="1px solid #E2E8F0">
            <Text fontSize="12px" color="#4338CA">Attendance Rate</Text>
            <Text fontSize="22px" fontWeight="900" color="#4338CA">{attendanceRate}%</Text>
          </Box>
        </Flex>

        {/* Student Roster Table */}
        <Box
          bg="white"
          borderRadius="2xl"
          border="1px solid #E2E8F0"
          overflow="hidden"
          boxShadow="0 4px 16px rgba(0,0,0,0.02)"
        >
          <Box overflowX="auto">
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                  <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B" }}>S/N</th>
                  <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B" }}>STUDENT NAME</th>
                  <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B" }}>STUDENT CODE</th>
                  <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B" }}>GENDER</th>
                  <th style={{ padding: "12px 16px", fontSize: "12px", color: "#64748B", textAlign: "center" }}>ATTENDANCE STATUS</th>
                </tr>
              </thead>
              <tbody>
                {roster.length ? (
                  roster.map((student, idx) => (
                    <tr key={student.studentId} style={{ borderBottom: "1px solid #F1F5F9" }}>
                      <td style={{ padding: "14px 16px", fontSize: "13px", color: "#64748B" }}>
                        {idx + 1}
                      </td>
                      <td style={{ padding: "14px 16px", fontWeight: "700", color: "#0F172A", fontSize: "14px" }}>
                        {student.name}
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: "13px", color: "#4338CA", fontWeight: "600" }}>
                        {student.studentCode}
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: "13px", color: "#64748B" }}>
                        {student.gender || "Unspecified"}
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "center" }}>
                        <Flex justify="center" gap={1.5}>
                          {/* Present Button */}
                          <Button
                            size="xs"
                            borderRadius="lg"
                            bg={student.status === "present" ? "#10B981" : "#F1F5F9"}
                            color={student.status === "present" ? "white" : "#64748B"}
                            fontWeight="700"
                            _hover={{ bg: "#10B981", color: "white" }}
                            onClick={() => handleStatusChange(student.studentId, "present")}
                          >
                            P
                          </Button>
                          {/* Absent Button */}
                          <Button
                            size="xs"
                            borderRadius="lg"
                            bg={student.status === "absent" ? "#EF4444" : "#F1F5F9"}
                            color={student.status === "absent" ? "white" : "#64748B"}
                            fontWeight="700"
                            _hover={{ bg: "#EF4444", color: "white" }}
                            onClick={() => handleStatusChange(student.studentId, "absent")}
                          >
                            A
                          </Button>
                          {/* Late Button */}
                          <Button
                            size="xs"
                            borderRadius="lg"
                            bg={student.status === "late" ? "#F59E0B" : "#F1F5F9"}
                            color={student.status === "late" ? "white" : "#64748B"}
                            fontWeight="700"
                            _hover={{ bg: "#F59E0B", color: "white" }}
                            onClick={() => handleStatusChange(student.studentId, "late")}
                          >
                            L
                          </Button>
                          {/* Excused Button */}
                          <Button
                            size="xs"
                            borderRadius="lg"
                            bg={student.status === "excused" ? "#3B82F6" : "#F1F5F9"}
                            color={student.status === "excused" ? "white" : "#64748B"}
                            fontWeight="700"
                            _hover={{ bg: "#3B82F6", color: "white" }}
                            onClick={() => handleStatusChange(student.studentId, "excused")}
                          >
                            E
                          </Button>
                        </Flex>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ padding: "32px", textAlign: "center", color: "#94A3B8" }}>
                      No students enrolled in this class yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Box>
        </Box>
      </Box>
    </DashboardLayout>
  );
}
