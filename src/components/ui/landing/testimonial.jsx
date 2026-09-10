import { Box, Text, Stack, Flex, Icon } from "@chakra-ui/react";
import Marquee from "react-fast-marquee";
import { FaStar, FaQuoteLeft } from "react-icons/fa";
import { MdVerified } from "react-icons/md";

const testimonials = [
  {
    name: "Mr. Adewale Tijani",
    role: "Head of ICT & Assessment",
    school: "King's College Alumni Academy, Lagos",
    feedback:
      "AceSmart made setting our internal mock CBT exams effortless. Importing 500 students via Excel and having results graded automatically saved our teachers over 40 hours of manual marking.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    rating: 5,
  },
  {
    name: "Miss Zainab Kareem",
    role: "JAMB Candidate (Score: 318)",
    school: "Apex Premier Tutorial Center, Abuja",
    feedback:
      "Practicing on AceSmart felt identical to the real JAMB UTME center. The timer pressure, question palette, and instant review helped build the exact stamina I needed on exam day.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    rating: 5,
  },
  {
    name: "Dr. Samuel Okon",
    role: "Principal & Science Coordinator",
    school: "Grace High School, Port Harcourt",
    feedback:
      "The MathJax formula rendering is pure magic. We previously had issues formatting complex chemical equations and calculus problems on other CBT apps; AceSmart renders them flawlessly.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
    rating: 5,
  },
  {
    name: "Deborah Adeyemi",
    role: "WAEC Candidate (8 Distinctions)",
    school: "St. Michael's College, Ibadan",
    feedback:
      "The face verification gave us confidence that testing was strictly fair. The past question explanations for Biology and Chemistry were clear, concise, and super helpful.",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80",
    rating: 5,
  },
  {
    name: "Engr. Farouk Bello",
    role: "Director of Studies",
    school: "Horizon CBT Academy, Kano",
    feedback:
      "We tested over 1,200 students in one weekend across our computer labs. Zero downtime, zero data loss, and students got their printable result slips the moment they hit submit.",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80",
    rating: 5,
  },
];

const Testimonial = ({ testimonialsRef }) => {
  return (
    <Box
      ref={testimonialsRef}
      py={20}
      bg="linear-gradient(135deg, #4A0E78 0%, #6A1B9A 50%, #7B1FA2 100%)"
      position="relative"
      overflow="hidden"
    >
      {/* Background glow accents */}
      <Box
        position="absolute"
        top="-20%"
        right="10%"
        w="400px"
        h="400px"
        borderRadius="full"
        bg="radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, rgba(255,255,255,0) 70%)"
        filter="blur(40px)"
        pointerEvents="none"
      />

      <Box maxW="1320px" mx="auto" px={{ base: 4, md: 8 }} mb={12} textAlign="center">
        <Text
          fontSize="12px"
          fontWeight="800"
          color="purple.200"
          letterSpacing="1px"
          textTransform="uppercase"
          mb={2}
        >
          Voices of Success
        </Text>
        <Text
          fontSize={{ base: "28px", md: "38px" }}
          fontWeight="800"
          color="white"
          fontFamily="'Outfit', sans-serif"
          letterSpacing="-0.5px"
          mb={3}
        >
          Trusted by Nigeria's Leading Educators & High Achievers
        </Text>
        <Text fontSize={{ base: "15px", md: "17px" }} color="purple.100" maxW="640px" mx="auto">
          See how teachers, principals, and candidates use AceSmart to elevate exam readiness and institutional excellence.
        </Text>
      </Box>

      {/* Marquee Row */}
      <Box py={2}>
        <Marquee pauseOnHover={true} speed={42} gradient={false}>
          {testimonials.map((t, index) => (
            <Box
              key={index}
              bg="rgba(255, 255, 255, 0.08)"
              backdropFilter="blur(16px)"
              border="1px solid rgba(255, 255, 255, 0.18)"
              p={7}
              mx={4}
              w={{ base: "320px", md: "380px" }}
              borderRadius="24px"
              boxShadow="0 16px 32px rgba(0, 0, 0, 0.2)"
              display="flex"
              flexDirection="column"
              justifyContent="space-between"
              _hover={{
                bg: "rgba(255, 255, 255, 0.13)",
                transform: "translateY(-4px)",
              }}
              transition="all 0.25s ease"
            >
              <Box mb={6}>
                <Flex justify="space-between" align="center" mb={4}>
                  <Flex gap={1}>
                    {[...Array(t.rating)].map((_, r) => (
                      <Icon key={r} as={FaStar} color="#FBBF24" boxSize={3.5} />
                    ))}
                  </Flex>
                  <Icon as={FaQuoteLeft} color="purple.300" opacity={0.6} boxSize={4} />
                </Flex>

                <Text
                  fontSize="14px"
                  color="purple.50"
                  lineHeight="1.6"
                  fontStyle="italic"
                >
                  "{t.feedback}"
                </Text>
              </Box>

              <Flex align="center" gap={3.5} pt={4} borderTop="1px solid rgba(255, 255, 255, 0.12)">
                <Box
                  w="46px"
                  h="46px"
                  borderRadius="full"
                  overflow="hidden"
                  border="2px solid rgba(255,255,255,0.4)"
                  flexShrink={0}
                >
                  <img
                    src={t.avatar}
                    alt={t.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </Box>
                <Box>
                  <Flex align="center" gap={1}>
                    <Text fontSize="15px" fontWeight="700" color="white">
                      {t.name}
                    </Text>
                    <Icon as={MdVerified} color="#34D399" boxSize={4} />
                  </Flex>
                  <Text fontSize="12px" color="purple.200" fontWeight="600">
                    {t.role}
                  </Text>
                  <Text fontSize="11px" color="purple.300">
                    {t.school}
                  </Text>
                </Box>
              </Flex>
            </Box>
          ))}
        </Marquee>
      </Box>
    </Box>
  );
};

export default Testimonial;
