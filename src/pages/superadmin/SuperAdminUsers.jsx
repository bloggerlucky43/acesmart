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
  FaSearch,
  FaTimes,
  FaUserShield,
  FaChalkboardTeacher,
  FaUserCog,
} from "react-icons/fa";
import SuperAdminLayout from "./SuperAdminLayout";
import {
  getSuperAdminUsersApi,
  toggleSuperAdminUserStatusApi,
} from "../../api-endpoint/sms/superAdminEndpoints";
import { toaster } from "../../components/ui/toaster";

export default function SuperAdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [updatingId, setUpdatingId] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await getSuperAdminUsersApi({
        search: searchQuery,
        role: selectedRole,
        limit: 100,
      });
      if (res.success) {
        setUsers(res.data.users || []);
        setTotal(res.data.total || 0);
      }
    } catch (err) {
      console.error("Load users error:", err);
      toaster.create({
        title: "Failed to load users",
        description: err.response?.data?.message || err.message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [selectedRole]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadUsers();
  };

  const handleToggleStatus = async (userId, userEmail) => {
    setUpdatingId(userId);
    try {
      const res = await toggleSuperAdminUserStatusApi(userId);
      if (res.success) {
        toaster.create({
          title: res.message || "User status updated!",
          type: "success",
        });
        loadUsers();
      }
    } catch (err) {
      toaster.create({
        title: "Action Failed",
        description: err.response?.data?.message || "Could not toggle user status",
        type: "error",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <SuperAdminLayout>
      {/* Header */}
      <Flex
        direction={{ base: "column", sm: "row" }}
        justify="space-between"
        align={{ base: "stretch", sm: "center" }}
        gap={4}
        mb={6}
      >
        <Box>
          <Flex align="center" gap={2}>
            <Text fontSize="24px" fontWeight="900" color="white" letterSpacing="-0.5px">
              Universal User Management
            </Text>
            <Badge bg="#1E293B" color="#6EE7B7" fontSize="11px" fontWeight="800" px={2.5} py={0.5} borderRadius="full">
              {total} Total Users
            </Badge>
          </Flex>
          <Text fontSize="13px" color="#94A3B8" mt={0.5}>
            Search across teachers, school administrators, and support agents across all schools.
          </Text>
        </Box>
      </Flex>

      {/* Filter Bar */}
      <Box
        bg="#111827"
        p={4}
        borderRadius="2xl"
        border="1px solid #1F2937"
        mb={6}
      >
        <Flex
          direction={{ base: "column", md: "row" }}
          gap={3}
          align="center"
          justify="space-between"
        >
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} style={{ flex: 1, width: "100%" }}>
            <Flex
              bg="#1E293B"
              border="1px solid #374151"
              borderRadius="xl"
              px={3}
              h="40px"
              align="center"
              gap={2}
            >
              <Icon as={FaSearch} color="#94A3B8" boxSize={3.5} />
              <Input
                placeholder="Search user name, email, phone number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                variant="unstyled"
                fontSize="13px"
                color="white"
                _placeholder={{ color: "#64748B" }}
              />
              {searchQuery && (
                <Button
                  size="xs"
                  variant="ghost"
                  color="#94A3B8"
                  p={0}
                  onClick={() => {
                    setSearchQuery("");
                    loadUsers();
                  }}
                >
                  <Icon as={FaTimes} boxSize={2.5} />
                </Button>
              )}
              <Button
                size="xs"
                bg="#10B981"
                color="white"
                px={3}
                h="28px"
                borderRadius="lg"
                fontWeight="800"
                type="submit"
              >
                Search
              </Button>
            </Flex>
          </form>

          {/* Role Filter */}
          <Flex align="center" gap={2} w={{ base: "100%", md: "auto" }}>
            <Text fontSize="12px" fontWeight="700" color="#94A3B8" whiteSpace="nowrap">
              Role:
            </Text>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              style={{
                height: "40px",
                padding: "0 12px",
                borderRadius: "12px",
                background: "#1E293B",
                border: "1px solid #374151",
                color: "white",
                fontSize: "13px",
                fontWeight: "700",
                outline: "none",
              }}
            >
              <option value="all">All Roles</option>
              <option value="teacher">Teachers</option>
              <option value="institution_admin">School Admins</option>
              <option value="superadmin">Super Admins</option>
            </select>
          </Flex>
        </Flex>
      </Box>

      {/* Users Table */}
      <Box
        bg="#111827"
        borderRadius="2xl"
        border="1px solid #1F2937"
        overflow="hidden"
        boxShadow="0 4px 16px rgba(0,0,0,0.2)"
        mb={8}
      >
        <Box overflowX="auto">
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "#1F2937", borderBottom: "1px solid #374151" }}>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#94A3B8", textTransform: "uppercase" }}>User</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#94A3B8", textTransform: "uppercase" }}>Role</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#94A3B8", textTransform: "uppercase" }}>Assigned School</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#94A3B8", textTransform: "uppercase" }}>Phone</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#94A3B8", textTransform: "uppercase", textAlign: "center" }}>Status</th>
                <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: "800", color: "#94A3B8", textTransform: "uppercase", textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#94A3B8" }}>
                    Loading user directory...
                  </td>
                </tr>
              ) : users.length ? (
                users.map((u) => {
                  const isMaster = u.email === "acesmartsupport@gmail.com";
                  return (
                    <tr
                      key={u.id}
                      style={{ borderBottom: "1px solid #1F2937", transition: "background 0.15s ease" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#1E293B")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "14px 16px" }}>
                        <Text fontSize="13px" fontWeight="800" color="white">
                          {u.name}
                        </Text>
                        <Text fontSize="11px" color="#94A3B8">
                          {u.email}
                        </Text>
                      </td>

                      <td style={{ padding: "14px 16px" }}>
                        <Badge
                          bg={u.role === "superadmin" ? "#064E3B" : u.role === "institution_admin" ? "#312E81" : "#1E293B"}
                          color={u.role === "superadmin" ? "#6EE7B7" : u.role === "institution_admin" ? "#A5B4FC" : "#94A3B8"}
                          border="1px solid #374151"
                          px={2}
                          py={0.5}
                          borderRadius="md"
                          fontSize="10px"
                          fontWeight="800"
                        >
                          {u.role}
                        </Badge>
                      </td>

                      <td style={{ padding: "14px 16px" }}>
                        <Text fontSize="12px" fontWeight="700" color={u.Institution ? "white" : "#64748B"}>
                          {u.Institution?.name || "Global / Unassigned"}
                        </Text>
                        {u.Institution?.code && (
                          <Text fontSize="10px" color="#94A3B8">Code: {u.Institution.code}</Text>
                        )}
                      </td>

                      <td style={{ padding: "14px 16px", fontSize: "12px", color: "#94A3B8" }}>
                        {u.phoneNumber || "-"}
                      </td>

                      <td style={{ padding: "14px 16px", textAlign: "center" }}>
                        {u.isActive !== false ? (
                          <Badge bg="#064E3B" color="#6EE7B7" fontSize="10px" fontWeight="800" borderRadius="full" px={2.5} py={0.5}>
                            Active
                          </Badge>
                        ) : (
                          <Badge bg="#450A0A" color="#FCA5A5" fontSize="10px" fontWeight="800" borderRadius="full" px={2.5} py={0.5}>
                            Suspended
                          </Badge>
                        )}
                      </td>

                      <td style={{ padding: "14px 16px", textAlign: "right" }}>
                        {!isMaster && (
                          <Button
                            size="xs"
                            bg={u.isActive !== false ? "#1E293B" : "#10B981"}
                            color={u.isActive !== false ? "#EF4444" : "white"}
                            border="1px solid #374151"
                            borderRadius="lg"
                            fontWeight="800"
                            fontSize="11px"
                            h="28px"
                            px={3}
                            _hover={{ opacity: 0.85 }}
                            onClick={() => handleToggleStatus(u.id, u.email)}
                            loading={updatingId === u.id}
                          >
                            {u.isActive !== false ? "Deactivate" : "Activate"}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} style={{ padding: "36px", textAlign: "center", color: "#64748B" }}>
                    No users matching this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Box>
      </Box>
    </SuperAdminLayout>
  );
}
