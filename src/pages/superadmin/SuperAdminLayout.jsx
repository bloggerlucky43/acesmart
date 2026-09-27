import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Flex,
  Text,
  Button,
  Icon,
  Badge,
} from "@chakra-ui/react";
import {
  FaChartLine,
  FaUniversity,
  FaCreditCard,
  FaUsers,
  FaShieldAlt,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaExternalLinkAlt,
  FaBookOpen,
  FaLock,
  FaExclamationTriangle,
} from "react-icons/fa";
import { useAuth } from "../../libs/AuthProvider";
import { getAdminPinStatusApi } from "../../api-endpoint/sms/superAdminEndpoints";
import AdminPinPromptModal from "../../components/superadmin/AdminPinPromptModal";

export default function SuperAdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [hasPin, setHasPin] = useState(null);
  const [pinModalOpen, setPinModalOpen] = useState(false);

  const fetchPinStatus = async () => {
    try {
      const res = await getAdminPinStatusApi();
      if (res.success) {
        setHasPin(res.hasPin);
      }
    } catch (_) {}
  };

  useEffect(() => {
    fetchPinStatus();
  }, []);

  const navLinks = [
    { label: "Executive Overview", path: "/superadmin/dashboard", icon: FaChartLine },
    { label: "Institutions & Schools", path: "/superadmin/institutions", icon: FaUniversity },
    { label: "Curriculum Subjects", path: "/superadmin/subjects", icon: FaBookOpen },
    { label: "Global Transactions", path: "/superadmin/transactions", icon: FaCreditCard },
    { label: "Universal Users", path: "/superadmin/users", icon: FaUsers },
  ];

  const handleLogout = async () => {
    if (logout) await logout();
    navigate("/login");
  };

  return (
    <Box minH="100vh" bg="#0B0F19" color="#F8FAFC" display="flex">
      {/* Sidebar - Desktop */}
      <Box
        as="aside"
        w="260px"
        bg="#111827"
        borderRight="1px solid #1F2937"
        p={4}
        display={{ base: "none", lg: "flex" }}
        flexDirection="column"
        justifyContent="space-between"
        position="fixed"
        top={0}
        bottom={0}
        left={0}
        zIndex={100}
      >
        <Box>
          {/* Logo / Brand Header */}
          <Flex align="center" gap={3} px={2} py={3} mb={6} borderBottom="1px solid #1F2937">
            <Box
              w="38px"
              h="38px"
              borderRadius="xl"
              bg="linear-gradient(135deg, #10B981 0%, #059669 100%)"
              display="flex"
              alignItems="center"
              justifyContent="center"
              boxShadow="0 4px 14px rgba(16, 185, 129, 0.4)"
            >
              <Icon as={FaShieldAlt} color="white" boxSize={5} />
            </Box>
            <Box>
              <Text fontSize="15px" fontWeight="900" color="white" letterSpacing="-0.3px">
                AceSmart <Text as="span" color="#10B981">Control</Text>
              </Text>
              <Badge bg="#064E3B" color="#6EE7B7" fontSize="9px" fontWeight="800" px={1.5} borderRadius="sm">
                Super Admin
              </Badge>
            </Box>
          </Flex>

          {/* Navigation Links */}
          <Flex direction="column" gap={1.5}>
            {navLinks.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link key={item.path} to={item.path} style={{ textDecoration: "none" }}>
                  <Flex
                    align="center"
                    gap={3}
                    px={3.5}
                    py={2.5}
                    borderRadius="xl"
                    fontSize="13px"
                    fontWeight="700"
                    transition="all 0.15s ease"
                    bg={isActive ? "#1E293B" : "transparent"}
                    color={isActive ? "#10B981" : "#94A3B8"}
                    border={isActive ? "1px solid #334155" : "1px solid transparent"}
                    _hover={{ bg: "#1F2937", color: "white" }}
                  >
                    <Icon as={item.icon} boxSize={4} color={isActive ? "#10B981" : "#64748B"} />
                    <Text>{item.label}</Text>
                  </Flex>
                </Link>
              );
            })}
          </Flex>
        </Box>

        {/* Footer / Account Info */}
        <Box pt={4} borderTop="1px solid #1F2937">
          <Flex align="center" gap={2.5} mb={3} px={1}>
            <Box
              w="32px"
              h="32px"
              borderRadius="full"
              bg="#1E293B"
              border="1px solid #334155"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontWeight="900"
              fontSize="12px"
              color="#10B981"
            >
              SA
            </Box>
            <Box overflow="hidden">
              <Text fontSize="12px" fontWeight="800" color="white" noOfLines={1}>
                {user?.name || "Super Admin"}
              </Text>
              <Text fontSize="10px" color="#64748B" noOfLines={1}>
                {user?.email || "acesmartsupport@gmail.com"}
              </Text>
            </Box>
          </Flex>

          <Button
            size="sm"
            w="100%"
            h="36px"
            bg="#1E293B"
            color="#EF4444"
            border="1px solid #374151"
            borderRadius="xl"
            fontWeight="700"
            fontSize="12px"
            _hover={{ bg: "#2E1010", borderColor: "#7F1D1D" }}
            onClick={handleLogout}
          >
            <Icon as={FaSignOutAlt} mr={2} boxSize={3.5} />
            Sign Out
          </Button>
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box
        flex="1"
        ml={{ base: 0, lg: "260px" }}
        minH="100vh"
        display="flex"
        flexDirection="column"
      >
        {/* Top Navbar */}
        <Flex
          as="header"
          h="64px"
          bg="#111827"
          borderBottom="1px solid #1F2937"
          px={{ base: 4, md: 8 }}
          align="center"
          justify="space-between"
          position="sticky"
          top={0}
          zIndex={90}
        >
          {/* Mobile Menu Toggle & Title */}
          <Flex align="center" gap={3}>
            <Button
              display={{ base: "flex", lg: "none" }}
              size="sm"
              variant="ghost"
              color="white"
              p={1}
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
            >
              <Icon as={mobileNavOpen ? FaTimes : FaBars} boxSize={5} />
            </Button>
            <Text fontSize="15px" fontWeight="900" color="white">
              Platform Master Console
            </Text>
          </Flex>

          {/* Quick status badge & PIN Manager */}
          <Flex align="center" gap={3}>
            {hasPin === false ? (
              <Button
                size="xs"
                bg="rgba(245, 158, 11, 0.15)"
                color="#F59E0B"
                border="1px solid #F59E0B"
                borderRadius="lg"
                fontWeight="800"
                h="30px"
                px={3}
                onClick={() => setPinModalOpen(true)}
                _hover={{ bg: "rgba(245, 158, 11, 0.25)" }}
              >
                <Icon as={FaExclamationTriangle} mr={1.5} boxSize={3} />
                Set Up Master PIN
              </Button>
            ) : (
              <Button
                size="xs"
                bg="#1E293B"
                color="#10B981"
                border="1px solid #374151"
                borderRadius="lg"
                fontWeight="800"
                h="30px"
                px={3}
                onClick={() => setPinModalOpen(true)}
                _hover={{ bg: "#334155" }}
              >
                <Icon as={FaShieldAlt} mr={1.5} boxSize={3} />
                Security PIN Active
              </Button>
            )}

            <Badge
              bg="#064E3B"
              color="#6EE7B7"
              border="1px solid #059669"
              px={2.5}
              py={1}
              borderRadius="full"
              fontSize="11px"
              fontWeight="800"
            >
              ● Production Active
            </Badge>
          </Flex>
        </Flex>

        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <Box
            bg="#111827"
            borderBottom="1px solid #1F2937"
            p={4}
            display={{ base: "block", lg: "none" }}
          >
            <Flex direction="column" gap={2}>
              {navLinks.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileNavOpen(false)}
                  style={{ textDecoration: "none" }}
                >
                  <Flex
                    align="center"
                    gap={3}
                    px={3}
                    py={2.5}
                    borderRadius="xl"
                    bg={location.pathname.startsWith(item.path) ? "#1E293B" : "transparent"}
                    color={location.pathname.startsWith(item.path) ? "#10B981" : "#94A3B8"}
                    fontWeight="700"
                    fontSize="13px"
                  >
                    <Icon as={item.icon} boxSize={4} />
                    <Text>{item.label}</Text>
                  </Flex>
                </Link>
              ))}
              <Button
                mt={2}
                size="sm"
                bg="#1E293B"
                color="#EF4444"
                borderRadius="xl"
                onClick={handleLogout}
              >
                Sign Out
              </Button>
            </Flex>
          </Box>
        )}

        {/* Page Content */}
        <Box p={{ base: 4, sm: 6, md: 8 }} flex="1">
          {children}
        </Box>
      </Box>

      {/* SuperAdmin Master PIN Management Modal */}
      <AdminPinPromptModal
        isOpen={pinModalOpen}
        onClose={() => {
          setPinModalOpen(false);
          fetchPinStatus();
        }}
        onSuccess={() => {
          setPinModalOpen(false);
          fetchPinStatus();
        }}
        actionTitle="SuperAdmin Master Security PIN"
        actionDescription="Your Master PIN safeguards Ghost Logins, Tier Overrides, and Global Curriculum additions."
      />
    </Box>
  );
}
