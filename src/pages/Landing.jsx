import { useRef, useState } from "react";
import { Box, Text, Flex, Icon, useBreakpointValue } from "@chakra-ui/react";
import Navbar from "../components/ui/landing/navbar";
import Heading from "../components/ui/landing/Heading";
import Features from "../components/ui/landing/features";
import Numbers from "../components/ui/landing/numbers";
import Testimonial from "../components/ui/landing/testimonial";
import Register from "../components/auth/register";
import { FaBrain, FaTimes } from "react-icons/fa";
import Login from "../components/auth/login";
import Contact from "../components/ui/landing/contact";
import Footer from "../components/ui/landing/Footer";

function Landing() {
  const [isOpenLogin, setIsOpenLogin] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const headingRef = useRef(null);
  const featureRef = useRef(null);
  const numberRef = useRef(null);
  const testimonialRef = useRef(null);
  const contactRef = useRef(null);
  const isMobile = useBreakpointValue({ base: true, md: false });

  const scrollToSection = (ref, e) => {
    e.preventDefault();
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <Box minH="100vh" overflow="hidden">
      <Box>
        <Navbar
          onNavClick={scrollToSection}
          refs={{
            home: headingRef,
            about: featureRef,
            number: numberRef,
            testimonials: testimonialRef,
            contact: contactRef,
          }}
          onLoginOpen={() => setIsOpenLogin(true)}
          onDrawerOpen={() => setShowDrawer(true)}
          onMenuOpen={() => setShowMenu(true)}
        />

        <Heading homeRef={headingRef} />
        <Features aboutRef={featureRef} />
        <Numbers numberRef={numberRef} />
        <Testimonial testimonialsRef={testimonialRef} />
        <Contact contactRef={contactRef} />
        <Footer />
      </Box>

      {showMenu && (
        <Box position={"fixed"} zIndex={110}>
          <Box
            position="fixed"
            top={0}
            left={0}
            bg="gray.200"
            shadow={"xl"}
            w="80%"
            h="100vh"
            p={6}
          >
            <Flex align="center" justifyContent="space-between" mb={4}>
              <Flex gap={2} align="center">
                <Icon
                  as={FaBrain}
                  boxSize={10}
                  bg="primary"
                  color="white"
                  p={2}
                  borderRadius="md"
                />
                <Text fontSize="xl">
                  Ace<span style={{ color: "#6A1B9A" }}>Smart</span>
                </Text>
              </Flex>

              <Icon
                as={FaTimes}
                boxSize={6}
                color="primary"
                onClick={() => setShowMenu(false)}
              />
            </Flex>

            <Box mt={10} p={2}>
              <Text
                fontSize="xl"
                cursor="pointer"
                _active={{ color: "primary" }}
                onClick={(e) => {
                  setShowMenu(false);
                  scrollToSection(headingRef, e);
                }}
              >
                Home
              </Text>
              <Text
                fontSize="xl"
                mt={2}
                _active={{ color: "primary" }}
                cursor="pointer"
                onClick={(e) => scrollToSection(featureRef, e)}
              >
                Features
              </Text>
              <Text
                fontSize="xl"
                mt={2}
                _active={{ color: "primary" }}
                cursor="pointer"
                onClick={(e) => scrollToSection(testimonialRef, e)}
              >
                Testimonial
              </Text>
              <Text
                fontSize="xl"
                mt={2}
                _active={{ color: "primary" }}
                cursor="pointer"
                onClick={(e) => {
                  setShowMenu(false);
                  scrollToSection(contactRef, e);
                }}
              >
                Contact
              </Text>
              <Text
                fontSize="xl"
                mt={2}
                _active={{ color: "primary" }}
                cursor="pointer"
                onClick={() => {
                  setShowMenu(false);
                  setShowDrawer(true);
                }}
              >
                Sign up
              </Text>
              <Text
                fontSize="xl"
                mt={2}
                _active={{ color: "primary" }}
                cursor="pointer"
                onClick={() => {
                  setShowMenu(false);
                  setIsOpenLogin(true);
                }}
              >
                Login
              </Text>
              <Text cursor="pointer"></Text>
            </Box>
          </Box>
        </Box>
      )}

      {showDrawer && (
        <Box position={"fixed"} top={0} left={0} zIndex={110}>
          <Box
            position="fixed"
            top={0}
            bg="gray.200"
            right={0}
            shadow="xl"
            w={isMobile ? "80%" : "25%"}
            h="100vh"
            p={6}
            transform={showDrawer ? "translateX(0)" : "translateX(100%)"}
            transition="transform 0.3s ease-in-out"
          >
            <Flex justify={"space-between"} align={"center"}>
              <Text fontSize="xl" fontWeight={"bold"} mb={2}>
                Sign Up
              </Text>
              <Icon
                as={FaTimes}
                boxSize={4}
                cursor="pointer"
                onClick={() => setShowDrawer(false)}
              />
            </Flex>
            <Register />
          </Box>
        </Box>
      )}

      {isOpenLogin && (
        <Box position={"fixed"} zIndex={110} top={0} left={0}>
          <Box
            position="fixed"
            top={0}
            bg="gray.200"
            right={0}
            shadow="xl"
            w={isMobile ? "80%" : "25%"}
            h="100vh"
            p={6}
            transform={isOpenLogin ? "translateX(0)" : "translateX(100%)"}
            transition="transform 0.3s ease-in-out"
          >
            <Flex justify={"space-between"} align={"center"} mb={4}>
              <Text fontSize="xl" fontWeight={"bold"}>
                Welcome back
              </Text>
              <Icon
                as={FaTimes}
                boxSize={4}
                cursor="pointer"
                onClick={() => setIsOpenLogin(false)}
              />
            </Flex>
            <Login />
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default Landing;
