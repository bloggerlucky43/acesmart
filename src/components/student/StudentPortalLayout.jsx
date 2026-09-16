import { useState } from "react";
import { Box } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import { useStudentPortal } from "../../libs/StudentPortalProvider";
import StudentLoginCard from "./StudentLoginCard";
import StudentSidebar from "./StudentSidebar";
import StudentTopbar from "./StudentTopbar";

const StudentPortalLayout = () => {
  const { isAuthenticated } = useStudentPortal();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  if (!isAuthenticated) {
    return <StudentLoginCard />;
  }

  return (
    <Box minH="100vh" bg="#F1F5F9">
      <StudentSidebar />

      {mobileNavOpen && (
        <Box
          position="fixed"
          top={0}
          left={0}
          w="100vw"
          h="100vh"
          zIndex={60}
        >
          <Box
            position="absolute"
            top={0}
            left={0}
            w="100%"
            h="100%"
            bg="rgba(15, 23, 42, 0.6)"
            backdropFilter="blur(4px)"
            onClick={() => setMobileNavOpen(false)}
          />
          <Box position="absolute" top={0} left={0} h="100%">
            <StudentSidebar
              isMobile
              onNavigate={() => setMobileNavOpen(false)}
            />
          </Box>
        </Box>
      )}

      <StudentTopbar onOpenMobileNav={() => setMobileNavOpen(true)} />

      <Box as="main" ml={{ base: 0, lg: "260px" }} pt="72px" minH="100vh">
        <Box
          maxW="1200px"
          mx="auto"
          px={{ base: 4, md: 6 }}
          py={{ base: 5, md: 7 }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default StudentPortalLayout;
